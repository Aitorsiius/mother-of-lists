import { auth } from "../config/firebase";
import { signInAnonymously, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { Preferences } from '@capacitor/preferences';

/**
 * Guardar el nombre del usuario localmente
 */
export const guardarNombreLocal = async (nombre: string): Promise<void> => {
  try {
    await Preferences.set({
      key: 'user_name',
      value: nombre,
    });
  } catch (error) {
    console.error("Error guardando nombre:", error);
    // En web, usar localStorage como fallback
    try {
      localStorage.setItem('user_name', nombre);
    } catch (e) {
      console.error("Error guardando en localStorage:", e);
    }
  }
};

/**
 * Recuperar el nombre del usuario guardado localmente
 */
export const obtenerNombreLocal = async (): Promise<string | null> => {
  try {
    const { value } = await Preferences.get({ key: 'user_name' });
    return value;
  } catch (error) {
    console.error("Error obteniendo nombre:", error);
    // En web, usar localStorage como fallback
    try {
      return localStorage.getItem('user_name');
    } catch (e) {
      console.error("Error obteniendo de localStorage:", e);
      return null;
    }
  }
};

/**
 * Verificar y autenticar al usuario (anónimamente si es necesario)
 * Retorna una promesa que se resuelve cuando el usuario está autenticado
 */
export const verificarUsuario = (): Promise<FirebaseUser> => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // El usuario ya era conocido
        console.log("Bienvenido de nuevo:", user.uid);
        unsubscribe();
        resolve(user);
      } else {
        // Es la primera vez, crear identidad anónima
        try {
          const credential = await signInAnonymously(auth);
          console.log("Nueva identidad creada:", credential.user.uid);
          unsubscribe();
          resolve(credential.user);
        } catch (error) {
          console.error("Error en autenticación:", error);
          unsubscribe();
          reject(error);
        }
      }
    });
  });
};

/**
 * Obtener el usuario actual autenticado
 */
export const obtenerUsuarioActual = (): FirebaseUser | null => {
  return auth.currentUser;
};
