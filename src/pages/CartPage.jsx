import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Minus, Plus, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import './CartPage.css';

export default function CartPage() {
  const [promoInput, setPromoInput] = useState('');
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    clearCart,
    subtotal, 
    discountAmount, 
    totalPrice,
    applyPromoCode,
    appliedPromo
  } = useCart();
  const navigate = useNavigate();

  const handleApplyPromo = () => {
    const result = applyPromoCode(promoInput);
    if (!result.success) {
      alert(result.message);
    }
  };

  return (
    <div className="cart-page-wrapper">
      <Navbar />
      
      <div className="stepper-container">
        <div className="stepper">
          <span className="step active">
            <span className="step-circle active"></span>
            Cart
          </span>
          <span className="step-divider">{'>'}</span>
          <span className="step">
            <span className="step-circle"></span>
            Checkout
          </span>
          <span className="step-divider">{'>'}</span>
          <span className="step">
            <span className="step-circle"></span>
            Payment
          </span>
        </div>
      </div>

      <main className="cart-page-main">
        {cartItems.length === 0 ? (
          <div className="empty-cart-state">
            <h1>Your cart looks empty.</h1>
            <button className="btn-continue-shopping" onClick={() => navigate('/#cakes')}>Browse Cakes</button>
          </div>
        ) : (
          <div className="cart-content-grid">
            <div className="cart-left-col">
              <div className="cart-header-box">
                <div className="cart-title">
                  <h2>Cart</h2>
                  <span className="item-count">({cartItems.reduce((acc, item) => acc + item.quantity, 0)} products)</span>
                </div>
                <button className="btn-clear-cart" onClick={clearCart}>
                  <X size={14} /> Clear cart
                </button>
              </div>

              <div className="cart-items-container">
                <div className="cart-items-header">
                  <span>Product</span>
                  <span>Count</span>
                  <span>Price</span>
                </div>

                {cartItems.map((item) => (
                  <div key={item.id} className="cart-item-row">
                    <div className="cart-item-primary">
                      <div className="cart-item-img-container">
                         <img src={item.image} alt={item.name} />
                      </div>
                      <div className="cart-item-details">
                        <h4>{item.name}</h4>
                        <span className="cart-item-variant">Classic Menu</span>
                      </div>
                    </div>
                    
                    <div className="cart-item-count">
                      <div className="count-pill">
                        <button onClick={() => updateQuantity(item.id, -1)}><Minus size={14} /></button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)}><Plus size={14} /></button>
                      </div>
                    </div>
                    
                    <div className="cart-item-price-col">
                      <span className="cart-item-price">₹{(item.price * item.quantity).toFixed(2)}</span>
                      <button className="btn-remove-item" onClick={() => removeFromCart(item.id)}>
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="cart-banner-ad">
                <div className="ad-content">
                  <h3>Check the newest<br/>Crumble specials</h3>
                  <p>Official Bakery retailer</p>
                  <button onClick={() => navigate('/#cakes')}>Shop now</button>
                </div>
              </div>
            </div>

            <div className="cart-right-col">
              <div className="summary-box">
                <h3 className="promo-title">Promo code</h3>
                <div className="promo-input-group">
                  <input 
                    type="text" 
                    placeholder="Type here..." 
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                  />
                  <button className="btn-apply" onClick={handleApplyPromo}>Apply</button>
                </div>
                {appliedPromo && (
                  <p style={{ color: '#146b43', fontSize: '0.8rem', fontWeight: 600, marginTop: '5px' }}>
                    ✓ Code {appliedPromo} applied
                  </p>
                )}

                <div className="summary-breakdown">
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Discount</span>
                    <span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="summary-row total">
                  <span>Total</span>
                  <span>₹{totalPrice.toFixed(2)}</span>
                </div>

                <button className="btn-continue-checkout" onClick={() => navigate('/checkout')}>
                  Continue to checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
