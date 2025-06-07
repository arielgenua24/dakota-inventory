import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import useFirestoreContext from '../../hooks/useFirestoreContext';
import ProductFormModal from '../../modals/ProductFormModal';
import QRModal from '../../modals/Qrmodal';
import ProductSearch from '../../components/ProductSearch';
import EditProductBtn from '../../components/EditProduct';
import QRButton from '../../components/QrGenerateBtn';
import LoadingComponent from '../../components/Loading';
import { auth } from '../../firebaseSetUp';
import qrIcon from '../../assets/icons/icons8-qr-100.png';
import uploadImages from '../../services/uploadImage';


import './styles.css';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [QRcode, setQRcode] = useState("");
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    curvePrice: '',
    size: '',
    color: '',
    stock: ''
  });
   const [images, setImages] = useState({
        image1: '',
        image2: '',
        image3: ''
  });
  
  const navigate = useNavigate();
  const { getProducts, addProduct, deleteProduct, user } = useFirestoreContext();
  console.log(user)

  console.log(auth.currentUser?.email);


  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true)
      const fetchedProducts = await getProducts();
      setProducts(fetchedProducts);
      setIsLoading(false)
    };
    loadProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
  
    let imageURLs = [];
  
    // Si existe al menos una imagen, se suben las que no sean vacías.
    if (images.image1 || images.image2 || images.image3) {
      const imagesToUpload = [images.image1, images.image2, images.image3].filter((img) => img !== '');
      imageURLs = await uploadImages(imagesToUpload);
  
      // Completar hasta tres elementos en caso de faltar alguno.
      while (imageURLs.length < 3) {
        imageURLs.push({ url: undefined });
      }
    }
  
    // Se llama a addProduct según se hayan subido imágenes o no.
    if (imageURLs.length > 0) {
      await addProduct(
        newProduct.name,
        newProduct.price,
        newProduct.curvePrice,
        newProduct.size,
        newProduct.color,
        newProduct.category,
        newProduct.stock,
        imageURLs[0].url,
        imageURLs[1].url,
        imageURLs[2].url
      );
    } else {
      await addProduct(
        newProduct.name,
        newProduct.price,
        newProduct.curvePrice,
        newProduct.size,
        newProduct.color,
        newProduct.category,
        newProduct.stock
      );
    }
  
    setIsModalOpen(false);
    const updatedProducts = await getProducts();
    setProducts(updatedProducts);
  
    // Resetea el estado del nuevo producto.
    setNewProduct({
      name: '',
      price: '',
      curvePrice: '',
      size: '',
      color: '',
      category: '',
      stock: '',
      image1: '',
      image2: '',
      image3: '',
    });
    setIsLoading(false);
  };
  
  
  const handleDelete = async (productId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      try {
        setIsLoading(true);
        await deleteProduct(productId);
        setIsLoading(false);
      } catch (error) {
        console.error("Error al eliminar el producto:", error);
        setIsLoading(false);
      }
    }
  };

 

  return (
    <div className="container">
      <h1 className="TITLE">CATÁLOGO</h1>

      <button 
        style={{
          backgroundColor: '#F1F7FF',
          border: '1px solid #0990FF',
          borderRadius: '20px',
          color: '#0990FF',
          fontSize: '16px',
          fontWeight: 'bold',
          padding: '10px 15px',
          display: 'flex',
          alignItems: 'center',
          gap: '5px'
        }}
      onClick={() => {
        navigate('/qrsearch?redirect=product_data');
      }}> BUSCAR POR QR 
        <img src={qrIcon} alt="Qr icon" style={{
                        width: '30px',
                        height: '30px',
                      }} />
      </button>
      
      <ProductSearch products={products} setQRcode={setQRcode}/>

      <section>
        <h2 className="subtitle">TODO TU CATÁLOGO</h2>
        <div className="inventory">
          {products.length === 0 ? (
            <p>No tienes productos, agrega un producto a tu catálogo.</p>
          ) : (
            products.map(product => (
              <div key={product.id} className="productCard">

              <div className='deleteButtonContainer'>
                <button
                    className="deleteButton"
                    style={{backgroundColor: 'red', color: 'white'}}
                    onClick={async () => {
                      if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
                        try {
                          await handleDelete(product.id);
                          // Opcional: mostrar algún mensaje de éxito
                          window.location.reload(); // O usar alguna función para actualizar la lista
                        } catch (error) {
                          console.error("Error al eliminar el producto:", error);
                          // Opcional: mostrar mensaje de error
                        }
                      }
                    }}
                  >
                    ELIMINAR
                </button>
              </div>
          
          {product.image1 && (
             <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}> 
             <span style={{
                  backgroundColor: 'rgb(252 244 223)',
                  color: 'rgb(228 158 38)',
                  padding: '1rem',
                  borderRadius: '4px',
                  marginBottom: '1rem',
                  fontSize: '1.3rem',
                  fontWeight: '700',
                  lineHeight: 1.5,
                  textAlign: 'center'
                }}>Este producto posee imagenes, actualizas desde aqui para cambiarlas y que afectea a todas sus variantes.</span>
            <div style={{
                        width: '90%',
                        height: '100px',
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '10px',
                        padding: '10px',
                        margin: '0 auto',
                        backgroundColor: '#f5f5f7',
                        borderRadius: '12px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}>
                        {[product.image1, product.image2, product.image3].map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Product view ${index + 1}`}
                            style={{
                              width: '100px',
                              height: '100px',
                              objectFit: 'cover',
                              borderRadius: '8px',
                              border: '2px solid #f5f5f7',
                              transition: 'transform 0.2s ease',
                              cursor: 'pointer',
                            }}
                            onMouseOver={(e) => {
                              e.target.style.transform = 'scale(1.1)';
                            }}
                            onMouseOut={(e) => {
                              e.target.style.transform = 'scale(1)';
                            }}
                          />
                        ))}
                      
              </div>
          </div>
          )}
                <h3 className="productTitle">{product.name}</h3>
                <p className="productDetail">{product.productCode}</p>
                <p className="productDetail">Precio: ${product.price}</p>
                <p className="productDetail">Precio por curva completa: ${product.curvePrice}</p> 
                <p className="productDetail">Stock: {product.stock}</p>
                <p className="productDetail">Talle: {product.size}</p>
                <p className="productDetail">Color: {product.color}</p>


                <QRButton 
                    product={product}
                    onQRGenerate={() => setQRcode(product)}
                  />


                <EditProductBtn product_id={product.id}/>

              </div>


            ))
          )}
        </div>
      </section>

      <button 
        onClick={() => setIsModalOpen(true)}
        className="addButton"
      >
        + Agregar Producto
      </button>

      {isModalOpen && (
        <ProductFormModal handleSubmit={handleSubmit} newProduct={newProduct} setNewProduct={setNewProduct} setIsModalOpen={setIsModalOpen} setImages={setImages} images={images}/>
      )}

      {QRcode && (
        <QRModal 
          QRcode={QRcode}
          setQRcode={setQRcode}
        />
      )}
     <LoadingComponent isLoading={isLoading}/>

    </div>
  );
};

export default Inventory;