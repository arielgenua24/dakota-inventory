import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import './styles.css';

const ImageModal = ({ setImages, imagesToUpdate, setNewImages, setChanges, suggestedImages }) => {
  const [previews, setPreviews] = useState({
    image1: '',
    image2: '',
    image3: ''
  });

  // Inicializar previews con imagesToUpdate si existe
  useEffect(() => {
    if (imagesToUpdate && Array.isArray(imagesToUpdate)) {
      const newPreviews = { ...previews };
      
      // Mapear las imágenes del array a los previews correspondientes
      imagesToUpdate.forEach((item, index) => {
        if (item && item.image && index < 3) {
          const imageKey = `image${index + 1}`;
          newPreviews[imageKey] = item.image;
        }
      });
      
      setPreviews(newPreviews);
      
      // También actualizar el estado de imágenes si setImages está disponible
      /* if (setImages) {
        const updatedImages = {};
        imagesToUpdate.forEach((item, index) => {
          if (item && item.image && index < 3) {
            const imageKey = `image${index + 1}`;
            updatedImages[imageKey] = item.image;
          }
        });
        setImages(prev => ({
          ...prev,
          ...updatedImages
        }));
      }*/
    }

    if (suggestedImages) {
      console.log(suggestedImages)
    }

  }, [imagesToUpdate]);

  const handleImageUpload = (e, imageKey) => {
    const file = e.target.files[0];
    if (file) {
      setImages(prev => ({
        ...prev,
        [imageKey]: file
      }));
      
      const previewUrl = URL.createObjectURL(file);
      setPreviews(prev => ({
        ...prev,
        [imageKey]: previewUrl
      }));

      if(imagesToUpdate) {
        setChanges(true);

        setNewImages(prev => ({
          ...prev,
          [`${imageKey}`]: file
        }));
      }   
      
    }
  };

  const handleRemoveImage = (imageKey) => {
    
    setImages(prev => ({
      ...prev,
      [imageKey]: ''
    }));
    
    // Solo revocar URL si es un objeto URL creado por createObjectURL
    if (previews[imageKey] && typeof previews[imageKey] === 'string' && previews[imageKey].startsWith('blob:')) {
      URL.revokeObjectURL(previews[imageKey]);
    }
    
    setPreviews(prev => ({
      ...prev,
      [imageKey]: ''
    }));
  };

  return (
    <div className="image-form--container">
      <h2 className="image-form--title">Subir Imágenes</h2>
      
      <div className="image-form--warning">
        ⚠️ Importante: Agregue las imágenes del producto 
        
        <strong> solo si aún no las ha cargado 
        al registrar otros talles del mismo producto.</strong> 
        <br />
        Este es porque Las imágenes se comparten entre todas las variantes 
        del mismo producto para facilitar tu experiencia.
      </div>

      <div className="image-form--grid">
        {[1, 2, 3].map((num) => {
          const imageKey = `image${num}`;
          return (
            <div key={imageKey} className="image-form--item">
              {previews[imageKey] ? (
                <div className="image-form--preview-container">
                  <img 
                    src={previews[imageKey]} 
                    alt={`Preview ${num}`} 
                    className="image-form--preview-image"
                  />
                  <button
                    onClick={() => handleRemoveImage(imageKey)}
                    className="image-form--remove-button"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label className="image-form--upload-label">
                  <div className="image-form--upload-content">
                    <p className="image-form--upload-text">Click para subir</p>
                    <p className="image-form--upload-subtext">PNG, JPG, GIF</p>
                  </div>
                  <input
                    type="file"
                    className="image-form--input"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, imageKey)}
                  />
                </label>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ImageModal;