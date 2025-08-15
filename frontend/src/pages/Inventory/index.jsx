import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import useFirestoreContext from '../../hooks/useFirestoreContext';
import { useProducts } from '../../hooks/useProducts';
import ProductFormModal from '../../modals/ProductFormModal';
import QRModal from '../../modals/Qrmodal';
import ProductSearch from '../../components/ProductSearch';

import LoadingComponent from '../../components/Loading';
import { auth } from '../../firebaseSetUp';
import qrIcon from '../../assets/icons/icons8-qr-100.png';
import uploadImages from '../../services/uploadImage';
import ProductCard from '../../components/ProductCard';
import VariantsModal from '../../modals/VariantsModal';
import { autoCompileCache, manualCompileCache } from '../../services/cacheCompiler';


import './styles.css';

const Inventory = () => {
  const { clearProducts } = useProducts();

  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [QRcode, setQRcode] = useState("");
  const [isVariantsOpen, setIsVariantsOpen] = useState(false);
  const [baseProduct, setBaseProduct] = useState(null);
  const [showCompilerModal, setShowCompilerModal] = useState(false);
  const [compilerPassword, setCompilerPassword] = useState('');
  const [compilerMessage, setCompilerMessage] = useState('');
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
    clearProducts(); // Si el usuario va a editar los productos o cargarlos, entonces debemos eliminar el sessionStorage para que no se rompa a la hora de hacer otro pedido.
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

    const productName = newProduct.name.toLowerCase();
    const productColor = newProduct.color.toLowerCase();

    const finalName = productName.includes(productColor)
      ? newProduct.name
      : `${newProduct.name} ${newProduct.color}`;

    const productToSave = {
      ...newProduct,
      name: finalName,
    };

    // Se llama a addProduct según se hayan subido imágenes o no.
    if (imageURLs.length > 0) {
      await addProduct(
        productToSave.name,
        productToSave.price,
        productToSave.curvePrice,
        productToSave.size,
        productToSave.color,
        productToSave.category,
        productToSave.stock,
        imageURLs[0].url,
        imageURLs[1].url,
        imageURLs[2].url
      );
    } else {
      await addProduct(
        productToSave.name,
        productToSave.price,
        productToSave.curvePrice,
        productToSave.size,
        productToSave.color,
        productToSave.category,
        productToSave.stock
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
    
    // Trigger automático de compilación de caché
    setTimeout(() => {
      autoCompileCache().then(result => {
        if (result.success) {
          console.log('Cache automatically updated after adding product');
        }
      });
    }, 1000); // Pequeño delay para asegurar que Firestore esté actualizado
  };
  
  
  const handleDelete = async (productId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      try {
        setIsLoading(true);
        await deleteProduct(productId);
        setIsLoading(false);
        
        // Trigger automático de compilación de caché
        setTimeout(() => {
          autoCompileCache().then(result => {
            if (result.success) {
              console.log('Cache automatically updated after deleting product');
            }
          });
        }, 1000);
      } catch (error) {
        console.error("Error al eliminar el producto:", error);
        setIsLoading(false);
      }
    }
  };

  const handleManualCompile = async () => {
    setCompilerMessage('Compilando caché...');
    const result = await manualCompileCache(compilerPassword);
    
    if (result.success) {
      setCompilerMessage('✅ Caché compilado exitosamente');
      setTimeout(() => {
        setShowCompilerModal(false);
        setCompilerPassword('');
        setCompilerMessage('');
      }, 2000);
    } else {
      setCompilerMessage('❌ ' + (result.message || 'Error al compilar'));
    }
  };

 

  return (
    <div className="container">
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h1 className="TITLE">CATÁLOGO</h1>
        
        {/* Botón de configuración para compilación manual */}
        <button
          onClick={() => setShowCompilerModal(true)}
          style={{
            backgroundColor: '#f0f0f0',
            border: '1px solid #ccc',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background-color 0.3s'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#e0e0e0'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#f0f0f0'}
          title="Actualizar página web"
        >
          ⚙️
        </button>
      </div>

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
                            <ProductCard 
                key={product.id} 
                product={product} 
                handleDelete={handleDelete} 
                onQRGenerate={setQRcode}
                onShowVariants={(p) => {
                  setBaseProduct(p);
                  setIsVariantsOpen(true);
                }}
              />


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

      {isVariantsOpen && baseProduct && (
        <VariantsModal
          products={products}
          baseProduct={baseProduct}
          onClose={() => setIsVariantsOpen(false)}
          handleDelete={handleDelete}
          onQRGenerate={setQRcode}
        />
      )}

      {/* Modal de compilación manual */}
      {showCompilerModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '10px',
            width: '400px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ marginBottom: '20px' }}>Actualizar Página Web</h3>
            
            <p style={{ marginBottom: '15px', color: '#666', fontSize: '14px' }}>
              Esta función actualiza el caché de la tienda online.
              Se requiere contraseña de administrador.
            </p>
            
            <input
              type="password"
              placeholder="Contraseña"
              value={compilerPassword}
              onChange={(e) => setCompilerPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '15px',
                border: '1px solid #ddd',
                borderRadius: '5px'
              }}
            />
            
            {compilerMessage && (
              <p style={{
                marginBottom: '15px',
                color: compilerMessage.includes('✅') ? 'green' : 'red',
                fontSize: '14px'
              }}>
                {compilerMessage}
              </p>
            )}
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleManualCompile}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Compilar
              </button>
              
              <button
                onClick={() => {
                  setShowCompilerModal(false);
                  setCompilerPassword('');
                  setCompilerMessage('');
                }}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Inventory;