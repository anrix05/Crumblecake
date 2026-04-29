import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { useCart } from '../context/CartContext';
import { useNavigate, Link } from 'react-router-dom';
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
  const { orders, updateOrderStatus } = useOrders();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders');
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(savedName || '');
  const [phoneInput, setPhoneInput] = useState(savedPhone || '');
  const [addressInput, setAddressInput] = useState(savedAddress || '');
  const [updateMsg, setUpdateMsg] = useState('');
  const [cancellableOrders, setCancellableOrders] = useState({});
  const [orderFilter, setOrderFilter] = useState('All');

  const checkCancellable = useCallback((order) => {
    if (order.status !== 'Processing' || order.status === 'Cancelled') return false;
    if (!order.date || !order.date.includes('T')) return false;
    const start = new Date(order.date).getTime();
    const now = new Date().getTime();
    return (now - start) < (30 * 60 * 1000);
  }, []);

  useEffect(() => {
    if (!user) return;
    const initial = {};
    const myOrders = orders.filter(o => o.email === user.email);
    myOrders.forEach(o => {
      if (checkCancellable(o)) initial[o.id] = true;
    });
    setCancellableOrders(initial);
  }, [orders, user, checkCancellable]);

  if (!user) {
    navigate('/');
    return null;
  }

  const myOrders = orders.filter(order => order.email === user.email);

  const filteredOrders = myOrders.filter(order => {
    if (orderFilter === 'All') return true;
    if (orderFilter === 'Shipped') return order.status === 'Shipped' || order.status === 'Out for Delivery';
    if (orderFilter === 'Delivered') return order.status === 'Delivered' || order.status === 'Completed';
    return order.status.toLowerCase() === orderFilter.toLowerCase();
  });

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

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    if (!dateStr.includes('T')) return dateStr;
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="account-page-wrapper">
      <Navbar />
      <div className="account-header-elegant">
        <h2>{activeTab === 'orders' ? 'My Orders' : 'My Account'}</h2>
        <div className="account-breadcrumbs">
          <Link to="/">Home</Link> <span className="divider">/</span> <Link to="/account" onClick={() => setActiveTab('profile')}>My Account</Link> <span className="divider">/</span> <span>{activeTab === 'orders' ? 'My Orders' : 'Personal Information'}</span>
        </div>
      </div>

      <div className="account-container-brand">
        <div className="account-content-brand">
          <aside className="account-sidebar-brand">
            <div className="sidebar-profile-card">
              <div className="avatar-circle">
                <img src={`https://ui-avatars.com/api/?name=${savedName || user.email}&background=random`} alt="Avatar" />
              </div>
              <div className="profile-names">
                <span className="greeting-text">Hello,</span>
                <span className="user-name-text">{savedName || user.email.split('@')[0]}</span>
              </div>
            </div>
            
            <nav className="brand-nav-list">
              <button 
                className={activeTab === 'profile' ? 'active' : ''} 
                onClick={() => setActiveTab('profile')}
              >
                Personal Information
              </button>
              <button 
                className={activeTab === 'orders' ? 'active' : ''} 
                onClick={() => setActiveTab('orders')}
              >
                My Orders
              </button>
              <button className="logout-btn-nav" onClick={() => { signOut(); navigate('/'); }}>
                Logout
              </button>
            </nav>


          </aside>

          <main className="account-main">
            {activeTab === 'orders' ? (
              <div className="tab-pane-brand">
                <div className="pane-header-brand">
                  <h2>My Orders</h2>
                </div>
                
                <div className="order-filter-tabs">
                  <span 
                    className={orderFilter === 'All' ? 'active' : ''} 
                    onClick={() => setOrderFilter('All')}
                  >All</span>
                  <span className="divider">|</span>
                  <span 
                    className={orderFilter === 'Shipped' ? 'active' : ''} 
                    onClick={() => setOrderFilter('Shipped')}
                  >Shipped</span>
                  <span className="divider">|</span>
                  <span 
                    className={orderFilter === 'Delivered' ? 'active' : ''} 
                    onClick={() => setOrderFilter('Delivered')}
                  >Delivered</span>
                  <span className="divider">|</span>
                  <span 
                    className={orderFilter === 'Cancelled' ? 'active' : ''} 
                    onClick={() => setOrderFilter('Cancelled')}
                  >Cancelled</span>
                </div>

                {filteredOrders.length === 0 ? (
                  <div className="empty-state">
                    <ShoppingBag size={48} />
                    <p>No orders found in "{orderFilter}".</p>
                    <button className="btn-primary" onClick={() => navigate('/')}>Explore Cakes</button>
                  </div>
                ) : (
                  <div className="brand-order-list">
                    {filteredOrders.map(order => {
                      const firstItem = order.items && order.items[0];
                      const totalQty = order.items ? order.items.reduce((sum, i) => sum + i.quantity, 0) : 0;
                      
                      return (
                        <div key={order.id} className="brand-order-card">
                          <div className="b-card-top">
                            <span className={`b-status-badge ${order.status.toLowerCase().replace(/\s/g, '-')}`}>
                              {order.status}
                            </span>
                            {['Delivered', 'Completed'].includes(order.status) && (
                              <button className="b-rate-link" onClick={() => navigate(`/account/order/${order.id}`)}>
                                <Star fill="currentColor" size={12} /> Rate & Review Product
                              </button>
                            )}
                          </div>
                          
                          <div className="b-card-meta">
                            <span className="b-meta-date">{formatDate(order.date)}</span>
                            <span className="meta-divider">|</span>
                            <span className="b-meta-order">Order No: {order.id}</span>
                            <span className="b-meta-total">Total: <strong>₹{Number(order.total).toFixed(2)}</strong></span>
                          </div>
                          
                          <div className="b-line-divider"></div>
                          
                          <div className="b-card-product-row">
                            <div className="b-product-info">
                              {firstItem?.image && (
                                <div className="b-product-img">
                                  <img src={firstItem.image} alt="product" />
                                </div>
                              )}
                              <div className="b-product-details">
                                <h4>{firstItem?.name || 'Assorted Cakes'}</h4>
                                <span className="b-product-qty">Qty: {totalQty}</span>
                              </div>
                            </div>
                            
                            <button className="b-order-details-btn" onClick={() => navigate(`/account/order/${order.id}`)}>
                              Order Details
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="tab-pane-brand">
                <div className="pane-header-brand">
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
    </div>
  );
}
