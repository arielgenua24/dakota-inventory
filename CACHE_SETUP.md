# Sistema de Caché para Dakota Inventario

## Descripción
Este sistema implementa una arquitectura de caché usando una segunda base de datos Firestore para optimizar el rendimiento de la tienda en línea.

## Configuración Requerida

### 1. Crear Segunda Base de Datos en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un **NUEVO proyecto** para el caché (no uses el mismo proyecto existente)
3. Habilita Firestore en el nuevo proyecto
4. Ve a Configuración del Proyecto > General
5. Crea una nueva aplicación web
6. Copia las credenciales de configuración

### 2. Configurar Variables de Entorno

Agrega las siguientes variables a tu archivo `.env.production`:

```env
# Variables de la base de datos de caché
VITE_FIREBASE_CACHE_API_KEY=tu_api_key_del_cache
VITE_FIREBASE_CACHE_AUTH_DOMAIN=tu_auth_domain_del_cache
VITE_FIREBASE_CACHE_PROJECT_ID=tu_project_id_del_cache
VITE_FIREBASE_CACHE_STORAGE_BUCKET=tu_storage_bucket_del_cache
VITE_FIREBASE_CACHE_MESSAGING_SENDER_ID=tu_messaging_sender_id_del_cache
VITE_FIREBASE_CACHE_APP_ID=tu_app_id_del_cache
VITE_FIREBASE_CACHE_MEASUREMENT_ID=tu_measurement_id_del_cache

# Contraseña para compilación manual
VITE_COMPILER_MANUAL_PASSWORD=contraseña_segura_aqui

# URL de la API
VITE_API_URL=/api
```

### 3. Configurar Reglas de Firestore para el Caché

En la consola de Firebase del proyecto de caché, ve a Firestore > Reglas y configura:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Solo lectura pública para los datos cacheados
    match /cached_products/{document=**} {
      allow read: if true;
      allow write: if false; // Solo la API puede escribir
    }
    
    match /cache_metadata/{document=**} {
      allow read: if true;
      allow write: if false; // Solo la API puede escribir
    }
  }
}
```

## Funcionamiento

### Compilación Automática
El caché se actualiza automáticamente cuando:
- Se agrega un nuevo producto en `/pages/Inventory`
- Se elimina un producto en `/pages/Inventory`
- Se actualiza un producto en `/pages/Products`

### Compilación Manual
1. En la página de Inventario, haz clic en el botón de configuración (⚙️) en la esquina superior derecha
2. Ingresa la contraseña configurada en `VITE_COMPILER_MANUAL_PASSWORD`
3. Haz clic en "Compilar"

## Estructura del Caché

Los datos se almacenan en documentos particionados:
- `cached_products/parsed_data_1`
- `cached_products/parsed_data_2`
- ... (según sea necesario)

Cada documento contiene:
- `data`: Array de productos procesados
- `metadata`: Información sobre el chunk (índice, total, timestamp)

## API Endpoints

### POST /api/cache-compiler

**Acciones disponibles:**
- `compile`: Compila el caché (requiere `trigger: 'auto'` o `password`)
- `clear`: Limpia el caché (requiere `password`)

## Procesamiento de Datos

El algoritmo `processJeansData`:
1. Agrupa productos por nombre
2. Prioriza productos con imágenes
3. Extrae tallas únicas
4. Normaliza la estructura de datos

## Particionamiento

Los datos se particionan en chunks de máximo 950KB para:
- Optimizar el rendimiento de lectura
- Permitir paginación eficiente
- Evitar límites de tamaño de documento de Firestore

## Notas Importantes

1. **NO uses la misma base de datos** para el caché y los datos principales
2. **Cambia la contraseña** por defecto en producción
3. El caché se actualiza con un delay de 1 segundo para asegurar que Firestore esté sincronizado
4. Los datos cacheados son de solo lectura desde el cliente

## Troubleshooting

### El caché no se actualiza
- Verifica las variables de entorno
- Revisa los logs en Vercel Functions
- Asegúrate de que las credenciales de Firebase sean correctas

### Error de permisos
- Verifica las reglas de Firestore
- Asegúrate de que la API tenga permisos de escritura

### La compilación manual no funciona
- Verifica que la contraseña sea correcta
- Revisa que `VITE_COMPILER_MANUAL_PASSWORD` esté configurada
