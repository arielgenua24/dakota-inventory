import admin from 'firebase-admin';

// Contraseña para compilación manual
export const COMPILER_PASSWORD = process.env.COMPILER_MANUAL_PASSWORD;

// Obtener las credenciales del service account desde una variable de entorno
// Asegúrate de que la variable FIREBASE_CACHE_SERVICE_ACCOUNT_BASE64 esté configurada
if (!process.env.FIREBASE_CACHE_SERVICE_ACCOUNT_BASE64) {
  throw new Error('La variable de entorno FIREBASE_CACHE_SERVICE_ACCOUNT_BASE64 no está configurada.');
}

const serviceAccount = JSON.parse(Buffer.from(process.env.FIREBASE_CACHE_SERVICE_ACCOUNT_BASE64, 'base64').toString('ascii'));

// Inicializar la app de Firebase Admin para el caché si no existe
if (!admin.apps.some(app => app.name === 'cache')) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  }, 'cache');
}

// Exportar la instancia de Firestore del caché
export const cacheDb = admin.app('cache').firestore();
