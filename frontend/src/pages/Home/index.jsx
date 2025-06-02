import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useOrder } from '../../hooks/useOrder';
import { ShoppingCart, List, Package, FileSpreadsheet } from 'lucide-react';
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
            <h1 className="welcome-title">
                Hola Hector, que te gustaria hacer hoy?
            </h1>

            {/* Descargar Excels Section */}
            <section className="section-container-excel">
                <h2 className="section-title-excel">Descargar Excels</h2>
                <div className="excel-buttons-container">
                    <button className="excel-button">
                        <FileSpreadsheet size={20} />
                        EXCEL PARA PROVEEDOR
                    </button>
                    <button className="excel-button">
                        <FileSpreadsheet size={20} />
                        EXCEL PARA CLIENTES
                    </button>
                </div>
            </section>

            {/* Sistema de Inventario Section */}
            <section className="section-container">
                <h2 className="section-title">SISTEMA DE INVENTARIO</h2>
                
                <Link to="/inbox" className="home-link">
                    <button className="inventory-button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 21 6 15"></polyline></svg>
                        DINERO Y NOTIFICACIONES
                    </button>
                </Link>

                <div className="inventory-grid">
                    <Link to="/new-order" className="home-link">
                        <div className="inventory-item">
                            <ShoppingCart size={24} style={{ color: '#0066cc' }} />
                            <h3 className="inventory-item-title">
                                {!areProductsInOrder ? 'Nuevo Pedido' : `Continuar el pedido de ${customerData.customerName}`}
                            </h3>
                            <p className="inventory-item-description">Crea o continúa un nuevo pedido</p>
                        </div>
                    </Link>

                    <Link to="/orders" className="home-link">
                        <div className="inventory-item">
                            <List size={24} style={{ color: '#0066cc' }} />
                            <h3 className="inventory-item-title">Pedidos</h3>
                            <p className="inventory-item-description">Órdenes pendientes de los clientes</p>
                        </div>
                    </Link>

                    <Link to="/inventory" className="home-link">
                        <div className="inventory-item">
                            <Package size={24} style={{ color: '#65D7FD' }} />
                            <h3 className="inventory-item-title">Catálogo</h3>
                            <p className="inventory-item-description">Agrega y controla los productos de tu página</p>
                        </div>
                    </Link>
                </div>
            </section>
        </div>
    );
}

export default Home;
