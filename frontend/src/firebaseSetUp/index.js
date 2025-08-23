// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import firebaseConfig, { firebaseCacheConfig } from '../firebaseConfig'; // Importa ambas configuraciones

// Inicializar Firebase principal
const app = initializeApp(firebaseConfig);
console.log(app)

// Inicializar Firebase cache (segundo proyecto)
const cacheApp = initializeApp(firebaseCacheConfig, "cache");

// Obtener servicios del proyecto principal
const auth = getAuth(app);
const db = getFirestore(app);

// Obtener servicios del proyecto cache
const cacheAuth = getAuth(cacheApp);
const cacheDb = getFirestore(cacheApp);

// Exportar servicios
export { auth, db, cacheAuth, cacheDb };