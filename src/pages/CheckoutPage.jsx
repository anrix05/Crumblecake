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
  
  const todayDateStr = new Date().toISOString().split('T')[0];
  const [deliveryDate, setDeliveryDate] = useState(todayDateStr);
  const [deliverySlot, setDeliverySlot] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
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
  }, [deliveryDate, todayDateStr]);

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
      total: totalPrice + 50,
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

    setIsOrdered(true);
    clearCart();
  };

  if (isOrdered) {
    return (
      <div className="checkout-page success">
        <Navbar />
        <div className="success-content">
          <div className="success-icon">
            <CheckCircle size={80} color="#ec255c" />
          </div>
          <h1>Order Placed Successfully!</h1>
          <p>Thank you for choosing Crumble Cake. Your delicious treats are being prepared.</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>BACK TO HOME</button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <Navbar />
      <div className="checkout-content">
        <div className="checkout-form-container">
          <h2>Delivery Information</h2>
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

        <div className="order-summary-container">
          <h2>Order Summary</h2>
          <div className="order-summary">
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
                <span>₹50.00</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>₹{(totalPrice + 50).toFixed(2)}</span>
              </div>
            </div>
            <button type="submit" form="checkout-form" className="btn btn-primary place-order-btn">PLACE ORDER</button>
          </div>
        </div>
      </div>
    </div>
  );
}
