import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import admin from 'firebase-admin';
import { getCacheDb, COMPILER_PASSWORD } from './config.js';
import { processJeansData, partitionData } from './dataProcessor.js';

// Configuración para la base de datos principal (existente)
const mainFirebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

// Inicializar la app principal de Firebase
const mainApp = initializeApp(mainFirebaseConfig);
const mainDb = getFirestore(mainApp);

// Función para obtener todos los productos de la base de datos principal
async function fetchAllProducts() {
  try {
    const productsRef = collection(mainDb, 'products');
    const snapshot = await getDocs(productsRef);
    
    const products = [];
    snapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() });
    });
    
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

// Función para limpiar el caché existente
async function clearCache() {
  try {
    const cacheDb = getCacheDb();
    const cacheRef = cacheDb.collection('cached_products');
    const snapshot = await cacheRef.get();
    
    const batch = cacheDb.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log('Cache cleared successfully');
  } catch (error) {
    console.error('Error clearing cache:', error);
    throw error;
  }
}

// Función para guardar los chunks en la base de datos de caché
async function saveChunksToCache(chunks) {
  try {
    const cacheDb = getCacheDb();
    const batch = cacheDb.batch();
    
    chunks.forEach((chunk, index) => {
      const docRef = cacheDb.collection('cached_products').doc(`parsed_data_${index + 1}`);
      batch.set(docRef, {
        product_parsed: chunk.data, // Usar product_parsed en lugar de data
        metadata: {
          ...chunk.metadata,
          chunkIndex: index + 1,
          totalChunks: chunks.length,
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        }
      });
    });
    
    // Guardar metadata general
    const metaRef = cacheDb.collection('cache_metadata').doc('general');
    batch.set(metaRef, {
      totalChunks: chunks.length,
      totalProducts: chunks.reduce((acc, chunk) => acc + chunk.metadata.count, 0),
      lastCompiled: admin.firestore.FieldValue.serverTimestamp(),
      version: '1.0.0'
    });
    
    await batch.commit();
    console.log(`Saved ${chunks.length} chunks to cache`);
  } catch (error) {
    console.error('Error saving chunks to cache:', error);
    throw error;
  }
}

// Función principal de compilación
export async function compileCache() {
  try {
    console.log('Starting cache compilation...');
    
    // 1. Obtener todos los productos
    const products = await fetchAllProducts();
    console.log(`Fetched ${products.length} products`);
    
    // 2. Procesar los datos con el algoritmo
    const processedData = processJeansData(products);
    console.log(`Processed ${processedData.length} unique products`);
    
    // 3. Particionar los datos
    const chunks = partitionData(processedData);
    console.log(`Created ${chunks.length} chunks`);
    
    // 4. Limpiar el caché existente
    await clearCache();
    
    // 5. Guardar los nuevos chunks
    await saveChunksToCache(chunks);
    
    return {
      success: true,
      message: 'Cache compiled successfully',
      stats: {
        totalProducts: products.length,
        processedProducts: processedData.length,
        chunks: chunks.length
      }
    };
  } catch (error) {
    console.error('Cache compilation failed:', error);
    return {
      success: false,
      message: 'Cache compilation failed',
      error: error.message
    };
  }
}

// Función para compilación manual con verificación de contraseña
export async function manualCompile(password) {
  if (password !== COMPILER_PASSWORD) {
    return {
      success: false,
      message: 'Invalid password'
    };
  }
  
  return await compileCache();
}

// Handler principal para Vercel
export default async function handler(req, res) {
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

  const { action, password, trigger } = req.body || {};

  try {
    let result;
    
    switch (action) {
      case 'compile':
        // Compilación automática desde triggers
        if (trigger === 'auto') {
          result = await compileCache();
        } else {
          // Compilación manual con contraseña
          result = await manualCompile(password);
        }
        break;
        
      case 'clear':
        // Limpiar caché (requiere contraseña)
        if (password === COMPILER_PASSWORD) {
          await clearCache();
          result = { success: true, message: 'Cache cleared' };
        } else {
          result = { success: false, message: 'Invalid password' };
        }
        break;
        
      default:
        result = { success: false, message: 'Invalid action' };
    }
    
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}
