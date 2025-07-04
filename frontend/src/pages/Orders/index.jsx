import useFirestoreContext from '../../hooks/useFirestoreContext'
import LoadingComponent from '../../components/Loading'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import QRmodal from '../../modals/Qrmodal';
import QRButton from '../../components/QrGenerateBtn';
import qrIcon from '../../assets/icons/icons8-qr-100.png';
import { useOrder } from '../../hooks/useOrder';
import OrderSearch from '../../components/OrderSearch';
import './styles.css'

function Orders() {
  const navigate = useNavigate();

  const [isNewData, setIsNewData] = useState(false)
  const [orders, setOrders] = useState([])
  const [QRcode, setQRcode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const {filterOrdersByDate, deleteOrder } = useFirestoreContext()

  const { setOrdersState } = useOrder();

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true)
      const orders = await filterOrdersByDate()
      setOrders(orders)
      setOrdersState((prevState) => [
        ...prevState,
        ...orders.map((order) => ({ id: order.id, state: order.state }))
      ]);
      
      setIsLoading(false)
    }
    fetchOrders()
   
  }, [filterOrdersByDate, isNewData, setOrdersState])
  
  console.log(orders)

  const handleDelete = async (order) => {
   
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      setIsLoading(true)
      setIsNewData(!isNewData)
      await deleteOrder(order.id);
      setIsLoading(false)
    }
   
  }

  return (
    <div className="orders-container">
       <LoadingComponent isLoading={isLoading} />
      <h1>Órdenes</h1>

      <OrderSearch orders={orders} isActionEnabled={true}/>

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
              navigate('/qrsearch?redirect=order-data');
            }}> BUSCAR POR QR 
              <img src={qrIcon} alt="Qr icon" style={{
                              width: '30px',
                              height: '30px',
                            }} />
            </button>
         

      <div className="orders-list">
      {orders.map((order) => (
        <div key={order.id} className="order-card">
          <div style={{width: '100%', display: 'flex', justifyContent: 'space-between', marginBottom: '2rem'}}>
                <QRButton 
                      product={order}
                      onQRGenerate={setQRcode}
                    /> 
    
              <button 
                style={{backgroundColor: '#f44336', color: '#fff', padding: '0.5rem', borderRadius: '0.25rem'}}
                onClick={() => {
                  handleDelete(order)
                }}
              > Eliminar
              </button>

          </div>

          
          <div className="order-header">
            { order.estado === 'listo para despachar' ?  (<div>
            <span style={{ backgroundColor: '#0FCA37', color: '#fff', padding: '0.5rem', borderRadius: '0.25rem' }}>
              Estado: {order.estado} 🎉
            </span>
            </div>
              ) : <span style={{
                backgroundColor: '#fff9c4', // Amarillo crema
                padding: '0.2rem 0.5rem',
                border: '2px solid #fbc02d',
                borderRadius: '4px',
                marginLeft: '0.5rem',
                display: 'inline-flex',
                alignItems: 'center',
                animation: 'jump 0.5s infinite alternate', // Animación
              }}>Estado: {order.estado}⚠️</span> }
           
           <div style={{marginTop: '20px'}}className="verify-products">
              <button 
                className="verify-button"
                onClick={() => navigate(`/ProductsVerification/${order.id}/?orderEstado=${order.estado}`)}
              >
                Verificar Productos
              </button>
          </div>


            <h3>Código de orden: {order.orderCode}</h3>
            <p>Fecha: {order.fecha}</p>
          </div>
          <div className="order-details">
            <p><strong>Cliente:</strong> {order.cliente}</p>
            <p><strong>Dirección:</strong> {order.direccion}</p>
            <p><strong>Teléfono:</strong> {order.telefono}</p>
            {order.dni && <p><strong>DNI:</strong> {order.dni}</p>}
            {order.province && <p><strong>Provincia - Localidad:</strong> {order.province}</p>}
            {order.postalCode && <p><strong>C.P:</strong> {order.postalCode}</p>}
            {order.shippingOption && <p><strong>Opción de envío:</strong> Retira en {order.shippingOption}</p>}
            {order.transport && <p><strong>Transporte:</strong> {order.transport}</p>}
          </div>
        </div>
      ))}
  </div>

  {QRcode && (
          <QRmodal 
          QRcode={QRcode}
          setQRcode={setQRcode}
          orderCode={true}
          />
      )}
    </div>
  )
}

export default Orders