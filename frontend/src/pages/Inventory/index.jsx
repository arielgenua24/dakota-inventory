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


import './styles.css';

const Inventory = () => {
  const { clearProducts } = useProducts();

  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [QRcode, setQRcode] = useState("");
  const [isVariantsOpen, setIsVariantsOpen] = useState(false);
  const [baseProduct, setBaseProduct] = useState(null);
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

    </div>
  );
};

export default Inventory;