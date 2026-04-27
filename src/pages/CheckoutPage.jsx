import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, ShoppingBag } from 'lucide-react';
import Navbar from '../components/Navbar';
import './CheckoutPage.css';

export default function CheckoutPage() {
  const { cartItems, subtotal, discountAmount, appliedPromo, totalPrice, clearCart } = useCart();
  const { addOrder } = useOrders();
  const { user, savedAddress, savedName, savedPhone, updateProfile } = useAuth();
  const [isOrdered, setIsOrdered] = useState(false);
  const [customerName, setCustomerName] = useState(savedName || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerAddress, setCustomerAddress] = useState(savedAddress || '');
  const [customerPhone, setCustomerPhone] = useState(savedPhone || '');
  const [saveAddress, setSaveAddress] = useState(false);
  const [orderSnapshot, setOrderSnapshot] = useState(null);
  
  const todayDateStr = new Date().toISOString().split('T')[0];
  const tmrw = new Date();
  tmrw.setDate(tmrw.getDate() + 1);
  const tomorrowDateStr = tmrw.toISOString().split('T')[0];

  const [deliveryType, setDeliveryType] = useState('timeslot');
  const [deliveryDate, setDeliveryDate] = useState(todayDateStr);
  const [deliverySlot, setDeliverySlot] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const navigate = useNavigate();

  const getDeliveryFee = () => {
    if (deliveryType === 'standard') return 0;
    if (deliveryDate !== todayDateStr) return 10;
    if (!deliverySlot) return 10;
    
    const match = deliverySlot.match(/^(\d+):00\s*(AM|PM)/i);
    if (!match) return 10;
    
    let slotHour = parseInt(match[1]);
    const ampm = match[2].toUpperCase();
    if (ampm === 'PM' && slotHour !== 12) slotHour += 12;
    if (ampm === 'AM' && slotHour === 12) slotHour = 0;
    
    const currentHour = new Date().getHours();
    
    if (slotHour - currentHour >= 1 && slotHour - currentHour <= 2) {
      return 99;
    }
    return 10;
  };

  useEffect(() => {
    if (deliveryType === 'standard') {
      const tmrw = new Date();
      tmrw.setDate(tmrw.getDate() + 1);
      setDeliveryDate(tmrw.toISOString().split('T')[0]);
      setAvailableSlots([]);
      setDeliverySlot('All Day');
      return;
    }

    const isToday = deliveryDate === todayDateStr;
    const currentHour = new Date().getHours();
    
    // Operating hours 10 AM to 8 PM (20:00)
    const minStartHour = isToday ? currentHour + 1 : 10;
    const startHour = Math.max(10, minStartHour);
    const endHour = 20; 
    
    const slots = [];
    if (startHour <= endHour) {
      for (let h = startHour; h <= endHour; h++) {
        const ampm = h >= 12 ? 'PM' : 'AM';
        const hr12 = h > 12 ? h - 12 : (h === 0 ? 12 : h);
        const nextH = h + 1;
        const nextAmpm = nextH >= 12 ? 'PM' : 'AM';
        const nextHr12 = nextH > 12 ? nextH - 12 : nextH;
        slots.push(`${hr12}:00 ${ampm} - ${nextHr12}:00 ${nextAmpm}`);
      }
    }
    
    setAvailableSlots(slots);
    
    if (slots.length > 0) {
      setDeliverySlot(slots[0]);
    } else if (isToday) {
      // Auto move to tomorrow if no slots left today
      const tmrw = new Date();
      tmrw.setDate(tmrw.getDate() + 1);
      setDeliveryDate(tmrw.toISOString().split('T')[0]);
    } else {
      setDeliverySlot('');
    }
  }, [deliveryDate, todayDateStr, deliveryType]);

  // Update fields if saved profile changes (e.g. login sync)
  useEffect(() => {
    if (savedName && !customerName) setCustomerName(savedName);
    if (savedPhone && !customerPhone) setCustomerPhone(savedPhone);
    if (savedAddress && !customerAddress) setCustomerAddress(savedAddress);
  }, [savedName, savedPhone, savedAddress]);

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    
    const promoTag = appliedPromo ? ` [Promo Used: ${appliedPromo}]` : '';
    const scheduledAddress = `[Delivery: ${deliveryDate} | Slot: ${deliverySlot || 'N/A'}]${promoTag}\n${customerAddress}`;

    // Add to orders context
    addOrder({
      customer: customerName,
      email: customerEmail,
      address: scheduledAddress,
      total: totalPrice + getDeliveryFee(),
      status: 'Processing',
      items: [...cartItems]
    });

    // Save profile updates if requested
    if (saveAddress && user) {
      updateProfile({ 
        full_name: customerName,
        phone: customerPhone,
        address: customerAddress 
      });
    }

    // Save snapshot to display on the receipt before the cart clears
    setOrderSnapshot({
      items: [...cartItems],
      subtotal,
      discountAmount,
      deliveryFee: getDeliveryFee(),
      totalPrice: totalPrice + getDeliveryFee(),
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      orderNumber: Math.floor(100000000 + Math.random() * 900000000).toString()
    });

    setIsOrdered(true);
    clearCart();
  };

  if (isOrdered && orderSnapshot) {
    return (
      <div className="checkout-page-wrapper success">
        <Navbar />
        <div className="success-content-grid">
          
          <div className="success-left-col">
            <h1 className="success-heading">Thank you for your purchase!</h1>
            <p className="success-text">Your order will be processed within 24 hours during working days. We will notify you by email once your order has been shipped.</p>
            
            <h3 className="billing-heading">Delivery Address</h3>
            <div className="billing-details-grid">
              <span className="b-label">Name</span>
              <span className="b-value">{orderSnapshot.customerName}</span>
              
              <span className="b-label">Address</span>
              <span className="b-value">{orderSnapshot.customerAddress.substring(0,60)}...</span>
              
              <span className="b-label">Phone</span>
              <span className="b-value">{orderSnapshot.customerPhone}</span>
              
              <span className="b-label">Email</span>
              <span className="b-value">{orderSnapshot.customerEmail}</span>
            </div>

            <button className="btn-track-order" onClick={() => navigate('/account')}>Track Your Order</button>
          </div>

          <div className="success-right-col">
            <div className="receipt-box">
              <div className="receipt-content">
                <h3 className="receipt-title">Order Summary</h3>
                
                <div className="receipt-meta-grid">
                  <div className="meta-col">
                    <span className="m-label">Date</span>
                    <span className="m-value">{orderSnapshot.date}</span>
                  </div>
                  <div className="meta-col">
                    <span className="m-label">Order Number</span>
                    <span className="m-value">{orderSnapshot.orderNumber}</span>
                  </div>
                  <div className="meta-col">
                    <span className="m-label">Payment Method</span>
                    <span className="m-value">Cash on Delivery</span>
                  </div>
                </div>

                <div className="receipt-items">
                  {orderSnapshot.items.map((item) => (
                    <div key={item.id} className="receipt-item">
                      <div className="r-item-img">
                         <img src={item.image} alt={item.name} />
                      </div>
                      <div className="r-item-details">
                        <h4>{item.name}</h4>
                        <span className="r-item-variant">Qty: {item.quantity}</span>
                      </div>
                      <div className="r-item-price">₹{(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                  ))}
                </div>

                <div className="receipt-summary">
                  <div className="r-sum-row">
                    <span>Sub Total</span>
                    <span>₹{orderSnapshot.subtotal.toFixed(2)}</span>
                  </div>
                  {orderSnapshot.discountAmount > 0 && (
                    <div className="r-sum-row">
                      <span>Discount</span>
                      <span>-₹{orderSnapshot.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="r-sum-row">
                    <span>Delivery</span>
                    <span>{orderSnapshot.deliveryFee === 0 ? 'FREE' : `₹${orderSnapshot.deliveryFee.toFixed(2)}`}</span>
                  </div>
                </div>

                <div className="receipt-total">
                  <span>Order Total</span>
                  <span>₹{orderSnapshot.totalPrice.toFixed(2)}</span>
                </div>
              </div>
              <div className="receipt-zigzag"></div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page-wrapper">
      <Navbar />
      


      <div className="checkout-content">
        <div className="checkout-left-col">
          <h2 className="section-title">Delivery Information</h2>
          <form id="checkout-form" onSubmit={handlePlaceOrder} className="checkout-form">
            <div className="form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                placeholder="Your Name" 
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required 
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" placeholder="email@example.com" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input 
                type="tel" 
                placeholder="+91 00000 00000" 
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                required 
              />
            </div>
            <div className="form-group">
              <label>Delivery Type</label>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem', border: '1px solid #ddd', borderRadius: 'var(--radius-md)', background: deliveryType === 'standard' ? '#fdf2f5' : 'white', borderColor: deliveryType === 'standard' ? 'var(--color-primary)' : '#ddd', cursor: 'pointer' }}>
                  <input type="radio" name="deliveryType" checked={deliveryType === 'standard'} onChange={() => setDeliveryType('standard')} style={{ cursor: 'pointer' }} />
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.95rem' }}>Standard Delivery</strong>
                    <span style={{ fontSize: '0.8rem', color: '#666' }}>Next Day • Free</span>
                  </div>
                </label>
                <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem', border: '1px solid #ddd', borderRadius: 'var(--radius-md)', background: deliveryType === 'timeslot' ? '#fdf2f5' : 'white', borderColor: deliveryType === 'timeslot' ? 'var(--color-primary)' : '#ddd', cursor: 'pointer' }}>
                  <input type="radio" name="deliveryType" checked={deliveryType === 'timeslot'} onChange={() => setDeliveryType('timeslot')} style={{ cursor: 'pointer' }} />
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.95rem' }}>Time Slot Delivery</strong>
                    <span style={{ fontSize: '0.8rem', color: '#666' }}>Same Day / Flexible • ₹10 - ₹99</span>
                  </div>
                </label>
              </div>
            </div>

            {deliveryType === 'standard' ? (
              <div className="form-group">
                <label>Delivery Date</label>
                <input 
                  type="date" 
                  min={tomorrowDateStr}
                  value={deliveryDate} 
                  onChange={(e) => setDeliveryDate(e.target.value)} 
                  required 
                  style={{ width: '100%', border: '1px solid #ddd', padding: '1.25rem 1.5rem', borderRadius: 'var(--radius-md)' }}
                />
              </div>
            ) : (
              <div className="form-group" style={{ flexDirection: 'row', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label>Delivery Date</label>
                  <input 
                    type="date" 
                    min={todayDateStr}
                    value={deliveryDate} 
                    onChange={(e) => setDeliveryDate(e.target.value)} 
                    required 
                    style={{ width: '100%', border: '1px solid #ddd', padding: '1.25rem 1.5rem', borderRadius: 'var(--radius-md)' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label>Time Slot</label>
                  <select 
                    value={deliverySlot} 
                    onChange={(e) => setDeliverySlot(e.target.value)} 
                    required 
                    disabled={availableSlots.length === 0}
                    style={{ width: '100%', border: '1px solid #ddd', padding: '1.25rem 1.5rem', borderRadius: 'var(--radius-md)', background: 'var(--color-surface-low)', fontFamily: 'inherit', color: 'inherit' }}
                  >
                    {availableSlots.length === 0 ? (
                      <option value="">No slots available</option>
                    ) : (
                      availableSlots.map(slot => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))
                    )}
                  </select>
                </div>
              </div>
            )}
            <div className="form-group">
              <label>Delivery Address</label>
              <textarea placeholder="Enter full address" rows="3" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} required></textarea>
            </div>
            {user && (
              <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.75rem', marginTop: '-0.5rem' }}>
                <input 
                  type="checkbox" 
                  id="save-address" 
                  checked={saveAddress} 
                  onChange={(e) => setSaveAddress(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="save-address" style={{ cursor: 'pointer', fontSize: '0.9rem', color: '#666' }}>Save this address for future orders</label>
              </div>
            )}
          </form>
        </div>

        <div className="checkout-right-col">
          <h2 className="section-title">Order Summary</h2>
          <div className="summary-box">
            <div className="order-items">
              {cartItems.map((item) => (
                <div key={item.id} className="order-item">
                  <span className="item-name">{item.name} x {item.quantity}</span>
                  <span className="item-price">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="summary-details">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="summary-row" style={{ color: 'var(--color-primary)' }}>
                  <span>Discount</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="summary-row">
                <span>Delivery Fee</span>
                <span>{getDeliveryFee() === 0 ? 'FREE' : `₹${getDeliveryFee().toFixed(2)}`}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>₹{(totalPrice + getDeliveryFee()).toFixed(2)}</span>
              </div>
            </div>
            <button type="submit" form="checkout-form" className="btn btn-primary place-order-btn">PLACE ORDER</button>
          </div>
        </div>
      </div>
    </div>
  );
}
