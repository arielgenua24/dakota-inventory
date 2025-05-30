import React, { useEffect, useState } from 'react';
import searchProducts from '../../utils/searchFn';
import useFirestoreContext from '../../hooks/useFirestoreContext';
import LoadingComponent from '../../components/Loading';
import showSuggestionNotification from '../../utils/showSuggestionNotification';
import ImageModal from '../ImageModal';
import './styles.css';

function ProductFormModal({ handleSubmit, newProduct, setNewProduct, setIsModalOpen, setImages, images }) {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false)
  const [products, setProducts] = useState([]);

  const {getProducts} = useFirestoreContext();

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true)
      const fetchedProducts = await getProducts();
      setProducts(fetchedProducts);
      console.log(fetchedProducts);
      setIsLoading(false)
    };
    loadProducts();
  }, []);


  


  const handleNameChange = async (e) => {
    const value = e.target.value;
    console.log(value)
    setNewProduct({ ...newProduct, name: value });
    
    // Realizamos la búsqueda cuando el texto tiene al menos 3 caracteres
    if (value.length >= 3) {
      console.log('working search')
      try {
        const results = await searchProducts(products, value);
        setSuggestions(results);
      } catch (error) {
        console.error("Error al buscar productos:", error);
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    // Al hacer click en la sugerencia, se completan los datos deseados
    setNewProduct({
      ...newProduct,
      name: suggestion.name,
      price: suggestion.price,
      color: suggestion.color,
      category: suggestion.category,
    });
     // setImages({image1: suggestion.image1, image2: suggestion.image2, image3: suggestion.image3});
    setSuggestions([]);
    // Mostrar la notificación
    showSuggestionNotification();
  };

  return (
    <div className="modal">

      {isLoading && LoadingComponent}
      <form onSubmit={handleSubmit} className="modalContent">
        <h3 className="subtitle">Nuevo Producto</h3>

        <div className='form-groups'>
          <div className='form-div-image-media'>
              <ImageModal setImages={setImages} suggestedImages={images}/>
          </div>
        
          <div className='form-div-media'>
            {/* Campo para "Nombre del producto" con autocompletado */}
          <div className="formGroup">
            <label className="label">Nombre del producto</label>
            <input
              type="text"
              //this in is broken after chosing a recommendation, it doesn't work after chosing a product
              value={newProduct.name}
              onChange={handleNameChange}
              className="input"
            />
            {suggestions.length > 0 && (
              <div className="suggestion-input--container">

                <ul className="suggestion-input--list">
                      {suggestions.map((suggestion, index) => (
                        <li 
                          key={index} 
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="suggestion-input--item"
                        >
                          <span className="suggestion-input--name">{suggestion.name}</span>
                          <span className="suggestion-input--category">{suggestion.category}</span>
                          <span className="suggestion-input--color">{suggestion.color}</span>
                          <span className="suggestion-input--price">${suggestion.price}</span>
                        </li>
                      ))}
                    </ul>
              </div>

            )}
          </div>

          {/*
            Se renderizan los demás campos del formulario.
            En este ejemplo, se excluye "name" ya que lo gestionamos de manera especial.
          */}
          {['category', 'price', 'size', 'color', 'stock'].map((field) => (
            <div key={field} className="formGroup">
              <label className="label">
                {field === 'price'
                  ? 'Precio'
                  : field === 'size'
                  ? 'Talle'
                  : field === 'color'
                  ? 'Color'
                  : field === 'category'
                  ? 'Categoría'
                  : field === 'stock'
                  ? 'Cantidad en inventario'
                  : field}
              </label>
            {field === 'category' && (
              <>
                {/* Divs flotantes con las categorías permitidas */}
                <div className="advice-input">
                  Majo! Ya no escribas las cateogías, hacé click en la que quieras😉🔥
                </div>
                <div className="category-float-container">
                  {[
                    "bermuda",
                    "jean",
                    "baggy",
                    "Clásico",
                    "ReIngreso",
                    "joggers",
                    "parachutte",
                    "frisa",
                    "Camperas",
                    "Chalecos",
                    "Nuevos",
                    "PocoStock"
                  ].map((cat) => (
                    <div
                      key={cat}
                      className="category-float"
                      onClick={() =>
                        setNewProduct({ ...newProduct, category: cat })
                      }
                    >
                      {cat}
                    </div>
                  ))}
                </div>
              </>
            )}
            <input
              type={field === 'price' || field === 'stock' ? 'number' : 'text'}
              value={newProduct[field]}
              onChange={(e) =>
                setNewProduct({
                  ...newProduct,
                  [field]: e.target.value,
                })
              }
              className="input"
              required
              {...(field === 'category' && {
                pattern:
                  "^(bermuda|jean|baggy|Clásico|ReIngreso|joggers|parachutte|frisa|Camperas|Chalecos|Nuevos|PocoStock)$",
                title:
                  "Solo puede escribir: bermuda, jean, baggy, Clásico, ReIngreso, joggers, parachutte, frisa, Camperas, Chalecos, Nuevos, PocoStock",
              })}
            />
          </div>
          ))}

          <div className="buttonGroup">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              style={{ backgroundColor: 'red', color: '#fff' }}
              className="button"
            >
              Salir
            </button>

            <button type="submit" className="button">
              Guardar
            </button>
          </div>


          </div>
        </div>

        

       
      </form>
    </div>
  );
}

export default ProductFormModal;
