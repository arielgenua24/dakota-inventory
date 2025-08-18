import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Configuración para la base de datos de caché
const cacheFirebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_CACHE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_CACHE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_CACHE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_CACHE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_CACHE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_CACHE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_CACHE_MEASUREMENT_ID
};

// Inicializar la app de Firebase para caché
const cacheApp = initializeApp(cacheFirebaseConfig, 'cache');
export const cacheDb = getFirestore(cacheApp);

// Contraseña para compilación manual
export const COMPILER_PASSWORD = process.env.VITE_COMPILER_MANUAL_PASSWORD;
