import PropTypes from 'prop-types';
import QRButton from '../QrGenerateBtn';
import EditProductBtn from '../EditProduct';
import './styles.css';

const ProductCard = ({ product, handleDelete, onQRGenerate, onShowVariants, showVariantsButton = true }) => {
  return (
    <div key={product.id} className="productCard">
      <div className='deleteButtonContainer'>
        <button
          className="deleteButton"
          style={{ backgroundColor: 'red', color: 'white' }}
          onClick={async () => {
            if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
              try {
                await handleDelete(product.id);
                window.location.reload();
              } catch (error) {
                console.error("Error al eliminar el producto:", error);
              }
            }
          }}
        >
          ELIMINAR
        </button>
      </div>

      {product.image1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
              image && <img
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
        onQRGenerate={() => {
          console.log(product)
          onQRGenerate(product)}}
      />

      {showVariantsButton && onShowVariants && (
        <button
          style={{
            backgroundColor: '#D1FFD6',
            color: '#02801D',
            padding: '8px 12px',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            marginBottom: '10px',
          }}
          onClick={() => onShowVariants(product)}
        >
          VER VARIANTES E IMÁGENES
        </button>
      )}

            <EditProductBtn product_id={product.id} />

      {product.image1 && (
        <button
          className="glass-button"
          onClick={() => {
                        const baseUrl = import.meta.env.VITE_CONTENT_CREATION_URL;
            const params = new URLSearchParams({
              productName: product.name,
              originalPrice: product.price,
              discountPrice: 0,
              tagLine: `Ofertas en Thoren`,
              imageUrl: product.image1,
            });
            window.open(`${baseUrl}?${params.toString()}`, '_blank');
          }}
        >
          CREAR PUBLICACIÓN
        </button>
      )}

    </div>
  );
};

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    productCode: PropTypes.string,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    curvePrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    stock: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    size: PropTypes.string,
    color: PropTypes.string,
    image1: PropTypes.string,
    image2: PropTypes.string,
    image3: PropTypes.string,
  }).isRequired,
  handleDelete: PropTypes.func.isRequired,
  onQRGenerate: PropTypes.func.isRequired,
  onShowVariants: PropTypes.func,
  showVariantsButton: PropTypes.bool,
};

export default ProductCard;
