// server.js para correr endpoints localmente (/api/auth.js y /api/cache-compiler)  
const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const { createRequire } = require('module');
const { pathToFileURL } = require('url');

// Cargar variables de entorno desde /api/.env
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const port = process.env.PORT || 3001;

// Middleware para procesar JSON
app.use(express.json());

// Importar la función exportada por auth.js (CommonJS)
const authHandler = require('./auth');

// Función para importar dinámicamente módulos ESM
async function setupCacheCompilerEndpoint() {
  try {
    // Ruta al archivo index.js del cache-compiler
    const cacheCompilerPath = path.join(__dirname, 'cache-compiler/index.js');
    
    // Importar el módulo ESM (necesitamos usar import() dinámico)
    const cacheCompilerModule = await import(pathToFileURL(cacheCompilerPath));
    
    // Obtener la función handler por defecto
    const cacheCompilerHandler = cacheCompilerModule.default;
    
    // Configurar el endpoint para cache-compiler
    app.all('/api/cache-compiler', (req, res) => {
      // Para pruebas locales, aseguramos que las cabeceras CORS estén presentes
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
      res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
      
      // Manejar OPTIONS para CORS
      if (req.method === 'OPTIONS') {
        return res.status(200).end();
      }
      
      // Pasar el control al handler del cache-compiler
      return cacheCompilerHandler(req, res);
    });
    
    console.log('✅ Endpoint cache-compiler configurado correctamente');
  } catch (error) {
    console.error('❌ Error al configurar endpoint cache-compiler:', error);
  }
}

// Exponer el endpoint /api/auth (CommonJS)
app.all('/api/auth', (req, res) => authHandler(req, res));

// Iniciar la configuración del endpoint de cache-compiler (ESM)
setupCacheCompilerEndpoint();

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor backend escuchando en:
- http://localhost:${port}/api/auth
- http://localhost:${port}/api/cache-compiler`);
});
