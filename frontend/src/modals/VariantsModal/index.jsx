import React from 'react';
import PropTypes from 'prop-types';
import ProductCard from '../../components/ProductCard';

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0,0,0,0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const contentStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '23px',
  maxWidth: '90vw',
  maxHeight: '85vh',
  overflowY: 'auto',
  padding: '2rem',
  boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
  position: 'relative',
};

const closeButtonStyle = {
  position: 'absolute',
  top: '1rem',
  right: '1rem',
  background: 'none',
  border: 'none',
  fontSize: '1.5rem',
  cursor: 'pointer',
};

const titleStyle = {
  color: '#000000',
  fontFamily: '"DM Sans", sans-serif',
  fontSize: '22px',
  marginBottom: '1.5rem',
  textAlign: 'center',
};

function VariantsModal({ products = [], baseProduct, onClose, handleDelete, onQRGenerate }) {
  const variants = React.useMemo(() => {
    if (!products.length || !baseProduct) return [];
    const filtered = products.filter(
      (p) => p.name?.toLowerCase() === baseProduct.name?.toLowerCase()
    );
    // Priorizar los que poseen imagen
    return filtered.sort((a, b) => (b.image1 ? 1 : 0) - (a.image1 ? 1 : 0));
  }, [products, baseProduct]);

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div
        style={contentStyle}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <button style={closeButtonStyle} onClick={onClose} aria-label="Cerrar modal">
          &times;
        </button>
        <h2 style={titleStyle}>Variantes de {baseProduct?.name}</h2>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '20px',
            justifyContent: 'center',
          }}
        >
          {variants.map((variant) => (
            <ProductCard
              key={variant.id}
              product={variant}
              handleDelete={handleDelete}
              onQRGenerate={onQRGenerate}
              showVariantsButton={false}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

VariantsModal.propTypes = {
  products: PropTypes.arrayOf(PropTypes.object).isRequired,
  baseProduct: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  onQRGenerate: PropTypes.func.isRequired,
};

export default VariantsModal;