import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';
import { Minus, Plus, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import './CartPage.css';

export default function CartPage() {
  const [promoInput, setPromoInput] = useState('');
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    updateItemMessage,
    clearCart,
    subtotal, 
    discountAmount, 
    totalPrice,
    appliedPromo,
    addToCart,
    applyPromoCode
  } = useCart();

  const { products } = useProducts();
  const dynamicAddons = products.filter(p => p.category === 'Combos & Gifts');
  
  const addons = dynamicAddons.length > 0 ? dynamicAddons.map(p => ({
    id: p.id,
    name: p.name,
    price: p.price,
    image: p.image || (Array.isArray(p.images) ? p.images[0] : (typeof p.images === 'string' && p.images.startsWith('[') ? JSON.parse(p.images)[0] : p.image)) || '/hero-cake.png'
  })) : [
    { id: 'addon1', name: 'Zig Zag Tall Candle Set of 6', price: 89, image: 'https://images.unsplash.com/photo-1558961363-a261a86a6096?w=200&h=200&fit=crop' },
    { id: 'addon2', name: 'Glam Bday Cake Topper', price: 99, image: 'https://images.unsplash.com/photo-1530103862676-de8892796ac6?w=200&h=200&fit=crop' },
    { id: 'addon3', name: '5 Dairy Milk Chocolates', price: 149, image: 'https://images.unsplash.com/photo-1621939514649-280e2af259d0?w=200&h=200&fit=crop' },
    { id: 'addon4', name: '5 Nestle KitKat', price: 149, image: 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?w=200&h=200&fit=crop' },
  ];
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
      


      <main className="cart-page-main">
        {cartItems.length === 0 ? (
          <div className="empty-cart-state">
            <h1>Your cart looks empty.</h1>
            <button className="btn-continue-shopping" onClick={() => navigate('/#cakes')}>Browse Cakes</button>
          </div>
        ) : (
          <div className="cart-content-grid">
            <div className="cart-left-col">
              <div className="cart-items-container">
                {cartItems.map((item) => (
                  <div key={item.id} className="cart-item-box">
                    <div className="cart-item-delivery-header">
                      <strong>Express Delivery</strong> <span className="delivery-time">⚡ Same Day</span>
                    </div>
                    <div className="cart-item-row">
                      <div className="cart-item-img-container">
                         <img src={item.image} alt={item.name} />
                      </div>
                      <div className="cart-item-details">
                        <h4>{item.name}</h4>
                        <div className="cart-item-price-row">
                          <span className="cart-item-price">₹{item.price.toFixed(2)}</span>
                          <span className="cart-item-price-old">₹{(item.price + 115).toFixed(2)}</span>
                        </div>
                        <span className="cart-item-variant">Weight: {item.variant_details?.weight || '0.5 Kg'}</span>
                        {item.category !== 'Add-on' && (
                          <button 
                            className="cart-item-message-btn"
                            onClick={() => {
                              const newMsg = prompt("Enter your message for the cake:", item.variant_details?.message || '');
                              if (newMsg !== null) updateItemMessage(item.id, newMsg);
                            }}
                          >
                            {item.variant_details?.message ? `✏️ ${item.variant_details.message}` : '+ Write your message ✏️'}
                          </button>
                        )}
                      </div>
                      <div className="cart-item-controls">
                        <div className="count-pill-dark">
                          <button onClick={() => {
                            if (item.quantity === 1) removeFromCart(item.id);
                            else updateQuantity(item.id, -1);
                          }}>-</button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="cart-addons-section">
                <h3 className="addons-title">Your last minute add-ons</h3>
                <div className="addons-grid">
                  {addons.map(addon => (
                    <div key={addon.id} className="addon-card">
                      <div className="addon-img-wrapper">
                        <img src={addon.image} alt={addon.name} />
                      </div>
                      <div className="addon-info">
                        <p className="addon-name">{addon.name}</p>
                        <p className="addon-price">₹{addon.price}</p>
                        <button className="btn-add-addon" onClick={() => addToCart({...addon, quantity: 1, category: 'Add-on'})}>
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="cart-right-col">
              <div className="summary-box">
                <div className="savings-pill">
                  You have saved ₹ 115 on this order
                </div>
                
                <div className="summary-header">
                  <h3 className="summary-title">Bill Summary</h3>
                  <span className="summary-items-count">{cartItems.reduce((acc, item) => acc + item.quantity, 0)} Item</span>
                </div>

                <div className="summary-breakdown">
                  <div className="summary-row">
                    <span className="order-total-label"><span className="icon-list">🧾</span> Order Total</span>
                    <span className="order-total-prices">
                      <span className="price-old">₹{(subtotal + 115).toFixed(0)}</span> 
                      <span className="price-new">₹{subtotal.toFixed(0)}</span>
                    </span>
                  </div>
                </div>

                <div className="summary-row total">
                  <span>Grand Total</span>
                  <span>₹{totalPrice.toFixed(0)}</span>
                </div>

                <button className="btn-continue-checkout" onClick={() => navigate('/checkout')}>
                  PLACE ORDER
                </button>
              </div>
              <div className="coupon-info-text">
                Have a Coupon Code? You can apply the discount<br/>coupon in the Checkout Process.
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
