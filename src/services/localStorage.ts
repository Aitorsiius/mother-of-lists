import { Preferences } from "@capacitor/preferences";
import { List } from "../types";

const PERSONAL_LISTS_KEY = "personal_lists";

/**
 * Guardar listas personales en almacenamiento local
 */
export const savePersonalListsLocally = async (lists: List[]): Promise<void> => {
  try {
    const listsData = lists.map(list => ({
      ...list,
      createdAt: list.createdAt.toISOString(),
      updatedAt: list.updatedAt.toISOString(),
    }));
    
    await Preferences.set({
      key: PERSONAL_LISTS_KEY,
      value: JSON.stringify(listsData),
    });
  } catch (error) {
    console.error("Error saving personal lists locally:", error);
    throw error;
  }
};

/**
 * Cargar listas personales desde almacenamiento local
 */
export const loadPersonalListsLocally = async (): Promise<List[]> => {
  try {
    const { value } = await Preferences.get({ key: PERSONAL_LISTS_KEY });
    
    if (!value) {
      return [];
    }
    
    const listsData = JSON.parse(value);
    return listsData.map((list: any) => ({
      ...list,
      createdAt: new Date(list.createdAt),
      updatedAt: new Date(list.updatedAt),
    }));
  } catch (error) {
    console.error("Error loading personal lists locally:", error);
    return [];
  }
};

/**
 * Actualizar una lista personal localmente
 */
export const updatePersonalListLocally = async (updatedList: List): Promise<void> => {
  try {
    const lists = await loadPersonalListsLocally();
    const updatedLists = lists.map(list => 
      list.id === updatedList.id ? updatedList : list
    );
    
    await savePersonalListsLocally(updatedLists);
  } catch (error) {
    console.error("Error updating personal list locally:", error);
    throw error;
  }
};

/**
 * Agregar una nueva lista personal localmente
 */
export const addPersonalListLocally = async (newList: List): Promise<void> => {
  try {
    const lists = await loadPersonalListsLocally();
    lists.push(newList);
    await savePersonalListsLocally(lists);
  } catch (error) {
    console.error("Error adding personal list locally:", error);
    throw error;
  }
};

/**
 * Eliminar una lista personal localmente
 */
export const deletePersonalListLocally = async (listId: string): Promise<void> => {
  try {
    const lists = await loadPersonalListsLocally();
    const filteredLists = lists.filter(list => list.id !== listId);
    await savePersonalListsLocally(filteredLists);
  } catch (error) {
    console.error("Error deleting personal list locally:", error);
    throw error;
  }
};

/**
 * Verificar si una lista es personal (no tiene participantes)
 */
export const isPersonalList = (list: List): boolean => {
  return list.sharedWith.length === 0;
};

/**
 * Obtener una lista personal específica
 */
export const getPersonalListLocally = async (listId: string): Promise<List | null> => {
  try {
    const lists = await loadPersonalListsLocally();
    return lists.find(list => list.id === listId) || null;
  } catch (error) {
    console.error("Error getting personal list locally:", error);
    return null;
  }
};

/**
 * Migrar lista personal a compartida (eliminarla del almacenamiento local)
 * Se usa cuando una lista personal se convierte en compartida
 */
export const migratePersonalListToShared = async (listId: string): Promise<void> => {
  try {
    await deletePersonalListLocally(listId);
  } catch (error) {
    console.error("Error migrating personal list to shared:", error);
    throw error;
  }
};
