import ImageKit from "imagekit-javascript";
import Compressor from 'compressorjs';

const imagekit = new ImageKit({
  publicKey: "public_JJwG1EFYua4sXmfsyaNxIizE/DQ=",
  urlEndpoint: "https://ik.imagekit.io/arielgenua",
});

// Función para comprimir una imagen
const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      new Compressor(file, {
        quality: 0.6, // Calidad de compresión (0.6 = 60%, ajusta según necesites)
        maxWidth: 1024, // Ancho máximo (opcional)
        maxHeight: 1024, // Alto máximo (opcional)
        mimeType: "image/jpeg", // Tipo de archivo de salida (puedes usar 'image/png' si prefieres)
        success(compressedFile) {
          resolve(compressedFile);
        },
        error(err) {
          console.error("Error al comprimir la imagen:", err);
          reject(err);
        },
      });
    });
  };



  async function uploadImages(images) {
    // Usa el endpoint de autenticación en modo de pruebas
    const authenticationEndpoint = window.location.hostname === "localhost" 
    ? "http://localhost:3001/api/auth" 
    : "/api/auth";    // Para producción (si el backend y el frontend están en el mismo dominio)
    // const authenticationEndpoint = "/auth"; o /backend/auth
  
    // Función auxiliar para obtener parámetros de autenticación
    const getAuthParams = async () => {
      const authResponse = await fetch(authenticationEndpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (!authResponse.ok) {
        throw new Error(`Error en autenticación: ${authResponse.statusText}`);
      }
  
      return await authResponse.json();
    };
  
    // Función auxiliar para subir una imagen
    const uploadFile = async (file) => {
      // eslint-disable-next-line no-useless-catch
      try {
        // Obtenemos parámetros de autenticación frescos para esta imagen
        const authData = await getAuthParams();
  
        return new Promise((resolve, reject) => {
          imagekit.upload({
            file: file, // archivo de tipo File
            fileName: file.name, // usamos el nombre original o lo que desees
            tags: ["tag1"], // puedes modificar o eliminar etiquetas según tus necesidades
            token: authData.token,
            signature: authData.signature,
            expire: authData.expire,
          }, function(err, result) {
            if (err) {
              console.error("Error al subir la imagen:", err);
              return reject(err);
            }
  
            // Opcional: genera una URL transformada (por ejemplo, para redimensionar)
            const transformedUrl = imagekit.url({
              src: result.url,
              transformation: [{ height: 300, width: 400 }],
            });
            console.log("URL transformada:", transformedUrl);
            resolve(result);
          });
        });
      } catch (error) {
        throw error;
      }
    };
  
    try {
      // Verificamos que el argumento sea un array
      if (!Array.isArray(images)) {
        // Si no es un array, lo convertimos en uno (si es una sola imagen)
        images = [images];
      }
  
      // Filtramos cualquier valor nulo o indefinido que pudiera haber en el array
      const validImages = images.filter(img => img != null);
  
      if (validImages.length === 0) {
        throw new Error("No se proporcionaron imágenes válidas para subir");
      }
  
      // Comprimimos todas las imágenes
      const compressedImages = await Promise.all(
        validImages.map(image => compressImage(image))
      );
  
      // Subimos todas las imágenes de forma concurrente
      const uploadResults = await Promise.all(
        compressedImages.map(image => uploadFile(image))
      );
  
      return uploadResults;
    } catch (error) {
      console.error("Error en la autenticación o al subir imágenes:", error);
      throw error;
    }
  }

export default uploadImages;