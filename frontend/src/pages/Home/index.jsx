import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useOrder } from '../../hooks/useOrder';
import { Inbox, ShoppingCart, List, Package } from 'lucide-react';
import './styles.css';

function Home() {
    const { order, setOrder, getCustomerData } = useOrder();

    const [customerData, setCustomerData] = useState({
        customerName: order.customerName || '',
        phone: order.phone || '',
        address: order.address || '',
    });

    useEffect(() => {
        let data = getCustomerData();
        if (data.customerName !== '') {
            setOrder(data);
            setCustomerData(data);
        }
    }, []);

    const areProductsInOrder = order.products.length;

    return (
        <div className="home-container">
            <h1 className="home-title" >
                    Hola Majo! que te gustaria hacer hoy ?
                </h1>

            {/*
                <Link to="/inbox" className="home-link">
                <button className="home-btn inbox">
                    <Inbox size={24} className="home-icon" />
                    Dinero y notificaciones
                    <span className="home-subtext">Revisar dinero recibido y avisos</span>
                </button>
            </Link>

            <div className="home-orders-section">
                <Link to="/new-order" className="home-link">
                    <button className="home-btn order">
                        <ShoppingCart size={24} className="home-icon" />
                        {!areProductsInOrder ? 'Nuevo Pedido' : `Continuar el pedido de ${customerData.customerName}`}
                        <span className="home-subtext">Crea o continúa un nuevo pedido</span>
                    </button>
                </Link>

                <Link to="/orders" className="home-link">
                    <button className="home-btn order">
                        <List size={24} className="home-icon" />
                        Pedidos
                        <span className="home-subtext">Órdenes pendientes de los clientes</span>
                    </button>
                </Link>
            </div>
            
            */}

            <Link to="/inventory" className="home-link">
                <button className="home-btn catalog">
                    <div style={{display: 'flex', alignItems: 'center', flexDirection: 'row ', width: '100%', gap: 'calc(1rem + 1vw)'}}>
                        <Package size={24} className="home-icon" />
                        <h1 className='catalog-title' >Catálogo</h1>
                    </div>
                    
                    <span className="home-subtext">Agrega y controla los productos de tu pagina.</span>
                </button>
            </Link>
        </div>
    );
}

export default Home;
