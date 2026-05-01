import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';
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
  Star,
  Palette
} from 'lucide-react';
import Navbar from '../components/Navbar';
import './OrderDetailPage.css';

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { orders, rateOrderItem, updateOrderStatus } = useOrders();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { products } = useProducts();
  
  const [reviewingItem, setReviewingItem] = useState(null);
  const [reviewComment, setReviewComment] = useState('');

  const currentOrder = orders.find(o => o.id === orderId);

  const getExpandedItems = (orderItems) => {
    if (!orderItems) return [];
    let expanded = [];

    orderItems.forEach((item) => {
      let totalComboPrice = 0;
      let comboItemsToPush = [];

      if (item.variant_details && item.variant_details.combos && Array.isArray(item.variant_details.combos)) {
        item.variant_details.combos.forEach(comboName => {
          const comboProduct = products?.find(p => p.name.toLowerCase() === comboName.toLowerCase());
          const comboPrice = comboProduct?.price || 0;
          const comboImage = comboProduct?.image || '';

          totalComboPrice += comboPrice;

          comboItemsToPush.push({
            name: comboName,
            price: comboPrice,
            image: comboImage,
            quantity: item.quantity,
            isCombo: true,
            type: 'combo'
          });
        });
      }

      const basePrice = item.type !== 'custom' ? Math.max(0, item.price - totalComboPrice) : item.price;

      expanded.push({
        ...item,
        price: basePrice,
        isCombo: false
      });

      expanded = [...expanded, ...comboItemsToPush];
    });

    return expanded;
  };
  const isCakeProduct = (item) => {
    if (item.type === 'custom') return true;
    if (item.type === 'combo' || item.isCombo) return false;
    
    const cleanName = item.name.split(' (')[0].trim().toLowerCase();
    const productObj = products?.find(p => 
      p.id === item.base_product_id || 
      p.id === item.id || 
      p.name.toLowerCase() === cleanName
    );

    if (productObj) {
      const nonCakeCategories = ['Combos & Gifts', 'Add-on'];
      return !nonCakeCategories.includes(productObj.category);
    }

    const nonCakeKeywords = ['bouquet', 'candle', 'balloon', 'chocolate box', 'teddy'];
    return !nonCakeKeywords.some(keyword => cleanName.includes(keyword));
  };
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

  const subtotal = currentOrder.items?.reduce((sum, item) => sum + (Number(item.price) * (item.quantity || 1)), 0) || Number(currentOrder.total);
  const shippingFee = Math.max(0, Number(currentOrder.total) - subtotal);

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
    { label: 'Ordered', icon: <Clock size={16} /> },
    { label: 'Baking', icon: <Palette size={16} /> },
    { label: 'Packing', icon: <Package size={16} /> },
    { label: 'Out for Delivery', icon: <Truck size={16} /> },
    { label: 'Delivered', icon: <CheckCircle size={16} /> }
  ];

  const getStatusIndex = (status) => {
    switch (status) {
      case 'Ordered': return 1;
      case 'Baking': return 2;
      case 'Packing': return 3;
      case 'Out for Delivery': return 4;
      case 'Delivered': return 5;
      case 'Completed': return 5;
      case 'Accepted': return 1;
      default: return 1;
    }
  };

  const activeIndex = getStatusIndex(currentOrder.status || 'Ordered');

  const submitReview = async () => {
    if (!reviewingItem) return;
    await rateOrderItem(reviewingItem.orderId, reviewingItem.itemIndex, reviewingItem.rating, reviewComment);
    setReviewingItem(null);
    setReviewComment('');
    alert("Thank you for your review!");
  };

  return (
    <div className="order-details-page">
      <Navbar />
      
      {/* Review Modal / Overlay */}
      {reviewingItem && (
        <div className="review-overlay" style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'}}>
          <div className="review-modal" style={{background: 'white', borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: '500px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)'}}>
            <h3 style={{margin: '0 0 1rem 0', fontFamily: 'Noto Serif'}}>How was the cake?</h3>
            <p style={{color: '#666', fontSize: '0.9rem', marginBottom: '1.5rem'}}>You gave it {reviewingItem.rating} stars. Tell us more about your experience!</p>
            
            <textarea 
              style={{width: '100%', borderRadius: '12px', border: '1px solid #eab8c8', padding: '1rem', minHeight: '120px', fontFamily: 'inherit', marginBottom: '1.5rem'}}
              placeholder="Was it tasty? How was the delivery? (Optional)"
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
            />
            
            <div style={{display: 'flex', gap: '1rem'}}>
              <button 
                onClick={submitReview}
                style={{flex: 1, padding: '0.85rem', borderRadius: '50px', border: 'none', background: '#cd3d7a', color: 'white', fontWeight: 700, cursor: 'pointer'}}
              >
                Submit Review
              </button>
              <button 
                onClick={() => setReviewingItem(null)}
                style={{flex: 1, padding: '0.85rem', borderRadius: '50px', border: '1px solid #eab8c8', background: 'white', color: '#cd3d7a', fontWeight: 700, cursor: 'pointer'}}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="amz-container">
        {/* ... (rest of existing code) ... */}
        {/* Update the star click handler in the items list */}
        {/* (Searching for the star loop in TargetContent below) */}
        {/* Dedicated Hidden Print Invoice */}
        <div className="print-only-invoice">
          <div className="print-header">
            <h1 className="print-logo-text">CrumbleCakes Bakery</h1>
            <p className="print-subtext">Official Order Receipt</p>
          </div>
          
          <div className="print-meta-row">
            <div>
              <strong>Order ID:</strong> {currentOrder.id}<br/>
              <strong>Date:</strong> {formatDate(currentOrder.date)}<br/>
              <strong>Payment:</strong> Cash on Delivery
            </div>
            <div style={{textAlign: 'right'}}>
              <strong>Billed To:</strong><br/>
              {currentOrder.customer || user?.email.split('@')[0]}<br/>
              {currentOrder.address}
            </div>
          </div>

          <table className="print-table">
            <thead>
              <tr>
                <th>Item Details</th>
                <th style={{textAlign: 'center'}}>Qty</th>
                <th style={{textAlign: 'right'}}>Price</th>
                <th style={{textAlign: 'right'}}>Total</th>
              </tr>
            </thead>
            <tbody>
              {currentOrder.items && getExpandedItems(currentOrder.items).map((item, idx) => (
                <tr key={idx}>
                  <td>
                    <strong>{!isCakeProduct(item) ? item.name.split(' (')[0] : item.name} {item.isCombo && <span style={{ color: '#e11d48', fontSize: '0.8rem', marginLeft: '4px' }}>(Combo)</span>}</strong><br/>
                    <small>Sold by CrumbleCakes Bakery</small>
                  </td>
                  <td style={{textAlign: 'center'}}>{item.quantity || 1}</td>
                  <td style={{textAlign: 'right'}}>₹{Number(item.price).toFixed(2)}</td>
                  <td style={{textAlign: 'right'}}>₹{(Number(item.price) * (item.quantity || 1)).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="print-totals">
            <div className="pt-row"><span>Subtotal:</span><span>₹{subtotal.toFixed(2)}</span></div>
            <div className="pt-row"><span>Shipping:</span><span>{shippingFee === 0 ? 'FREE' : `₹${shippingFee.toFixed(2)}`}</span></div>
            <div className="pt-row pt-grand"><span>Grand Total:</span><span>₹{Number(currentOrder.total).toFixed(2)}</span></div>
          </div>
          
          <div className="print-footer">
            Thank you for shopping with CrumbleCakes Bakery!<br/>
            For support, contact chef@crumblecakes.in
          </div>
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

        {currentOrder.items?.some(i => i.type === 'custom') && Number(currentOrder.total) > 0 && currentOrder.status === 'Ordered' && (
          <div className="quote-action-bar" style={{background: '#fdf2f5', border: '1px solid #eab8c8', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem'}}>
            <h3 style={{color: '#bc024d', margin: '0 0 0.5rem 0'}}>Your Custom Cake Quote is Ready: ₹{Number(currentOrder.total).toFixed(2)}</h3>
            <p style={{margin: 0, color: '#4b5563', fontSize: '0.95rem'}}>Please accept the quote to proceed with your order, or cancel if you changed your mind.</p>
            <div style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
              <button style={{padding: '0.75rem 1.5rem', borderRadius: '50px', border: 'none', background: '#cd3d7a', color: 'white', fontWeight: 600, cursor: 'pointer'}} onClick={() => updateOrderStatus(currentOrder.id, 'Accepted')}>Accept Quote & Proceed</button>
              <button style={{padding: '0.75rem 1.5rem', borderRadius: '50px', border: '1px solid #eab8c8', background: 'white', color: '#cd3d7a', fontWeight: 600, cursor: 'pointer'}} onClick={() => updateOrderStatus(currentOrder.id, 'Cancelled')}>Decline & Cancel</button>
            </div>
          </div>
        )}

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
                <span>{shippingFee === 0 ? 'FREE' : `₹${shippingFee.toFixed(2)}`}</span>
              </div>
              <div className="sum-row total">
                <span>Grand Total:</span>
                <span>
                  {Number(currentOrder.total) === 0 ? 'Awaiting Quote' : `₹${Number(currentOrder.total).toFixed(2)}`}
                </span>
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
          {currentOrder.items && getExpandedItems(currentOrder.items).map((item, idx) => (
            <div key={idx} className="amz-order-item-box">
              <div className="item-header">
                <h3>{currentOrder.status} {formatDate(currentOrder.date)}</h3>
              </div>
              
              <div className="item-content-row">
                <div className="item-visual">
                  <img src={item.image || 'https://via.placeholder.com/150'} alt={item.name} />
                </div>
                
                <div className="item-info">
                  <h4 className="item-title">
                    {!isCakeProduct(item) ? item.name.split(' (')[0] : item.name} {item.isCombo && <span style={{ color: '#e11d48', background: '#ffe4e6', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', verticalAlign: 'middle', marginLeft: '6px' }}>Combo</span>}
                  </h4>
                  <p className="item-meta">Sold by: CrumbleCakes Bakery</p>
                  <p className="item-price">
                    {item.type === 'custom' ? (Number(currentOrder.total) === 0 ? 'Awaiting Quote' : `₹${Number(currentOrder.total).toFixed(2)}`) : `₹${Number(item.price).toFixed(2)}`}
                  </p>
                </div>

                <div className="item-sidebar">
                  <button className="amz-btn-secondary w-100" onClick={handleDownloadInvoice}>Download Invoice</button>
                  <button className="amz-btn-primary w-100" onClick={() => handleBuyAgain(item)}>Buy it again</button>
                  <button className="amz-btn-secondary w-100" onClick={() => navigate('/#cakes')}>View your item</button>
                  
                  {['Completed', 'Delivered'].includes(currentOrder.status) && (
                    <div className="rating-invite">
                      <h5>{item.user_rating ? 'Your Review' : 'Write a product review'}</h5>
                      <div className="stars-row">
                        {[1,2,3,4,5].map(star => (
                          <Star 
                            key={star} 
                            size={20} 
                            onClick={() => !item.user_rating && setReviewingItem({ orderId: currentOrder.id, itemIndex: idx, rating: star })}
                            fill={star <= (item.user_rating || 0) ? "#ca8a04" : "transparent"}
                            color={star <= (item.user_rating || 0) ? "#ca8a04" : "#eab8c8"}
                            style={{cursor: item.user_rating ? 'default' : 'pointer'}}
                          />
                        ))}
                      </div>
                      {item.user_comment && (
                        <p style={{fontSize: '0.8rem', color: '#666', marginTop: '0.5rem', fontStyle: 'italic'}}>
                          "{item.user_comment}"
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
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
          color={star <= rating ? "#ca8a04" : "#eab8c8"}
          fill={star <= rating ? "#ca8a04" : "transparent"}
          onClick={() => onRate(star)}
          style={{ cursor: 'pointer' }}
        />
      ))}
    </div>
  );
}
