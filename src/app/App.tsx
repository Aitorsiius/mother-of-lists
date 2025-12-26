/*
 * Mother Of Lists
 * Copyright (C) 2025 Aitor Gómez Ogueta
 * * Este programa es software libre: puedes redistribuirlo y/o modificarlo 
 * bajo los términos de la Licencia Pública General de GNU según es 
 * publicada por la Free Software Foundation, bien de la versión 3 de 
 * la Licencia, o (a tu elección) cualquier versión posterior.
 */

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
import * as localStorageService from "../services/localStorage";
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
  const [pendingJoinCode, setPendingJoinCode] = useState<string | null>(null);
  
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

    // Cargar listas personales desde almacenamiento local
    const loadData = async () => {
      // Suscribirse a cambios en tiempo real de TODAS las listas del usuario en Firebase
      const unsubscribe = firestoreService.subscribeToUserLists(user.id, async (firebaseLists) => {
        // Recargar listas locales desde almacenamiento para tener datos persistidos
        const personalLists = await localStorageService.loadPersonalListsLocally();
        const localListsMap = new Map(personalLists.map(list => [list.id, list]));
        
        // Usar el estado actual para evitar sobrescribir cambios recientes
        setLists(currentLists => {
          // Crear mapa del estado actual
          const currentListsMap = new Map(currentLists.map(list => [list.id, list]));
          
          // Procesar cada lista de Firebase
          const processedFirebaseLists = firebaseLists.map(firebaseList => {
            const currentList = currentListsMap.get(firebaseList.id);
            
            // Si hay una lista en el estado actual con sharedWith, usarla (prioridad a estado actual)
            const isShared = firebaseList.sharedWith.length > 0 || (currentList && currentList.sharedWith.length > 0);
            
            if (isShared) {
              // Lista compartida: usar de Firebase (tiene los datos más actualizados de todos los participantes)
              return firebaseList;
            } else {
              // Lista personal: preservar items del estado actual o almacenamiento local
              const localList = localListsMap.get(firebaseList.id);
              const itemsSource = currentList?.items || localList?.items || firebaseList.items;
              const updatedAtSource = currentList?.updatedAt || localList?.updatedAt || firebaseList.updatedAt;
              
              return {
                ...firebaseList, // metadata de Firebase (pendingRequests, etc.)
                items: itemsSource, // items del estado actual o locales
                updatedAt: updatedAtSource, // fecha más reciente
              };
            }
          });
          
          // Obtener IDs de listas que están en Firebase
          const firebaseListIds = new Set(firebaseLists.map(list => list.id));
          
          // Filtrar listas locales que NO están en Firebase (usar estado actual primero)
          // Solo incluir listas que sean realmente personales (sin sharedWith)
          const localOnlyLists = currentLists.filter(list => {
            if (firebaseListIds.has(list.id)) {
              return false; // Ya está en Firebase
            }
            // Solo incluir si es personal (sin compartir)
            return localStorageService.isPersonalList(list);
          });
          
          // Combinar: listas procesadas de Firebase + listas solo locales
          return [...processedFirebaseLists, ...localOnlyLists];
        });
        
        setIsLoading(false);
      });

      // Cargar listas locales inicialmente mientras se conecta a Firebase
      const initialPersonalLists = await localStorageService.loadPersonalListsLocally();
      setLists(initialPersonalLists);
      setIsLoading(false);

      return unsubscribe;
    };

    let unsubscribe: (() => void) | undefined;
    loadData().then(unsub => {
      unsubscribe = unsub;
    });

    // Cleanup: cancelar suscripción al desmontar
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
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
      // Crear en Firestore para obtener el código
      if (firestoreService.isConfigured()) {
        await firestoreService.createList(newList);
      }
      
      // Guardar localmente como lista personal
      await localStorageService.addPersonalListLocally(newList);
      
      // Actualizar estado local inmediatamente
      setLists([...lists, newList]);
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
      // Solo actualizar en Firebase si la lista tiene participantes (es compartida)
      // NO actualizar en Firebase si solo tiene pendingRequests sin sharedWith
      const isShared = updatedList.sharedWith.length > 0;
      
      // Actualizar estado local PRIMERO para que sea inmediato
      setLists(lists.map((list) => 
        list.id === updatedList.id ? updatedList : list
      ));
      
      if (isShared) {
        // Lista compartida: actualizar en Firebase
        if (firestoreService.isConfigured()) {
          await firestoreService.updateList(updatedList.id, updatedList);
          // El listener actualizará el estado automáticamente
        }
      } else {
        // Lista personal: guardar localmente (no afecta el estado, ya está actualizado arriba)
        await localStorageService.updatePersonalListLocally(updatedList);
      }
    } catch (error) {
      console.error("Error updating list:", error);
      toast.error(t.errorUpdateList);
    }
  };

  const handleDeleteList = async (listId: string) => {
    try {
      const list = lists.find(l => l.id === listId);
      if (!list) return;
      
      // Verificar si la lista está en Firebase o es solo local
      const isInFirebase = list.pendingRequests.length > 0 || list.sharedWith.length > 0;
      const isPersonal = localStorageService.isPersonalList(list);
      
      if (!isInFirebase && isPersonal) {
        // Lista personal sin solicitudes pendientes: eliminar localmente
        await localStorageService.deletePersonalListLocally(listId);
        setLists(lists.filter((list) => list.id !== listId));
      } else {
        // Lista en Firebase: eliminar también localmente si existe
        if (isPersonal) {
          await localStorageService.deletePersonalListLocally(listId).catch(() => {
            // Si no existe localmente, no hay problema
          });
        }
      }
      
      // Siempre intentar eliminar de Firebase
      if (firestoreService.isConfigured()) {
        await firestoreService.deleteList(listId);
        // El listener actualizará el estado automáticamente
      } else {
        setLists(lists.filter((list) => list.id !== listId));
      }
      
      setSelectedListId(null);
      toast.success(t.listDeletedSuccess);
    } catch (error) {
      console.error("Error deleting list:", error);
      toast.error(t.errorDeleteList);
    }
  };

  const handleApproveRequest = async (listId: string, userId: string) => {
    try {
      const list = lists.find(l => l.id === listId);
      if (!list) return;
      
      const wasPersonal = localStorageService.isPersonalList(list);
      
      // Si era personal, sincronizar items locales a Firebase ANTES de aprobar
      if (wasPersonal && firestoreService.isConfigured()) {
        // Sincronizar toda la lista con Firebase (incluye items locales)
        await firestoreService.updateList(listId, list);
        
        // Eliminar de almacenamiento local ya que ahora será compartida
        await localStorageService.migratePersonalListToShared(listId).catch(() => {});
      }
      
      // No hacer actualización optimista, dejar que Firebase sea la fuente de verdad
      // El listener actualizará automáticamente cuando Firebase confirme el cambio
    } catch (error) {
      console.error("Error handling approve request:", error);
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
          pendingJoinCode={pendingJoinCode}
          onClearPendingCode={() => setPendingJoinCode(null)}
          onBack={() => setSelectedListId(null)}
          onUpdateList={handleUpdateList}
          onDeleteList={handleDeleteList}
          onApproveRequest={handleApproveRequest}
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
