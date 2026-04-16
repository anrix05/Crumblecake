import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  MapPin, 
  User, 
  LogOut, 
  ChevronRight, 
  Clock, 
  CheckCircle, 
  Truck, 
  ShoppingBag,
  Phone,
  X,
  Star,
  Palette
} from 'lucide-react';
import Navbar from '../components/Navbar';
import './AccountPage.css';

const OrderTimer = ({ createdAt, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState('');

  const calculateTime = useCallback(() => {
    if (!createdAt) return null;
    const isISO = createdAt.includes('T');
    const start = isISO ? new Date(createdAt).getTime() : 0;
    if (!isISO) return null;

    const now = new Date().getTime();
    const diff = (start + 30 * 60 * 1000) - now;
    
    if (diff <= 0) {
      onExpire();
      return null;
    }

    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    return `${mins}m ${secs}s`;
  }, [createdAt, onExpire]);

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = calculateTime();
      if (remaining) setTimeLeft(remaining);
      else clearInterval(timer);
    }, 1000);
    
    setTimeLeft(calculateTime());
    return () => clearInterval(timer);
  }, [calculateTime]);

  if (!timeLeft) return null;

  return (
    <div className="order-timer">
      <Clock size={14} />
      <span>Cancel within {timeLeft}</span>
    </div>
  );
};

const StarRating = ({ rating, onRate, readOnly = false }) => {
  const [hover, setHover] = useState(0);

  return (
    <div className={`star-rating ${readOnly ? 'read-only' : ''}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readOnly && onRate(star)}
          onMouseEnter={() => !readOnly && setHover(star)}
          onMouseLeave={() => !readOnly && setHover(0)}
          className={`star-btn ${(hover || rating) >= star ? 'active' : ''}`}
          disabled={readOnly}
        >
          <Star 
            size={18} 
            fill={(hover || rating) >= star ? "currentColor" : "none"} 
            strokeWidth={2}
          />
        </button>
      ))}
    </div>
  );
};

export default function AccountPage() {
  const { user, signOut, savedAddress, savedName, savedPhone, updateProfile } = useAuth();
  const { orders, updateOrderStatus, rateOrderItem } = useOrders();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [nameInput, setNameInput] = useState(savedName || '');
  const [phoneInput, setPhoneInput] = useState(savedPhone || '');
  const [addressInput, setAddressInput] = useState(savedAddress || '');
  const [updateMsg, setUpdateMsg] = useState('');
  const [cancellableOrders, setCancellableOrders] = useState({});

  const checkCancellable = useCallback((order) => {
    if (order.status !== 'Processing' || order.status === 'Cancelled') return false;
    if (!order.date || !order.date.includes('T')) return false;
    const start = new Date(order.date).getTime();
    const now = new Date().getTime();
    return (now - start) < (30 * 60 * 1000);
  }, []);

  useEffect(() => {
    const initial = {};
    const myOrders = orders.filter(o => o.email === user.email);
    myOrders.forEach(o => {
      if (checkCancellable(o)) initial[o.id] = true;
    });
    setCancellableOrders(initial);
  }, [orders, user.email, checkCancellable]);

  if (!user) {
    navigate('/');
    return null;
  }

  // Filter orders for this user
  const myOrders = orders.filter(order => order.email === user.email);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const { error } = await updateProfile({ 
      full_name: nameInput,
      phone: phoneInput,
      address: addressInput 
    });
    if (!error) {
      setUpdateMsg('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setUpdateMsg(''), 3000);
    } else {
      setUpdateMsg('Error updating profile.');
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      await updateOrderStatus(orderId, 'Cancelled');
      setUpdateMsg('Order cancelled successfully.');
      setTimeout(() => setUpdateMsg(''), 3000);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Processing': return <Clock size={18} />;
      case 'Out for Delivery': return <Truck size={18} />;
      case 'Completed': return <CheckCircle size={18} />;
      default: return <Package size={18} />;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    if (!dateStr.includes('T')) return dateStr; // Fallback for old orders
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="account-page">
      <Navbar />
      
      <div className="account-container">
        {/* Header Section */}
        <header className="account-header">
          <div className="user-info">
            <div className="user-avatar">
              {user.email[0].toUpperCase()}
            </div>
            <div>
              <h1>Welcome, {savedName || user.email.split('@')[0]}</h1>
              <p>{user.email}</p>
            </div>
          </div>
          <button className="btn-logout" onClick={() => { signOut(); navigate('/'); }}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </header>

        <div className="account-content">
          {/* Sidebar Navigation */}
          <aside className="account-sidebar">
            <nav>
              <button 
                className={activeTab === 'orders' ? 'active' : ''} 
                onClick={() => setActiveTab('orders')}
              >
                <Package size={20} />
                <span>My Orders</span>
              </button>
              <button 
                className={activeTab === 'profile' ? 'active' : ''} 
                onClick={() => setActiveTab('profile')}
              >
                <MapPin size={20} />
                <span>Saved Address</span>
              </button>
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="account-main">
            {activeTab === 'orders' ? (
              <div className="tab-pane">
                <div className="pane-header">
                  <h2>Order History</h2>
                  <span>{myOrders.length} Orders</span>
                </div>

                {myOrders.length === 0 ? (
                  <div className="empty-state">
                    <ShoppingBag size={48} />
                    <p>You haven't placed any orders yet.</p>
                    <button className="btn-primary" onClick={() => navigate('/')}>Explore Cakes</button>
                  </div>
                ) : (
                  <div className="order-list">
                    {myOrders.map(order => (
                      <div key={order.id} className="order-card">
                        <div className="order-card-header">
                          <div className="order-id">
                            <span>Order ID</span>
                            <strong style={{display: 'flex', alignItems: 'center', gap: '6px'}}>#{order.id}
                              {Array.isArray(order.items) && order.items.some(i => i.type === 'custom') && (
                                <span style={{background: 'linear-gradient(135deg, #8B5CF6, #A855F7)', color: 'white', fontSize: '0.55rem', fontWeight: '800', padding: '2px 7px', borderRadius: '9999px', letterSpacing: '0.06em'}}>CUSTOM</span>
                              )}
                            </strong>
                          </div>
                          <div className={`status-badge ${order.status.toLowerCase().replace(/\s/g, '-')}`}>
                            {getStatusIcon(order.status)}
                            <span>{order.status}</span>
                          </div>
                          <button className="btn-view-details-header" onClick={() => setSelectedOrder(order)}>
                            Details <ChevronRight size={14} />
                          </button>
                        </div>
                        
                        <div className="order-card-body">
                           <div className="order-details">
                             <div className="detail-item">
                               <span className="label">Date:</span>
                               <span className="value">{formatDate(order.date)}</span>
                             </div>
                             <div className="detail-item">
                               <span className="label">{Number(order.total) === 0 ? '' : 'Total Paid:'}</span>
                               {Number(order.total) === 0 ? (
                                 <span className="value" style={{color: '#EA580C', fontWeight: 700, fontSize: '0.95rem'}}>⏳ Price Pending</span>
                               ) : (
                                 <span className="value price">₹{Number(order.total).toFixed(2)}</span>
                               )}
                             </div>
                           </div>
                           <div className="order-actions">
                             {cancellableOrders[order.id] && (
                               <div className="cancellation-zone">
                                 <OrderTimer 
                                   createdAt={order.date} 
                                   onExpire={() => setCancellableOrders(prev => ({...prev, [order.id]: false}))} 
                                 />
                                 <button className="btn-cancel-order" onClick={() => handleCancelOrder(order.id)}>
                                   Cancel Order
                                 </button>
                               </div>
                             )}
                           </div>
                         </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="tab-pane">
                <div className="pane-header">
                  <h2>Profile & Address</h2>
                </div>

                <div className="profile-section">
                  <form onSubmit={handleUpdateProfile} className="profile-form">
                    <div className="profile-group">
                      <label><User size={16} /> Full Name</label>
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={nameInput} 
                          onChange={(e) => setNameInput(e.target.value)} 
                          placeholder="Enter your name"
                        />
                      ) : (
                        <p>{savedName || <span className="no-data">Not provided</span>}</p>
                      )}
                    </div>

                    <div className="profile-group">
                      <label><Phone size={16} /> Phone Number</label>
                      {isEditing ? (
                        <input 
                          type="tel" 
                          value={phoneInput} 
                          onChange={(e) => setPhoneInput(e.target.value)} 
                          placeholder="+91 00000 00000"
                        />
                      ) : (
                        <p>{savedPhone || <span className="no-data">Not provided</span>}</p>
                      )}
                    </div>

                    <div className="profile-group">
                      <label><User size={16} /> Email Address</label>
                      <p className="immutable">{user.email}</p>
                    </div>

                    <div className="profile-group">
                      <label><MapPin size={16} /> Saved Delivery Address</label>
                      {isEditing ? (
                        <textarea 
                          value={addressInput}
                          onChange={(e) => setAddressInput(e.target.value)}
                          placeholder="Enter your full delivery address..."
                          rows="3"
                        />
                      ) : (
                        <p>{savedAddress || <span className="no-data">No address saved yet.</span>}</p>
                      )}
                    </div>

                    <div className="profile-actions">
                      {isEditing ? (
                        <div className="form-actions">
                          <button type="submit" className="btn-save">Save Changes</button>
                          <button type="button" className="btn-cancel" onClick={() => setIsEditing(false)}>Cancel</button>
                        </div>
                      ) : (
                        <button type="button" className="btn-edit" onClick={() => setIsEditing(true)}>
                          Edit Profile Details
                        </button>
                      )}
                    </div>
                  </form>
                  {updateMsg && <p className={`update-msg ${updateMsg.includes('Error') ? 'error' : 'success'}`}>{updateMsg}</p>}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (() => {
        const currentOrder = orders.find(o => o.id === selectedOrder.id) || selectedOrder;
        return (
          <div className="order-modal-overlay" onClick={() => setSelectedOrder(null)}>
            <div className="order-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h2>Order Receipt</h2>
                  <p>#{currentOrder.id} • {formatDate(currentOrder.date)}</p>
                </div>
                <button className="close-modal" onClick={() => setSelectedOrder(null)}>
                  <X size={20} />
                </button>
              </div>
              
              <div className="modal-body">
                <div className="modal-section">
                  <h3>Items Purchased</h3>
                  <div className="modal-items">
                    {currentOrder.items && currentOrder.items.map((item, idx) => (
                      <div key={idx} className="modal-item-rating-wrapper">
                        {item.type === 'custom' ? (
                          <div className="custom-order-detail" style={{padding: '1rem', backgroundColor: 'var(--color-surface-low)', borderRadius: '12px'}}>
                            <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem'}}>
                              <Palette size={18} color="#8B5CF6" />
                              <span style={{fontWeight: 800, color: '#8B5CF6', fontSize: '0.95rem', letterSpacing: '0.02em'}}>Custom Cake Request</span>
                            </div>
                            {item.image && (
                              <img src={item.image} alt="Reference" style={{width: '100%', maxHeight: '400px', objectFit: 'contain', backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: '12px', marginBottom: '1rem', border: '1px solid var(--color-outline-variant)'}} />
                            )}
                            <div style={{backgroundColor: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--color-outline-variant)'}}>
                              <p style={{fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--color-text-dark)'}}>{item.name}</p>
                              <p style={{fontSize: '0.9rem', color: 'var(--color-text-light)', marginBottom: '1rem', lineHeight: '1.5'}}>{item.description}</p>
                              <p style={{fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)', display: 'inline-block', backgroundColor: 'var(--color-primary-light)', padding: '0.3rem 0.8rem', borderRadius: '20px'}}>Size: {item.size}</p>
                              {Number(currentOrder.total) === 0 && (
                                <div style={{marginTop: '1rem', padding: '0.75rem 1rem', background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: '8px', fontSize: '0.85rem', color: '#9A3412', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px'}}>
                                  ⏳ Price will be updated by the bakery soon
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="modal-item" style={{backgroundColor: 'var(--color-surface-lowest)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--color-outline-variant)', marginBottom: '0.5rem'}}>
                              <div className="item-main">
                                <span className="item-qty" style={{fontWeight: '800'}}>{item.quantity}x</span>
                                <span className="item-name" style={{fontWeight: '700', color: 'var(--color-text-dark)'}}>{item.name}</span>
                              </div>
                              <span className="item-price" style={{fontWeight: '800'}}>₹{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                            
                            {['Completed', 'Delivered'].includes(currentOrder.status) && (
                              <div className="item-rating-row" style={{padding: '0.5rem 1rem 1rem'}}>
                                <span className="rating-label">
                                  {item.user_rating ? 'Your Rating:' : 'Rate this item:'}
                                </span>
                                <StarRating 
                                  rating={item.user_rating || 0} 
                                  onRate={(val) => rateOrderItem(currentOrder.id, idx, val)}
                                />
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="modal-section">
                  <h3>Delivery Details</h3>
                  <div className="delivery-info">
                    <p className="delivery-formatted">{currentOrder.address}</p>
                  </div>
                </div>

                <div className="modal-summary">
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <span>₹{(Number(currentOrder.total) - 50).toFixed(2)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Delivery Fee</span>
                    <span>₹50.00</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total Paid</span>
                    <span>₹{Number(currentOrder.total).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <div className={`status-pill ${currentOrder.status.toLowerCase().replace(/\s/g, '-')}`}>
                  {getStatusIcon(currentOrder.status)}
                  {currentOrder.status}
                </div>
                {cancellableOrders[currentOrder.id] && (
                  <button 
                    className="btn-cancel-order large" 
                    onClick={() => {
                      handleCancelOrder(currentOrder.id);
                      setSelectedOrder(null);
                    }}
                  >
                    Cancel Order Now
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
