import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, cacheAuth } from "../firebaseSetUp";

// Iniciar sesión en ambos proyectos Firebase
export const login = async (email, password) => {
  try {
    // Autenticar en el proyecto principal
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("Main project login:", userCredential.user);
    
    // Autenticar en el proyecto cache
    const cacheUserCredential = await signInWithEmailAndPassword(cacheAuth, email, password);
    console.log("Cache project login:", cacheUserCredential.user);
    
    return {
      mainUser: userCredential.user,
      cacheUser: cacheUserCredential.user
    };
   
  } catch (error) {
    throw new Error("Error en el inicio de sesión: " + error.message);
  }
};

// Cerrar sesión en ambos proyectos
export const logout = async () => {
  try {
    await Promise.all([
      signOut(auth),
      signOut(cacheAuth)
    ]);
  } catch (error) {
    throw new Error("Error al cerrar sesión: " + error.message);
  }
};
