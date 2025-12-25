import { useState, useEffect } from "react";
import { SplashScreen as CapacitorSplashScreen } from '@capacitor/splash-screen';
import { List, User } from "../types";
import { MainView } from "./components/MainView";
import { ListView } from "./components/ListView";
import { SplashScreen } from "./components/SplashScreen";
import { generateListCode } from "../utils/sortItems";
import { toast, Toaster } from "sonner";
import * as firestoreService from "../services/firestore";
import * as authService from "../services/auth";
import { useTheme } from "../hooks/useTheme";
import { useLanguage } from "../hooks/useLanguage";
import { useTranslation } from "../utils/translations";

function App() {
  // Estado del usuario actual
  const [user, setUser] = useState<User | null>(null);

  // Estado de las listas
  const [lists, setLists] = useState<List[]>([]);

  // Vista actual
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Tema e idioma
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();
  const t = useTranslation(language);

  // Inicializar usuario al cargar la app
  useEffect(() => {
    const initUser = async () => {
      try {
        // Autenticar usuario (existente o nuevo)
        const firebaseUser = await authService.verificarUsuario();
        
        // Intentar cargar usuario desde Firestore
        let userData = await firestoreService.getUser(firebaseUser.uid);
        
        if (userData) {
          // Usuario existente en Firestore
          setUser(userData);
        } else {
          // Usuario nuevo, crear en Firestore
          const nombreGuardado = await authService.obtenerNombreLocal();
          const newUser: User = {
            id: firebaseUser.uid,
            name: nombreGuardado || "Usuario",
            nameSet: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          
          await firestoreService.saveUser(newUser);
          setUser(newUser);
        }
      } catch (error) {
        console.error("Error inicializando usuario:", error);
        toast.error(t.errorInitApp);
        // Fallback a usuario temporal
        setUser({
          id: crypto.randomUUID(),
          name: "Usuario",
          nameSet: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    };

    initUser();
  }, []);

  // Cargar datos de las listas cuando el usuario esté listo
  useEffect(() => {
    if (!user) return;

    // Verificar si Firebase está configurado
    if (!firestoreService.isConfigured()) {
      console.warn("Firebase no está configurado. Usando datos de ejemplo.");
      
      // Datos de ejemplo para desarrollo
      const sampleList: List = {
        id: crypto.randomUUID(),
        name: "Lista de ejemplo",
        code: "1234",
        ownerId: user.id,
        sharedWith: [],
        pendingRequests: [],
        items: [
          { id: "1", text: "Leche", checked: false },
          { id: "2", text: "Pan", checked: false },
          { id: "3", text: "Huevos", color: "#ffebee", checked: false },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setLists([sampleList]);
      setIsLoading(false);
      return;
    }

    // Suscribirse a cambios en tiempo real de las listas del usuario
    const unsubscribe = firestoreService.subscribeToUserLists(user.id, (updatedLists) => {
      setLists(updatedLists);
      setIsLoading(false);
    });

    // Cleanup: cancelar suscripción al desmontar
    return () => {
      unsubscribe();
    };
  }, [user]);

  const handleCreateList = async (name: string) => {
    if (!user) return;
    
    // Generar código incremental
    let code: string;
    if (firestoreService.isConfigured()) {
      code = await firestoreService.getNextListCode();
    } else {
      code = generateListCode();
    }
    
    const newList: List = {
      id: crypto.randomUUID(),
      name,
      code,
      ownerId: user.id,
      sharedWith: [],
      pendingRequests: [],
      items: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      // Crear en Firestore si está configurado (el listener actualizará el estado)
      if (firestoreService.isConfigured()) {
        await firestoreService.createList(newList);
        // No navegamos automáticamente a la lista
      } else {
        // Solo en modo offline actualizar el estado local
        setLists([...lists, newList]);
        // No navegamos automáticamente a la lista
      }
    } catch (error) {
      console.error("Error creating list:", error);
      toast.error(t.errorCreateList);
    }
  };

  const handleJoinList = async (code: string) => {
    if (!user) return;
    
    if (!firestoreService.isConfigured()) {
      toast.error(t.firebaseNotConfigured);
      return;
    }

    try {
      const foundList = await firestoreService.findListByCode(code);
      
      if (foundList) {
        // Verificar si el usuario ya está en la lista o tiene solicitud pendiente
        if (foundList.ownerId === user.id) {
          toast.error(t.alreadyOwner);
          return;
        }
        
        if (foundList.sharedWith.includes(user.id)) {
          toast.error(t.alreadyParticipant);
          return;
        }
        
        if (foundList.pendingRequests?.includes(user.id)) {
          toast.error(t.alreadyPending);
          return;
        }

        // Agregar solicitud pendiente
        await firestoreService.addPendingRequest(foundList.id, user.id);
        toast.success(t.requestSentSuccess);
      } else {
        toast.error(t.listCodeNotFound);
      }
    } catch (error) {
      console.error("Error joining list:", error);
      toast.error(t.errorJoinList);
    }
  };

  const handleUpdateList = async (updatedList: List) => {
    try {
      // Actualizar en Firestore si está configurado (no actualizar estado local, el listener lo hará)
      if (firestoreService.isConfigured()) {
        await firestoreService.updateList(updatedList.id, updatedList);
      } else {
        // Solo en modo offline actualizar el estado local
        setLists(lists.map((list) => 
          list.id === updatedList.id ? updatedList : list
        ));
      }
    } catch (error) {
      console.error("Error updating list:", error);
      toast.error(t.errorUpdateList);
    }
  };

  const handleDeleteList = async (listId: string) => {
    try {
      // Eliminar en Firestore si está configurado (no actualizar estado local, el listener lo hará)
      if (firestoreService.isConfigured()) {
        await firestoreService.deleteList(listId);
      } else {
        // Solo en modo offline actualizar el estado local
        setLists(lists.filter((list) => list.id !== listId));
        setSelectedListId(null);
      }
      toast.success(t.listDeletedSuccess);
    } catch (error) {
      console.error("Error deleting list:", error);
      toast.error(t.errorDeleteList);
    }
  };

  const handleUpdateUserName = async (name: string) => {
    if (!user) return;
    
    // Verificar si el nombre ya fue establecido
    if (user.nameSet) {
      return;
    }
    
    // Guardar nombre localmente para persistencia
    await authService.guardarNombreLocal(name);
    
    // Actualizar usuario con nombre establecido
    const updatedUser: User = {
      ...user,
      name,
      nameSet: true,
      updatedAt: new Date(),
    };
    
    // Guardar en Firestore
    try {
      await firestoreService.saveUser(updatedUser);
      setUser(updatedUser);
    } catch (error) {
      console.error("Error actualizando nombre:", error);
      toast.error(t.errorSetName);
    }
  };

  const selectedList = lists.find((list) => list.id === selectedListId);

  // Ocultar splash screen de Capacitor y mostrar la personalizada
  useEffect(() => {
    CapacitorSplashScreen.hide();
  }, []);

  // Mostrar splash screen personalizada mientras carga
  if (isLoading || !user) {
    return <SplashScreen />;
  }

  return (
    <>
      {selectedList ? (
        <ListView
          list={selectedList}
          currentUserId={user.id}
          onBack={() => setSelectedListId(null)}
          onUpdateList={handleUpdateList}
          onDeleteList={handleDeleteList}
          translations={t}
        />
      ) : (
        <MainView
          user={user}
          lists={lists}
          onSelectList={setSelectedListId}
          onCreateList={handleCreateList}
          onJoinList={handleJoinList}
          onUpdateUserName={handleUpdateUserName}
          onToggleTheme={toggleTheme}
          theme={theme}
          onToggleLanguage={toggleLanguage}
          language={language}
          translations={t}
        />
      )}
      <Toaster position="top-center" />
    </>
  );
}

export default App;
