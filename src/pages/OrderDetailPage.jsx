import { useParams, useNavigate } from 'react-router-dom';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { 
  ChevronRight, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  ArrowLeft,
  X,
  CreditCard,
  MapPin,
  HelpCircle,
  Star
} from 'lucide-react';
import Navbar from '../components/Navbar';
import './OrderDetailPage.css';

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { orders, rateOrderItem } = useOrders();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const currentOrder = orders.find(o => o.id === orderId);

  if (!currentOrder) {
    return (
      <div className="order-details-loading">
        <Navbar />
        <div className="empty-state">
          <Package size={48} />
          <p>Order not found.</p>
          <button className="btn-primary" onClick={() => navigate('/account')}>Back to Account</button>
        </div>
      </div>
    );
  }

  const subtotal = Number(currentOrder.total) > 50 ? Number(currentOrder.total) - 50 : Number(currentOrder.total);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const handleBuyAgain = (item) => {
    addToCart({
      id: item.id || Date.now(),
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1
    });
    alert(`${item.name} added to cart!`);
    navigate('/cart');
  };

  const handleDownloadInvoice = () => {
    alert("Generating your invoice PDF... Please wait.");
    setTimeout(() => {
      window.print();
    }, 1000);
  };

  const statusSteps = [
    { label: 'Ordered', status: 'Processing', icon: <Clock size={16} /> },
    { label: 'Packed', status: 'Processing', icon: <Package size={16} /> },
    { label: 'On its way', status: 'Shipped', icon: <Truck size={16} /> },
    { label: 'Delivered', status: 'Delivered', icon: <CheckCircle size={16} /> }
  ];

  const getStatusIndex = (status) => {
    if (status === 'Delivered' || status === 'Completed') return 4;
    if (status === 'Out for Delivery') return 3;
    if (status === 'Shipped') return 3;
    return 1; // Processing
  };

  const activeIndex = getStatusIndex(currentOrder.status);

  return (
    <div className="order-details-page">
      <Navbar />
      
      <main className="amz-container">
        {/* Hidden Invoice Header for Printing */}
        <div className="invoice-print-header">
           <div className="amz-print-logo">CrumbleCakes Bakery</div>
           <div className="amz-print-sub">Official Order Receipt</div>
        </div>

        {/* Breadcrumbs */}
        <nav className="amz-nav-crumbs">
          <span onClick={() => navigate('/account')}>Your Account</span>
          <ChevronRight size={14} />
          <span onClick={() => navigate('/account')}>Your Orders</span>
          <ChevronRight size={14} />
          <span className="current">Order Details</span>
        </nav>

        <section className="amz-main-header">
          <div className="title-block">
            <h1>Order Details</h1>
            <div className="meta-info">
              <span>Ordered on {formatDate(currentOrder.date)}</span>
              <span className="sep">|</span>
              <span>Order# {currentOrder.id}</span>
            </div>
          </div>
          <div className="action-block">
            <button className="amz-text-btn" onClick={handleDownloadInvoice}>Download Invoice</button>
          </div>
        </section>

        {/* Info Grid */}
        <div className="amz-info-card-grid">
          <div className="amz-info-card">
            <h3>Shipping Address</h3>
            <div className="amz-card-body">
              <p className="name-bold">{currentOrder.customer || user?.email.split('@')[0]}</p>
              <p>{currentOrder.address}</p>
              <p>India</p>
            </div>
          </div>
          
          <div className="amz-info-card">
            <h3>Payment Method</h3>
            <div className="amz-card-body">
              <div className="pm-row">
                <img src="https://img.icons8.com/color/48/000000/rupay.png" alt="Card" width="24" />
                <span>Cash on Delivery</span>
              </div>
            </div>
          </div>

          <div className="amz-info-card summary-card">
            <h3>Order Summary</h3>
            <div className="amz-card-body">
              <div className="sum-row">
                <span>Item(s) Subtotal:</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="sum-row">
                <span>Shipping:</span>
                <span>₹50.00</span>
              </div>
              <div className="sum-row total">
                <span>Grand Total:</span>
                <span>₹{Number(currentOrder.total).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar Expansion */}
        <div className="amz-tracking-section">
          <div className="tracking-header">
            <div className="status-badge" data-status={currentOrder.status}>
              {currentOrder.status}
            </div>
            <p>Arriving by {formatDate(new Date(new Date(currentOrder.date).getTime() + 86400000 * 2))}</p>
          </div>
          
          <div className="progress-stepper">
            {statusSteps.map((step, idx) => {
              const currentIdx = idx + 1;
              let stateClass = '';
              if (currentIdx < activeIndex) stateClass = 'completed';
              else if (currentIdx === activeIndex) stateClass = 'active';
              
              return (
                <div key={idx} className={`step ${stateClass}`}>
                  <div className="step-circle">{step.icon}</div>
                  <div className="step-label">{step.label}</div>
                  {idx < statusSteps.length - 1 && <div className="step-line"></div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Items */}
        <div className="amz-order-items-list">
          {currentOrder.items && currentOrder.items.map((item, idx) => (
            <div key={idx} className="amz-order-item-box">
              <div className="item-header">
                <h3>{currentOrder.status} {formatDate(currentOrder.date)}</h3>
              </div>
              
              <div className="item-content-row">
                <div className="item-visual">
                  <img src={item.image || 'https://via.placeholder.com/150'} alt={item.name} />
                </div>
                
                <div className="item-info">
                  <h4 className="item-title">{item.name}</h4>
                  <p className="item-meta">Sold by: CrumbleCakes Bakery</p>
                  <p className="item-price">₹{Number(item.price).toFixed(2)}</p>
                </div>

                <div className="item-sidebar">
                  <button className="amz-btn-secondary w-100" onClick={handleDownloadInvoice}>Download Invoice</button>
                  <button className="amz-btn-primary w-100" onClick={() => handleBuyAgain(item)}>Buy it again</button>
                  <button className="amz-btn-secondary w-100" onClick={() => navigate('/#cakes')}>View your item</button>
                  
                  {['Completed', 'Delivered'].includes(currentOrder.status) && (
                    <div className="rating-invite">
                      <h5>Write a product review</h5>
                      <div className="stars-row">
                        {[1,2,3,4,5].map(star => (
                          <Star 
                            key={star} 
                            size={20} 
                            onClick={() => rateOrderItem(currentOrder.id, idx, star)}
                            fill={star <= (item.user_rating || 0) ? "#FFA41C" : "transparent"}
                            color={star <= (item.user_rating || 0) ? "#FFA41C" : "#ddd"}
                            style={{cursor: 'pointer'}}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      
      <footer className="amz-simple-footer">
        <div className="amz-container">
          <p>© 2026, CrumbleCakes Bakery or its affiliates</p>
        </div>
      </footer>
    </div>
  );
}

function StarRating({ rating, onRate }) {
  return (
    <div className="star-rating-comp">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star 
          key={star} 
          size={18} 
          color={star <= rating ? "#FFA41C" : "#ddd"}
          fill={star <= rating ? "#FFA41C" : "transparent"}
          onClick={() => onRate(star)}
          style={{ cursor: 'pointer' }}
        />
      ))}
    </div>
  );
}
