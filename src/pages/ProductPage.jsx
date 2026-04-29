import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';
import { ChevronLeft, ChevronRight, Star, Plus, Minus, ArrowLeft, Heart, Check } from 'lucide-react';
import './ProductPage.css';

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products } = useProducts();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isEggless, setIsEggless] = useState(true);
  const [selectedWeight, setSelectedWeight] = useState('1kg');
  const [messageOnCake, setMessageOnCake] = useState('');
  const [activeTab, setActiveTab] = useState('description');
  
  // Combo / Gift Options state
  const [selectedCombos, setSelectedCombos] = useState({});

  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0);
    const found = products.find(p => p.id === id);
    if (found) {
      setProduct(found);
      // If the product has a default eggless state, use it
      if (found.is_eggless !== undefined) {
        setIsEggless(found.is_eggless);
      }
      if (found.weight) {
        setSelectedWeight(found.weight);
      }
    }
  }, [id, products]);

  if (!product) {
    return (
      <div className="product-page-wrapper">
        <Navbar />
        <div className="product-not-found">
          <h2>Product Not Found</h2>
          <button onClick={() => navigate('/')} className="btn-back">Go Back to Home</button>
        </div>
      </div>
    );
  }

  // Parse images securely
  const images = (() => {
    try {
      if (typeof product.image === 'string' && product.image.startsWith('[')) {
        return JSON.parse(product.image);
      }
      return [product.image || '/hero-cake.png'];
    } catch (e) {
      return [product.image || '/hero-cake.png'];
    }
  })();

  const nextImg = () => setCurrentImgIndex((prev) => (prev + 1) % images.length);
  const prevImg = () => setCurrentImgIndex((prev) => (prev - 1 + images.length) % images.length);

  const comboOptions = (products || [])
    .filter(p => p.category === 'Combos & Gifts')
    .map(p => ({
      id: p.id,
      name: p.name,
      price: Number(p.price),
      img: (() => {
        try {
          if (typeof p.image === 'string' && p.image.startsWith('[')) {
            return JSON.parse(p.image)[0];
          }
          return p.image;
        } catch (e) {
          return p.image;
        }
      })() || 'https://img.icons8.com/color/48/000000/gift.png'
    }));

  const handleComboToggle = (comboId) => {
    setSelectedCombos(prev => ({
      ...prev,
      [comboId]: !prev[comboId]
    }));
  };

  // Calculate dynamic price based on weight and combos
  let basePrice = Number(product.price);
  const eggType = isEggless ? 'eggless' : 'egg';
  
  if (product.prices) {
    if (product.prices[eggType] && product.prices[eggType][selectedWeight] && product.prices[eggType][selectedWeight] !== '') {
      basePrice = Number(product.prices[eggType][selectedWeight]);
    } else if (product.prices[selectedWeight] && typeof product.prices[selectedWeight] === 'string' && product.prices[selectedWeight] !== '') {
      basePrice = Number(product.prices[selectedWeight]);
    } else {
      const weightMultiplier = selectedWeight === '0.5kg' ? 0.6 : selectedWeight === '2kg' ? 1.8 : 1;
      basePrice = Number(product.price) * weightMultiplier;
    }
  } else {
    const weightMultiplier = selectedWeight === '0.5kg' ? 0.6 : selectedWeight === '2kg' ? 1.8 : 1;
    basePrice = Number(product.price) * weightMultiplier;
  }
  
  const combosPrice = comboOptions.reduce((acc, combo) => {
    return selectedCombos[combo.id] ? acc + combo.price : acc;
  }, 0);

  const finalUnitPrice = basePrice + combosPrice;
  const totalDisplayPrice = finalUnitPrice * quantity;

    const handleAddToCart = () => {
    // Add custom metadata to the product before adding to cart
    const activeCombos = comboOptions.filter(c => selectedCombos[c.id]).map(c => c.name);
    const hasCakeOptions = product.category !== 'Combos & Gifts';
    
    const cartItem = {
      ...product,
      id: hasCakeOptions ? `${product.id}-${selectedWeight}-${isEggless ? 'eggless' : 'egg'}` : product.id,
      name: hasCakeOptions ? `${product.name} (${selectedWeight}, ${isEggless ? 'Eggless' : 'With Egg'})` : product.name,
      price: finalUnitPrice,
      base_product_id: product.id,
      quantity: quantity,
      variant_details: {
        weight: hasCakeOptions ? selectedWeight : undefined,
        is_eggless: hasCakeOptions ? isEggless : undefined,
        message: messageOnCake,
        combos: activeCombos
      }
    };

    addToCart(cartItem);
    
    // Optional: Show a toast or immediately open cart drawer
    // In this app, Cart is usually a page. Navigate to cart.
    navigate('/cart');
  };

  return (
    <div className="product-page-wrapper">
      <Navbar />
      
      <main className="product-details-container">


        <div className="product-grid">
          {/* LEFT: Image Gallery */}
          <div className="product-gallery">
            <div className="main-image-display">
              <img src={images[currentImgIndex]} alt={product.name} />
              {images.length > 1 && (
                <>
                  <button className="nav-btn prev" onClick={prevImg}><ChevronLeft size={24} /></button>
                  <button className="nav-btn next" onClick={nextImg}><ChevronRight size={24} /></button>
                </>
              )}
            </div>
            
            {images.length > 1 && (
              <div className="thumbnail-list">
                {images.map((img, idx) => (
                  <div 
                    key={idx} 
                    className={`thumbnail ${idx === currentImgIndex ? 'active' : ''}`}
                    onClick={() => setCurrentImgIndex(idx)}
                  >
                    <img src={img} alt={`Thumbnail ${idx}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Product Information */}
          <div className="product-info-panel">
            <div className="title-row">
              <h1 className="product-main-title">{product.name}</h1>
              <button className="btn-wishlist"><Heart size={24} /></button>
            </div>
            
            <div className="rating-reviews">
              <div className="rating-badge">
                <Star size={16} fill="#fff" />
                <span>{product.rating || 4.5}</span>
              </div>
              <span className="review-count">{product.rating_count || 128} Reviews</span>
            </div>

            <div className="price-section" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span className="price-amount" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1a1a1a' }}>
                ₹{Math.round(finalUnitPrice)}
              </span>
              
              {(() => {
                const offerPrice = Number(product.price);
                const actualPrice = Number(product.actual_price || product.price);
                if (actualPrice > offerPrice) {
                  const percentOff = Math.round(((actualPrice - offerPrice) / actualPrice) * 100);
                  const currentActual = Math.round(finalUnitPrice * (actualPrice / offerPrice));
                  return (
                    <>
                      <span className="actual-price-strikethrough" style={{ fontSize: '1.2rem', textDecoration: 'line-through', color: '#6b7280', fontWeight: 600 }}>
                        ₹{currentActual}
                      </span>
                      <span className="discount-badge" style={{ background: '#dcfce7', color: '#15803d', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 700 }}>
                        {percentOff}% Off
                      </span>
                    </>
                  );
                }
                return null;
              })()}
              
              <span className="free-delivery-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#f3f4f6', color: '#15803d', padding: '0.35rem 0.75rem', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 700, marginLeft: 'auto' }}>
                🛵 Free Delivery
              </span>
            </div>

            {/* WEIGHT SELECTION */}
            {product.category !== 'Combos & Gifts' && (
              <div className="option-group">
                <label>Select Weight</label>
                <div className="pill-selector">
                  {(() => {
                    if (!product.prices) return ['0.5kg', '1kg', '2kg'];
                    const eggType = isEggless ? 'eggless' : 'egg';
                    if (product.prices[eggType] && Object.values(product.prices[eggType]).some(p => p !== '')) {
                      return Object.keys(product.prices[eggType]).filter(w => product.prices[eggType][w] !== '');
                    } else if (Object.values(product.prices).some(p => typeof p === 'string' && p !== '')) {
                      return Object.keys(product.prices).filter(w => typeof product.prices[w] === 'string' && product.prices[w] !== '');
                    }
                    return ['0.5kg', '1kg', '2kg'];
                  })().map(w => (
                    <button 
                      key={w}
                      className={`pill-btn ${selectedWeight === w ? 'active' : ''}`}
                      onClick={() => setSelectedWeight(w)}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* EGG / EGGLESS TOGGLE */}
            {product.category !== 'Combos & Gifts' && (
              <div className="option-group" style={{ marginBottom: '1rem' }}>
                <div className="food-type-toggles">
                  <button 
                    className={`food-btn with-egg ${!isEggless ? 'active' : ''}`}
                    onClick={() => setIsEggless(false)}
                  >
                    <div className="food-icon red-icon">
                      <div className="red-triangle"></div>
                    </div>
                    <span>WITH EGG</span>
                  </button>

                  <button 
                    className={`food-btn eggless ${isEggless ? 'active' : ''}`}
                    onClick={() => setIsEggless(true)}
                  >
                    <div className="food-icon green-icon">
                      <div className="green-circle"></div>
                    </div>
                    <span>EGGLESS</span>
                  </button>
                </div>
              </div>
            )}

            {/* MESSAGE ON CAKE */}
            {product.category !== 'Combos & Gifts' && (
              <div className="option-group">
                <label>Message on Cake (Optional)</label>
                <input 
                  type="text" 
                  className="cake-message-input"
                  placeholder="e.g., Happy Birthday John!"
                  value={messageOnCake}
                  onChange={(e) => setMessageOnCake(e.target.value)}
                  maxLength={30}
                />
                <span className="char-count">{messageOnCake.length}/30</span>
              </div>
            )}

            <div className="options-divider"></div>

            <div className="about-product-header">
              <h3>About the product</h3>
              <span className="sku-code">REGCAKE03A</span>
            </div>

            <div className="product-tabs">
              <div className="tabs-header">
                <button className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`} onClick={() => setActiveTab('description')}>Description</button>
                <button className={`tab-btn ${activeTab === 'instructions' ? 'active' : ''}`} onClick={() => setActiveTab('instructions')}>Instructions</button>
                <button className={`tab-btn ${activeTab === 'delivery' ? 'active' : ''}`} onClick={() => setActiveTab('delivery')}>Delivery Info</button>
              </div>
              
              <div className="tab-content scrollable-tab">
                {activeTab === 'description' && (
                  <div className="tab-pane">
                    {product.category !== 'Combos & Gifts' && (
                      <>
                        <p className="tab-heading">Product Details:</p>
                        <ul className="details-list">
                          <li>Cake Flavour- {product.prices?.metadata?.flavor || product.flavor || product.category || 'Truffle'}</li>
                          <li>Shape- {product.prices?.metadata?.shape || product.shape || 'Round'}</li>
                          <li>Weight: {selectedWeight}</li>
                          <li>Net Quantity: 1 Cake</li>
                          <li>Diameter: {selectedWeight === '0.5kg' ? '15 cm' : selectedWeight === '1kg' ? '19.05 cm' : selectedWeight === '1.5kg' ? '22 cm' : '25 cm'}</li>
                          <li>Country of Origin: India</li>
                          <li>FSSAI License No. 10019011006522</li>
                          <li>Serves: {product.prices?.metadata?.serves || product.serves || (selectedWeight === '0.5kg' ? '4-6 People' : selectedWeight === '1kg' ? '8-10 People' : selectedWeight === '1.5kg' ? '12-15 People' : selectedWeight === '2kg' ? '16-20 People' : '25+ People')}</li>
                        </ul>
                        <p className="tab-heading">Ingredients:</p>
                        <p className="tab-text">Chocolate premix, Refined oil, Breakfast Sugar, Chocolate Truffle Base, Milk Chocolate compound, Chocolate Glaze</p>
                        <p className="tab-heading">Please Note:</p>
                        <ul className="details-list">
                          <li>The cake stand, cutlery accessories used in the image are only for representation purposes. They are not delivered with the cake.</li>
                          <li>This cake is hand delivered in a good quality cardboard box.</li>
                        </ul>
                      </>
                    )}
                    
                    <p className="tab-heading">Description:</p>
                    <p className="tab-text" style={{ whiteSpace: 'pre-wrap' }}>{(product.description && product.description.trim() !== product.name) ? product.description : "Indulge in our exquisite handcrafted offering, prepared to perfection."}</p>
                  </div>
                )}
                {activeTab === 'instructions' && (
                  <div className="tab-pane">
                    <p className="tab-heading">Care Instructions:</p>
                    <p className="tab-text">{product.instructions || "Store cream cakes in a refrigerator. Fondant cakes should be stored in an air conditioned environment. Slice and serve the cake at room temperature and make sure it is not exposed to heat. The cake should be consumed within 24 hours."}</p>
                  </div>
                )}
                {activeTab === 'delivery' && (
                  <div className="tab-pane">
                    <p className="tab-heading">Delivery Information:</p>
                    <ul className="details-list">
                      <li>Every cake we offer is handcrafted and since each chef has his/her own way of baking and designing a cake, there might be slight variation in the product in terms of design and shape.</li>
                      <li>The chosen delivery time is an estimate and depends on the availability of the product and the destination to which you want the product to be delivered.</li>
                      <li>Since cakes are perishable in nature, we attempt delivery of your order only once. The delivery cannot be redirected to any other address.</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="options-divider"></div>

            {/* COMBOS AND GIFTS */}
            {comboOptions.length > 0 && (
              <div className="option-group combos-group">
                <label>Make it Extra Special (Combos & Gifts)</label>
                <div className="combos-grid">
                  {comboOptions.map(combo => (
                    <div 
                      key={combo.id} 
                      className={`combo-card ${selectedCombos[combo.id] ? 'selected' : ''}`}
                      onClick={() => handleComboToggle(combo.id)}
                    >
                      <div className="combo-check">
                        {selectedCombos[combo.id] ? <Check size={14} color="#fff" /> : null}
                      </div>
                      <img src={combo.img} alt={combo.name} className="combo-img" />
                      <div className="combo-details">
                        <span className="combo-name">{combo.name}</span>
                        <span className="combo-price">+₹{combo.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ACTION ROW */}
            <div className="checkout-action-row">
              <div className="checkout-action-inner">
                <div className="checkout-action-left"></div>
                <div className="checkout-action-right">
                  <div className="quantity-selector">
                    <button onClick={() => setQuantity(prev => Math.max(1, prev - 1))}><Minus size={18} /></button>
                    <span>{quantity}</span>
                    <button onClick={() => setQuantity(prev => prev + 1)}><Plus size={18} /></button>
                  </div>
                  <button className="btn-add-to-cart" onClick={handleAddToCart}>
                    Add to Cart - ₹{totalDisplayPrice.toFixed(2)}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
