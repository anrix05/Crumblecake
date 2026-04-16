import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { X, Minus, Plus, ShoppingBag, Tag, Lock, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import './CartDrawer.css';

export default function CartDrawer() {
  const { cartItems, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, subtotal, discountAmount, appliedPromo, applyPromoCode, totalPrice } = useCart();
  const { user, setIsAuthModalOpen } = useAuth();
  const { orders } = useOrders();
  const navigate = useNavigate();
  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState({ text: '', type: '' });

  // Calculate usage for the current user
  const userOrders = user ? orders.filter(o => o.email === user.email) : [];
  const usageCount = userOrders.filter(o => o.address && o.address.includes('[Promo Used: CRUMBLE10]')).length;
  const isLimitReached = usageCount >= 2;

  const handleApplyPromo = (code = promoInput) => {
    const targetCode = typeof code === 'string' ? code : promoInput;
    if (!targetCode.trim()) return;
    const result = applyPromoCode(targetCode);
    setPromoMessage({ text: result.message, type: result.success ? 'success' : 'error' });
    if (result.success) setPromoInput('');
  };

  if (!isCartOpen) return null;

  return (
    <div className="cart-overlay" onClick={() => setIsCartOpen(false)}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <div className="cart-title">
            <ShoppingBag size={24} />
            <span>Your Cart</span>
          </div>
          <button className="close-btn" onClick={() => setIsCartOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <div className="cart-items">
          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <p>Your cart is empty.</p>
              <button className="btn btn-outline" onClick={() => setIsCartOpen(false)}>Start Shopping</button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="cart-item">
                <img src={item.image} alt={item.name} className="cart-item-img" />
                <div className="cart-item-info">
                  <h4>{item.name}</h4>
                  <p>₹{item.price.toFixed(2)}</p>
                  <div className="qty-controls">
                    <button onClick={() => updateQuantity(item.id, -1)}>
                      <Minus size={16} />
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)}>
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
                <button className="remove-btn" onClick={() => removeFromCart(item.id)}>
                  <X size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-footer">
            <div className="promo-section">
              {!user ? (
                <div className="promo-locked">
                  <div className="promo-lock-content">
                    <Lock size={16} />
                    <span>Login to unlock 10% OFF</span>
                  </div>
                  <button className="btn-promo-login" onClick={() => { setIsCartOpen(false); setIsAuthModalOpen(true); }}>Login Now</button>
                </div>
              ) : isLimitReached ? (
                <div className="promo-limit-reached">
                  <Tag size={16} /> <span>Usage limit reached (2/2 used)</span>
                </div>
              ) : !appliedPromo ? (
                <div className="promo-available">
                  <div className="promo-info">
                    <Tag size={16} className="promo-icon-active" />
                    <div>
                      <p className="promo-code-text">Code: <strong>CRUMBLE10</strong></p>
                      <p className="promo-sub-text">10% OFF your order</p>
                    </div>
                  </div>
                  <button className="btn-auto-apply" onClick={() => handleApplyPromo('CRUMBLE10')}>
                    Apply
                  </button>
                </div>
              ) : (
                <div className="promo-applied">
                  <Check size={16} /> <span>CRUMBLE10 Applied!</span>
                </div>
              )}
              {promoMessage.text && !appliedPromo && user && (
                <span className={`promo-msg ${promoMessage.type}`}>{promoMessage.text}</span>
              )}
              <div className="promo-terms">
                * Valid 2 times per registered customer. <br/>
                * Registration required.
              </div>
            </div>

            <div className="summary-details">
              {discountAmount > 0 && (
                <>
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="summary-row discount">
                    <span>Discount</span>
                    <span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                </>
              )}
              <div className="summary-row total">
                <span>Total</span>
                <span>₹{totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <button 
              className="btn-checkout" 
              onClick={() => {
                setIsCartOpen(false);
                navigate('/checkout');
              }}
            >
              PROCEED TO CHECKOUT
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
