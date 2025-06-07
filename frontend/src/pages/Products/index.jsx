import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useFirestoreContext from '../../hooks/useFirestoreContext';
import LoadingComponent from "../../components/Loading";
import ImageModal from "../../modals/ImageModal";
import uploadImages from "../../services/uploadImage";
import { format, set } from 'date-fns';
import { es } from 'date-fns/locale';
import './styles.css';

function Product() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState({});
  const [changes, setChanges] = useState("");
  const [newSavedProduct, setNewSavedProduct] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { getProduct, updateProduct, deleteProduct } = useFirestoreContext();

  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(product.price);
  const [curvePrice, setCurvePrice] = useState(product.curvePrice);
  const [stock, setStock] = useState(product.stock);
  const [size, setSize] = useState(product.size);
  const [color, setColor] = useState(product.color);
  const [images, setImages] = useState([]);
  const [oldImages, setOldImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [imagePostitions, setImagePositions] = useState([]);


  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
     
      console.log(images)
      const fetchedProduct = await getProduct(id);
      if (fetchedProduct === undefined) {
        alert('El producto no existe');
        navigate('/inventory');
        return;
      }
      setProduct(fetchedProduct);

      setName(fetchedProduct.name);
      setPrice(fetchedProduct.price);
      setCurvePrice(fetchedProduct.curvePrice);
      setStock(fetchedProduct.stock);
      setSize(fetchedProduct.size);
      setColor(fetchedProduct.color);
      setImages(() => ([{ image: fetchedProduct.image1}, {image: fetchedProduct.image2}, {image: fetchedProduct.image3}]));      
      setOldImages(() => ([{ image: fetchedProduct.image1}, {image: fetchedProduct.image2}, {image: fetchedProduct.image3}]));
      setIsLoading(false);
    };
    loadProducts();
  }, [getProduct, id, newSavedProduct]);


  const loadImages = async () => {
    // Crear una copia del objeto para actualizar
    const updatedImages = { ...images };
    const uploadPromises = [];
  
    for (let i = 1; i <= 3; i++) {
      const key = `image${i}`;
      if (newImages[key]) {
        // Extraer el índice correspondiente (por ejemplo, 'image2' → índice 1)
        const index = i - 1;
  
        // Colocar un placeholder en la posición mientras se sube la imagen
        updatedImages[index] = { image: '' };
  
        const uploadPromise = uploadImages(newImages[key]).then((newUrl) => {
          let finalUrl = '';
  
          // Si newUrl es un arreglo y tiene al menos un elemento, extraemos la propiedad url del primer objeto
          if (Array.isArray(newUrl) && newUrl.length > 0) {
            finalUrl = newUrl[0].url;
          } 
          // Si newUrl es un objeto que contiene la propiedad url, la usamos directamente
          else if (newUrl && newUrl.url) {
            finalUrl = newUrl.url;
          } 
          // En otro caso, asumimos que newUrl ya es un string de la URL
          else {
            finalUrl = newUrl;
          }
          
          // Actualizamos la URL en la posición correcta con la estructura deseada
          updatedImages[index] = { image: finalUrl };
        });
  
        uploadPromises.push(uploadPromise);
      }
    }
  
    // Esperar a que todas las cargas finalicen
    await Promise.all(uploadPromises);
  
    // Actualizar el estado con el objeto actualizado
    setImages(updatedImages);
    return updatedImages;
  };
  

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    setChanges(true);
  };

  const handleSubmit = async (e) => {
    setIsLoading(true);
    e.preventDefault();
    const currentDate = new Date();
    const formattedDate = format(currentDate, 'yyyy-MM-dd HH:mm:ss', { locale: es });
    
    console.log(newImages);

    const updatedProduct = {
      id,
      name,
      price,
      curvePrice,
      stock,
      size,
      color,
      updatedAt: formattedDate,
    };

    //if there are images to replace
    const updatedImages = await loadImages();
    console.log('images', updatedImages);

    if (oldImages[0]?.image !== undefined || !!newImages.image1) {
      updatedProduct.image1 = updatedImages[0]?.image;
      console.log('image1 actualizada:', updatedProduct.image1);
    }

    if (oldImages[1]?.image !== undefined || !!newImages.image2 ) {
      updatedProduct.image2 = updatedImages[1]?.image;
      console.log('image2 actualizada:', updatedProduct.image2);
    }

    if (oldImages[2]?.image !== undefined || !!newImages.image3) {
      updatedProduct.image3 = updatedImages[2]?.image;
      console.log('image3 actualizada:', updatedProduct.image3);
    }

    console.log('updatedProduct después de agregar imágenes:', updatedProduct);


    console.log('updatedProduct', updatedProduct)

  
    try {
      await updateProduct(updatedProduct.id, updatedProduct);
      console.log('productos agregados')
      setIsLoading(false);
      navigate('/inventory');
    } catch (error) {
      setIsLoading(false);
      console.error("Error al actualizar el producto:", error);
    }
  };
 
  console.log(oldImages)
  console.log(newImages)

  return (
    <div className="form-container">
      {isLoading && <LoadingComponent />}
      <h1 className="product-title">Producto</h1>

      {oldImages[0]?.image && (<ImageModal setImages={setImages} imagesToUpdate={images} setNewImages={setNewImages} setChanges={setChanges}/>)}
      

      <form className="product-card" onSubmit={handleSubmit}>
        <div className="product-card">
          <div className="input-group">
            <span>Nombre</span>
            <input type="text" className="product-input" placeholder={`Nombre: ${product.name}`} value={name} onChange={handleInputChange(setName)} />
          </div>
          <div className="input-group">
            <span>Precio</span>
            <input type="number" className="product-input" placeholder={`Precio: ${product.price}`} value={price} onChange={handleInputChange(setPrice)} />
          </div>
          <div className="input-group">
            <span>Precio por curva completa</span>
            <input type="number" className="product-input" placeholder={`Precio de curva: ${product.curvePrice}`} value={curvePrice} onChange={handleInputChange(setCurvePrice)} />
          </div>
          <div className="input-group">
            <span>Cantidad total en stock</span>
            <input type="number" className="product-input" placeholder={`Stock: ${product.stock}`} value={stock} onChange={handleInputChange(setStock)} />
          </div>
          <div className="input-group">
            <span>Talle</span>
            <input type="text" className="product-input" placeholder={`Talle: ${product.size}`} value={size} onChange={handleInputChange(setSize)} />
          </div>
          <div className="input-group">
            <span>Color</span>
            <input type="text" className="product-input" placeholder={`Color: ${product.color}`} value={color} onChange={handleInputChange(setColor)} />
          </div>

          {changes ? (
            <button type="submit" className="submit-button">Guardar Cambios</button>
          ) : (
            <button className="go-back" onClick={() => navigate('/inventory')}>Volver al Inventario</button>
          )}
        </div>
      </form>
    </div>
  );
}

export default Product;
