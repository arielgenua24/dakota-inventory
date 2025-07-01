import useFirestoreContext from '../../hooks/useFirestoreContext'
import LoadingComponent from '../../components/Loading'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import EarningsModal from '../../modals/EarningModal'
import './styles.css'
import { use } from 'react'

function Inbox() {
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(false);
  const { filterOrdersByDate, getProductsByOrder } = useFirestoreContext()
  const navigate = useNavigate()

  const getOrderNavigation = (id, estado) => { 
      navigate(`/productsVerification/${id}/?orderEstado=${estado}`)
  }


  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true)
      try {
        const ordersList = await filterOrdersByDate()
        const ordersWithDetails = await Promise.all(
          ordersList.map(async (order) => {
            const products = await getProductsByOrder(order.id)
            const total = products.reduce((acc, item) => {
              const price = item.productData?.curvePrice ? parseFloat(item.productData.curvePrice) : parseFloat(item.productData.price)
              return acc + (item.stock * price)
            }, 0)
            
            return {
              ...order,
              total,
              clientName: order.client?.name || 'Cliente no especificado',
              address: order.client?.address || 'Dirección no especificada',
              formattedDate: new Date(order.createdAt?.seconds * 1000).toLocaleDateString('es-ES')
            }
          })
        )
        setOrders(ordersWithDetails)
      } catch (error) {
        console.error("Error fetching orders:", error)
      }
      setIsLoading(false)
    }
    
    fetchOrders()
  }, [filterOrdersByDate, getProductsByOrder])
  console.log(orders)

  return (
    <div className="inbox-container">
      <LoadingComponent isLoading={isLoading} />
      <EarningsModal orders={orders} />
      {!isLoading && (
        <div className="orders-grid">
          <h2 style={{color: '#2c3e50', fontSize: '2rem', fontWeight: 'bold', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '2px solid #e55c2e', width: '100%', padding: '10px'}}> GANANCIAS INDIVIDUALES </h2>
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="card-header">
                <span className="order-date">{order.fecha}</span>
                <div className="confetti">🎉</div>
              </div>
              
              <div className="card-content">
                <div className="total-display" style={{ backgroundColor: '#0FCA37' }}>
                  <span className="total-text"> Haz ganado: ${order.total.toLocaleString('es-ES')}</span>
                </div>
                
                <div className="order-details">
                  <p className="detail-line">
                    Pedido número: <strong>{order.orderCode}</strong>
                  </p>
                  <p className="detail-line">
                    Cliente: <strong>{order.cliente}</strong>
                  </p>
                  <p className="detail-line">
                    Dirección: <em>{order.direccion}</em>
                  </p>
                  <p className="detail-line">
                    Telefono: <em>{order.telefono}</em>
                  </p>

                  
                </div>
              </div>

              <button onClick={()=>{getOrderNavigation(order.id, order.estado)}}> VER LA ORDEN</button>

            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Inbox;