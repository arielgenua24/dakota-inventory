import  { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrder } from '../../hooks/useOrder';
import './styles.css';

const NewOrder = () => {
  const { order, setOrder, clearCustomerData, setCart } = useOrder();
  const [customerData, setCustomerData] = useState({
    customerName: order.customerName || '',
    phone: order.phone || '',
    address: order.address || '',
    dni: order.dni || '',
    province: order.province || '',
    postalCode: order.postalCode || '',
    shippingOption: order.shippingOption || '',
    transport: order.transport || '',
  });

  const navigate = useNavigate();
  console.log(order.products.length)


  const handleChange = (e) => {
    setCustomerData({ ...customerData, [e.target.name]: e.target.value });
  };

  const handleShippingChange = (option) => {
    setCustomerData(prevData => ({
      ...prevData,
      shippingOption: prevData.shippingOption === option ? '' : option,
    }));
  };

  const handleNext = () => {
    setOrder({ ...order, ...customerData }); // Guardar datos en el contexto
    navigate('/select-products'); // Navegar a la siguiente ventana
  };

  const handleClearData = () => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      setCart([])
      clearCustomerData();
      setCustomerData({
        customerName: '',
        phone: '',
        address: '',
        dni: '',
        province: '',
        postalCode: '',
        shippingOption: '',
        transport: '',
      });
      setOrder({
        customerName: '',
        phone: '',
        address: '',
        dni: '',
        province: '',
        postalCode: '',
        shippingOption: '',
        transport: '',
        products: [],
      });
  
      localStorage.clear('cart-r-v1.1');
      console.log('pedido eliminado')
      console.log(JSON.parse(localStorage.getItem('cart-r-v1.1')))
  
    }

  };

  const areProductsInOrder = order.products.length
  console.log(areProductsInOrder)

  return (
    <div className="order-form-container">
      {!areProductsInOrder ? 
        (<h2 className="order-form-title">Nuevo Pedido</h2>) :
        (<h2 className="order-form-title">Continuar el pedido de: {customerData.customerName}</h2>)
      }
      <span className="order-form-label"> Revise los datos del cliente:</span>
      
      <input
        className="order-form-input"
        type="text"
        name="customerName"
        placeholder="Nombre del cliente"
        value={customerData.customerName}
        onChange={handleChange}
      />
      <input
        className="order-form-input"
        type="text"
        name="phone"
        placeholder="Teléfono"
        value={customerData.phone}
        onChange={handleChange}
      />
      <input
        className="order-form-input"
        type="text"
        name="address"
        placeholder="Dirección"
        value={customerData.address}
        onChange={handleChange}
      />
      <input
        className="order-form-input"
        type="text"
        name="dni"
        placeholder="DNI"
        value={customerData.dni}
        onChange={handleChange}
      />
      <input
        className="order-form-input"
        type="text"
        name="province"
        placeholder="Provincia - Localidad"
        value={customerData.province}
        onChange={handleChange}
      />
      <input
        className="order-form-input"
        type="text"
        name="postalCode"
        placeholder="C.P"
        value={customerData.postalCode}
        onChange={handleChange}
      />
      <div className='order-form-input'>
        <label className='check-label'>
          <input
            type="checkbox"
            name="shippingOption"
            className='check'
            checked={customerData.shippingOption === 'domicilio'}
            onChange={() => handleShippingChange('domicilio')}
          />
          Retira en domicilio
        </label>
        <label className='check-label'>
          <input
            type="checkbox"
            name="shippingOption"
            className='check'
            checked={customerData.shippingOption === 'sucursal'}
            onChange={() => handleShippingChange('sucursal')}
          />
          Retira en sucursal
        </label>
        {customerData.shippingOption && <div className='shipping-info'>{`Okay, retira en ${customerData.shippingOption}`}</div>}
      </div>
      <input
        className="order-form-input"
        type="text"
        name="transport"
        placeholder="Transporte"
        value={customerData.transport}
        onChange={handleChange}
      />
      <div className="order-form-buttons">
        <button 
          className="order-form-clear-btn" 
          onClick={handleClearData}>
          Eliminar pedido
        </button>

        <button 
          className="order-form-next-btn" 
          onClick={handleNext}>
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default NewOrder;
