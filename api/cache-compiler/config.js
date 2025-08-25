import admin from 'firebase-admin';

// Contraseña para compilación manual
export const COMPILER_PASSWORD = process.env.COMPILER_MANUAL_PASSWORD;

// Lee credenciales desde BASE64 o variables separadas, sin lanzar errores en top-level.
function getServiceAccountFromEnv() {
  // Opción 1: JSON Base64 completo
  const b64 = process.env.FIREBASE_CACHE_SERVICE_ACCOUNT_BASE64;
  if (b64) {
    try {
      const json = Buffer.from(b64, 'base64').toString('utf8');
      return JSON.parse(json);
    } catch (e) {
      // Si falla el parseo, continuamos a la opción 2
    }
  }

  // Opción 2: Credenciales separadas
  const projectId = process.env.FIREBASE_CACHE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CACHE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_CACHE_PRIVATE_KEY;

  if (privateKey) {
    // Normalizar \n a saltos de línea reales
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  if (projectId && clientEmail && privateKey) {
    return { projectId, client_email: clientEmail, private_key: privateKey };
  }

  // Si no hay credenciales, devolver null (el caller decidirá qué hacer)
  return null;
}

function ensureCacheAdminApp() {
  // Evitar re-inicializaciones
  if (admin.apps.find(a => a.name === 'cache')) return;

  const serviceAccount = getServiceAccountFromEnv();
  if (!serviceAccount) {
    // No lanzar en import-time; dejar que el handler reporte el error cuando intente usar la DB
    return;
  }

  admin.initializeApp(
    {
      credential: admin.credential.cert(serviceAccount)
    },
    'cache'
  );
}

export function getCacheDb() {
  ensureCacheAdminApp();
  const app = admin.apps.find(a => a.name === 'cache');
  if (!app) {
    throw new Error('Firebase Admin (cache) no está inicializado. Verifica las variables de entorno del service account.');
  }
  return admin.app('cache').firestore();
}
