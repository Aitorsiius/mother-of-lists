import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  arrayUnion,
  arrayRemove,
  Timestamp,
  onSnapshot,
  Unsubscribe,
  orderBy,
  limit
} from "firebase/firestore";
import { db, isConfigured } from "../config/firebase";
import { List, User } from "../types";

/**
 * Obtener todas las listas de un usuario
 */
export const getLists = async (userId: string): Promise<List[]> => {
  try {
    if (!isConfigured()) {
      throw new Error("Firebase no está configurado");
    }

    const listsRef = collection(db, "lists");
    
    // Obtener listas donde el usuario es dueño o está compartido
    const ownerQuery = query(listsRef, where("ownerId", "==", userId));
    const sharedQuery = query(listsRef, where("sharedWith", "array-contains", userId));
    
    const [ownerSnapshot, sharedSnapshot] = await Promise.all([
      getDocs(ownerQuery),
      getDocs(sharedQuery)
    ]);
    
    const ownerLists = ownerSnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date()
    })) as List[];
    
    const sharedLists = sharedSnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date()
    })) as List[];
    
    // Combinar y eliminar duplicados
    const allLists = [...ownerLists, ...sharedLists];
    const uniqueLists = allLists.filter((list, index, self) =>
      index === self.findIndex(l => l.id === list.id)
    );
    
    return uniqueLists;
  } catch (error) {
    throw error;
  }
};

/**
 * Crear una nueva lista
 */
export const createList = async (list: List): Promise<void> => {
  try {
    if (!isConfigured()) {
      throw new Error("Firebase no está configurado");
    }

    const listRef = doc(db, "lists", list.id);
    await setDoc(listRef, {
      ...list,
      createdAt: Timestamp.fromDate(list.createdAt),
      updatedAt: Timestamp.fromDate(list.updatedAt)
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Actualizar una lista existente
 */
export const updateList = async (listId: string, updates: Partial<List>): Promise<void> => {
  try {
    if (!isConfigured()) {
      throw new Error("Firebase no está configurado");
    }

    const listRef = doc(db, "lists", listId);
    
    // Crear objeto de actualización limpio (sin valores undefined)
    const updateData: any = {
      updatedAt: Timestamp.fromDate(new Date())
    };

    // Copiar solo los campos que no son undefined
    Object.keys(updates).forEach(key => {
      let value = (updates as any)[key];
      
      // Limpiar valores undefined de los items
      if (key === 'items' && Array.isArray(value)) {
        value = value.map(item => {
          const cleanItem: any = {};
          Object.keys(item).forEach(itemKey => {
            if (item[itemKey] !== undefined) {
              cleanItem[itemKey] = item[itemKey];
            }
          });
          return cleanItem;
        });
      }
      
      if (value !== undefined) {
        updateData[key] = value;
      }
    });

    // Convertir fechas si existen en los updates
    if (updates.createdAt) {
      updateData.createdAt = Timestamp.fromDate(updates.createdAt);
    }

    await updateDoc(listRef, updateData);
  } catch (error) {
    throw error;
  }
};

/**
 * Eliminar una lista
 */
export const deleteList = async (listId: string): Promise<void> => {
  try {
    if (!isConfigured()) {
      throw new Error("Firebase no está configurado");
    }

    const listRef = doc(db, "lists", listId);
    await deleteDoc(listRef);
  } catch (error) {
    throw error;
  }
};

/**
 * Buscar lista por código
 */
export const findListByCode = async (code: string): Promise<List | null> => {
  try {
    if (!isConfigured()) {
      throw new Error("Firebase no está configurado");
    }

    const listsRef = collection(db, "lists");
    const q = query(listsRef, where("code", "==", code));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const docData = querySnapshot.docs[0].data();
    return {
      ...docData,
      id: querySnapshot.docs[0].id,
      createdAt: docData.createdAt?.toDate() || new Date(),
      updatedAt: docData.updatedAt?.toDate() || new Date()
    } as List;
  } catch (error) {
    throw error;
  }
};

/**
 * Agregar usuario a lista compartida
 */
export const shareList = async (listId: string, userId: string): Promise<void> => {
  try {
    if (!isConfigured()) {
      throw new Error("Firebase no está configurado");
    }

    const listRef = doc(db, "lists", listId);
    await updateDoc(listRef, {
      sharedWith: arrayUnion(userId),
      updatedAt: Timestamp.fromDate(new Date())
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Remover usuario de lista compartida
 */
export const removeUserFromList = async (listId: string, userId: string): Promise<void> => {
  try {
    if (!isConfigured()) {
      throw new Error("Firebase no está configurado");
    }

    const listRef = doc(db, "lists", listId);
    await updateDoc(listRef, {
      sharedWith: arrayRemove(userId),
      updatedAt: Timestamp.fromDate(new Date())
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Agregar solicitud pendiente para unirse a una lista
 */
export const addPendingRequest = async (listId: string, userId: string): Promise<void> => {
  try {
    if (!isConfigured()) {
      throw new Error("Firebase no está configurado");
    }

    const listRef = doc(db, "lists", listId);
    await updateDoc(listRef, {
      pendingRequests: arrayUnion(userId),
      updatedAt: Timestamp.fromDate(new Date())
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Aprobar solicitud pendiente y agregar usuario a la lista
 * IMPORTANTE: Esta función también sincroniza toda la lista con Firebase
 * para asegurar que el nuevo participante vea los datos más recientes
 */
export const approvePendingRequest = async (listId: string, userId: string): Promise<void> => {
  try {
    if (!isConfigured()) {
      throw new Error("Firebase no está configurado");
    }

    const listRef = doc(db, "lists", listId);
    
    // Primero obtenemos la lista actual
    const listSnap = await getDoc(listRef);
    if (!listSnap.exists()) {
      throw new Error("Lista no encontrada");
    }
    
    const currentList = listSnap.data();
    
    // Actualizar: remover de pendientes y agregar a compartidos
    await updateDoc(listRef, {
      pendingRequests: arrayRemove(userId),
      sharedWith: arrayUnion(userId),
      updatedAt: Timestamp.fromDate(new Date())
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Rechazar solicitud pendiente
 */
export const rejectPendingRequest = async (listId: string, userId: string): Promise<void> => {
  try {
    if (!isConfigured()) {
      throw new Error("Firebase no está configurado");
    }

    const listRef = doc(db, "lists", listId);
    await updateDoc(listRef, {
      pendingRequests: arrayRemove(userId),
      updatedAt: Timestamp.fromDate(new Date())
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener usuario desde Firestore
 */
export const getUser = async (userId: string): Promise<User | null> => {
  try {
    if (!isConfigured()) {
      throw new Error("Firebase no está configurado");
    }

    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data();
      return {
        ...userData,
        id: userSnap.id,
        createdAt: userData.createdAt?.toDate() || new Date(),
        updatedAt: userData.updatedAt?.toDate() || new Date()
      } as User;
    }
    
    return null;
  } catch (error) {
    throw error;
  }
};

/**
 * Crear o actualizar usuario en Firestore
 */
export const saveUser = async (user: User): Promise<void> => {
  try {
    if (!isConfigured()) {
      throw new Error("Firebase no está configurado");
    }

    const userRef = doc(db, "users", user.id);
    await setDoc(userRef, {
      name: user.name,
      nameSet: user.nameSet,
      createdAt: Timestamp.fromDate(user.createdAt),
      updatedAt: Timestamp.fromDate(new Date())
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Escuchar cambios en tiempo real de las listas de un usuario
 */
export const subscribeToUserLists = (
  userId: string, 
  callback: (lists: List[]) => void
): Unsubscribe => {
  if (!isConfigured()) {
    throw new Error("Firebase no está configurado");
  }

  const listsRef = collection(db, "lists");
  
  // Escuchar listas donde el usuario es dueño
  const ownerQuery = query(listsRef, where("ownerId", "==", userId));
  const sharedQuery = query(listsRef, where("sharedWith", "array-contains", userId));
  
  const ownerLists = new Map<string, List>();
  const sharedLists = new Map<string, List>();
  
  const updateCallback = () => {
    const allLists = new Map([...ownerLists, ...sharedLists]);
    callback(Array.from(allLists.values()));
  };
  
  const unsubscribeOwner = onSnapshot(ownerQuery, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      const docData = change.doc.data();
      const list: List = {
        ...docData,
        id: change.doc.id,
        createdAt: docData.createdAt?.toDate() || new Date(),
        updatedAt: docData.updatedAt?.toDate() || new Date()
      } as List;
      
      if (change.type === "removed") {
        ownerLists.delete(change.doc.id);
      } else {
        ownerLists.set(change.doc.id, list);
      }
    });
    updateCallback();
  });
  
  const unsubscribeShared = onSnapshot(sharedQuery, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      const docData = change.doc.data();
      const list: List = {
        ...docData,
        id: change.doc.id,
        createdAt: docData.createdAt?.toDate() || new Date(),
        updatedAt: docData.updatedAt?.toDate() || new Date()
      } as List;
      
      if (change.type === "removed") {
        sharedLists.delete(change.doc.id);
      } else {
        sharedLists.set(change.doc.id, list);
      }
    });
    updateCallback();
  });
  
  // Devolver función para cancelar ambas suscripciones
  return () => {
    unsubscribeOwner();
    unsubscribeShared();
  };
};

/**
 * Escuchar cambios en tiempo real de una lista específica
 */
export const subscribeToList = (
  listId: string,
  callback: (list: List | null) => void
): Unsubscribe => {
  if (!isConfigured()) {
    throw new Error("Firebase no está configurado");
  }

  const listRef = doc(db, "lists", listId);
  
  return onSnapshot(listRef, (docSnap) => {
    if (docSnap.exists()) {
      const docData = docSnap.data();
      const list: List = {
        ...docData,
        id: docSnap.id,
        createdAt: docData.createdAt?.toDate() || new Date(),
        updatedAt: docData.updatedAt?.toDate() || new Date()
      } as List;
      callback(list);
    } else {
      callback(null);
    }
  });
};

/**
 * Generar el siguiente código incremental de 5 dígitos
 */
export const getNextListCode = async (): Promise<string> => {
  try {
    if (!isConfigured()) {
      return "00001"; // Código inicial si Firebase no está configurado
    }

    const listsRef = collection(db, "lists");
    const allListsSnapshot = await getDocs(listsRef);
    
    let maxCode = 0; // Empezar desde 0
    
    allListsSnapshot.forEach((doc) => {
      const listData = doc.data();
      const code = parseInt(listData.code);
      if (!isNaN(code) && code > maxCode) {
        maxCode = code;
      }
    });
    
    // Retornar el siguiente código (si maxCode es 0, será 00001)
    const nextCode = (maxCode + 1).toString().padStart(5, "0");
    return nextCode;
  } catch (error) {
    // En caso de error, generar un código aleatorio de 5 dígitos
    return Math.floor(10000 + Math.random() * 90000).toString();
  }
};

/**
 * Comprobar si un nombre de usuario ya existe (Case Insensitive)
 * Compara "Pedro", "pedro" y "PEDRO" como iguales.
 */
export const checkUsernameExists = async (name: string): Promise<boolean> => {
  try {
    if (!isConfigured()) {
      return false;
    }

    const usersRef = collection(db, "users");
    
    const querySnapshot = await getDocs(usersRef);
    
    const nameToCheck = name.trim().toLowerCase();

    const exists = querySnapshot.docs.some(doc => {
      const storedName = doc.data().name;
      return storedName && storedName.toLowerCase() === nameToCheck;
    });
    
    return exists;
  } catch (error) {
    console.error("Error comprobando nombre de usuario:", error);
    return false;
  }
};

// Exportar isConfigured para compatibilidad con el código existente
export { isConfigured };
