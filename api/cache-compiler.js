// Nota: evitamos imports de Firebase/Admin en top-level para aislar errores en Vercel
// Probaremos imports dinámicos dentro del handler para capturar errores como JSON
// import { processJeansData, partitionData } from './cache-compiler/dataProcessor.js';
// import { initializeApp } from 'firebase/app';
// import { getFirestore, collection, getDocs } from 'firebase/firestore';
// import admin from 'firebase-admin';
// import { getCacheDb, COMPILER_PASSWORD } from './cache-compiler/config.js';

// Función temporal simplificada para diagnóstico
function simpleTest() {
  return {
    success: true,
    message: 'Test function works',
    environment: {
      hasFirebaseCacheProjectId: !!process.env.FIREBASE_CACHE_PROJECT_ID,
      hasFirebaseCachePrivateKey: !!process.env.FIREBASE_CACHE_PRIVATE_KEY,
      hasCompilerPassword: !!process.env.COMPILER_MANUAL_PASSWORD,
      nodeVersion: process.version
    }
  };
}

// Helpers: Firebase principal (cliente) y Firebase Admin (cache)
async function getMainDb() {
  const { initializeApp, getApps, getApp } = await import('firebase/app');
  const { getFirestore } = await import('firebase/firestore');

  const config = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID
  };

  const appName = 'main-cache-compiler';
  const apps = getApps();
  const app = apps.find(a => a.name === appName) ? getApp(appName) : initializeApp(config, appName);
  return getFirestore(app);
}

async function fetchAllProducts() {
  const db = await getMainDb();
  const { collection, getDocs } = await import('firebase/firestore');
  const productsRef = collection(db, 'products');
  const snapshot = await getDocs(productsRef);
  const products = [];
  snapshot.forEach((doc) => {
    products.push({ id: doc.id, ...doc.data() });
  });
  return products;
}

async function getAdminArtifacts() {
  const cfg = await import('./cache-compiler/config.js');
  const db = cfg.getCacheDb();
  const admin = (await import('firebase-admin')).default;
  return { cacheDb: db, admin, COMPILER_PASSWORD: cfg.COMPILER_PASSWORD };
}

async function clearCache(cacheDb) {
  const snapshot = await cacheDb.collection('cached_products').get();
  const batch = cacheDb.batch();
  snapshot.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
}

async function saveChunksToCache(cacheDb, admin, chunks) {
  console.log('=== INICIANDO GUARDADO DE CHUNKS ===');
  console.log('Total chunks recibidos:', chunks.length);
  
  // Validar que chunks tenga data
  chunks.forEach((chunk, index) => {
    console.log(`Chunk ${index + 1}:`);
    console.log('- Tiene data:', !!chunk.data);
    console.log('- Cantidad de productos:', chunk.data ? chunk.data.length : 0);
    console.log('- Metadata:', chunk.metadata);
  });

  const batch = cacheDb.batch();
  
  // Guardar cada chunk como documento separado
  chunks.forEach((chunk, index) => {
    const docRef = cacheDb.collection('cached_products').doc(`parsed_data_${index + 1}`);
    
    const docData = {
      product_parsed: chunk.data, // Cambiar 'data' por 'product_parsed'
      /*metadata: {
        ...chunk.metadata,
        chunkIndex: index + 1,
        totalChunks: chunks.length,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      } */
    };
    
    console.log(`Preparando documento parsed_data_${index + 1}:`);
    console.log('- Productos a guardar:', docData.product_parsed?.length || 0);
    console.log('- Metadata completa:', docData.metadata);
    
    batch.set(docRef, docData);
  });

  // Guardar metadata general
  const metaRef = cacheDb.collection('cache_metadata').doc('general');
  const generalMeta = {
    totalChunks: chunks.length,
    totalProducts: chunks.reduce((acc, chunk) => acc + chunk.metadata.count, 0),
    lastCompiled: admin.firestore.FieldValue.serverTimestamp(),
    version: '1.0.0'
  };
  
  console.log('Metadata general a guardar:', generalMeta);
  batch.set(metaRef, generalMeta);

  console.log('=== EJECUTANDO BATCH COMMIT ===');
  await batch.commit();
  console.log('=== BATCH COMMIT COMPLETADO ===');
}

async function compileCache() {
  console.log('=== INICIANDO COMPILACION DE CACHE ===');
  
  // 1. Obtener productos desde la BD principal
  console.log('1. Obteniendo productos desde BD principal...');
  const products = await fetchAllProducts();
  console.log('Productos obtenidos:', products.length);

  // 2. Procesar y particionar datos
  console.log('2. Procesando y particionando datos...');
  const { processJeansData, partitionData } = await import('./cache-compiler/dataProcessor.js');
  const processed = processJeansData(products);
  console.log('Productos procesados:', processed.length);
  
  const chunks = partitionData(processed);
  console.log('Chunks generados:', chunks.length);

  // 3. Guardar en caché
  console.log('3. Guardando en cache...');
  const { cacheDb, admin } = await getAdminArtifacts();
  
  console.log('Limpiando cache existente...');
  await clearCache(cacheDb);
  
  console.log('Guardando nuevos chunks...');
  await saveChunksToCache(cacheDb, admin, chunks);

  const stats = {
    totalProducts: products.length,
    processedProducts: processed.length,
    chunks: chunks.length
  };
  
  console.log('=== COMPILACION COMPLETADA ===');
  console.log('Stats finales:', stats);

  return {
    success: true,
    message: 'Cache compiled successfully',
    stats
  };
}

async function manualCompile(password) {
  const { COMPILER_PASSWORD } = await getAdminArtifacts();
  if (password !== COMPILER_PASSWORD) {
    return { success: false, message: 'Invalid password' };
  }
  return compileCache();
}

// Handler principal para Vercel
export default async function handler(req, res) {
  try {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    if (req.method === 'GET') {
      // Diagnóstico extendido: contar productos y chunks de caché
      const base = simpleTest();
      const diagnostics = { ...base, requestMethod: req.method };
      try {
        const db = await getMainDb();
        const { collection, getDocs } = await import('firebase/firestore');
        const snap = await getDocs(collection(db, 'products'));
        diagnostics.mainProductsCount = snap.size;
      } catch (e) {
        diagnostics.mainProductsError = e.message;
      }

      try {
        const { cacheDb } = await getAdminArtifacts();
        const chunksSnap = await cacheDb.collection('cached_products').get();
        diagnostics.cachedChunksCount = chunksSnap.size;
        const metaSnap = await cacheDb.collection('cache_metadata').doc('general').get();
        diagnostics.cacheMetaExists = metaSnap.exists;
      } catch (e) {
        diagnostics.cacheDbError = e.message;
      }

      return res.status(200).json(diagnostics);
    }

    // POST con acciones: compile / clear (manual o auto)
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const { action, password, trigger } = body;

    let result;
    switch (action) {
      case 'compile':
        if (trigger === 'auto') {
          result = await compileCache();
        } else {
          result = await manualCompile(password);
        }
        break;
      case 'clear':
        {
          const { cacheDb, COMPILER_PASSWORD } = await getAdminArtifacts();
          if (password === COMPILER_PASSWORD) {
            await clearCache(cacheDb);
            result = { success: true, message: 'Cache cleared' };
          } else {
            result = { success: false, message: 'Invalid password' };
          }
        }
        break;
      default:
        result = { success: false, message: 'Invalid action' };
    }

    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
      stack: error.stack
    });
  }
}
