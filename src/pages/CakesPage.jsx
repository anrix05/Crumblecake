import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { ShoppingBag, Star, Plus, Upload, X, Palette, Info } from 'lucide-react';
import './CakesPage.css';

export default function CakesPage() {
  const { products: CAKES } = useProducts();
  const { addToCart } = useCart();
  const { user, savedName, savedPhone, savedAddress, setIsAuthModalOpen } = useAuth();
  const { addOrder } = useOrders();
  const [activeCategory, setActiveCategory] = useState('All');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customImage, setCustomImage] = useState(null);
  const [customName, setCustomName] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [customSize, setCustomSize] = useState('1kg');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef(null);

  const categories = ['All', 'Fruit', 'Chocolate', 'Classic', 'Specialty'];

  const filteredCakes = activeCategory === 'All' 
    ? CAKES 
    : CAKES.filter(cake => cake.category === activeCategory);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      alert('Image must be under 3MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setCustomImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 3 * 1024 * 1024) {
        alert('Image must be under 3MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setCustomImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleCustomSubmit = async () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!customName.trim() || !customDesc.trim()) {
      alert('Please fill in all details');
      return;
    }

    setSubmitting(true);

    const customOrder = {
      customer: savedName || user.email.split('@')[0],
      email: user.email,
      address: savedAddress || 'Not provided',
      total: 0,
      items: [{
        type: 'custom',
        name: customName,
        description: customDesc,
        size: customSize,
        image: customImage,
        quantity: 1,
        price: 0
      }]
    };

    await addOrder(customOrder);
    setSubmitting(false);
    setSubmitted(true);

    setTimeout(() => {
      setShowCustomModal(false);
      setSubmitted(false);
      setCustomImage(null);
      setCustomName('');
      setCustomDesc('');
      setCustomSize('1kg');
    }, 3000);
  };

  const openCustomModal = () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    setShowCustomModal(true);
  };

  return (
    <>
      <main id="cakes" className="cakes-main" style={{paddingTop: '6rem'}}>
        <header className="cakes-header">
          <h1 className="cakes-title">Explore Our <span className="text-pink">Cakes</span></h1>
          <p className="cakes-subtitle">Freshly baked everyday, just for you.</p>
        </header>

        <div className="category-filters">
          {categories.map(cat => (
            <button 
              key={cat} 
              className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="cakes-grid">
          {filteredCakes.map(cake => (
            <div key={cake.id} className="cake-card">
              <div className="cake-image-container">
                <img src={cake.image} alt={cake.name} className="cake-img" />
                <div className="cake-rating">
                  <Star size={14} fill="#ffc107" color="#ffc107" />
                  <span>{cake.rating}</span>
                </div>
              </div>
              <div className="cake-info">
                <span className="cake-category">{cake.category}</span>
                <h3 className="cake-name">{cake.name}</h3>
                <div className="cake-bottom">
                  <span className="cake-price">₹{cake.price.toFixed(2)}</span>
                  <button className="add-to-cart-btn" onClick={() => addToCart(cake)}>
                    <ShoppingBag size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Build Your Own Cake Card */}
          <div className="cake-card custom-cake-card" onClick={openCustomModal}>
            <div className="custom-cake-visual">
              <div className="custom-cake-icon">
                <Palette size={32} />
              </div>
              <div className="custom-cake-plus">
                <Plus size={24} />
              </div>
            </div>
            <div className="cake-info">
              <span className="cake-category" style={{color: '#5200ff'}}>Custom</span>
              <h3 className="cake-name">Build Your Own</h3>
              <div className="cake-bottom">
                <span className="custom-cake-tag">Design It →</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Portal: renders modal at document.body to escape stacking context */}
      {showCustomModal && createPortal(
        <div className="custom-modal-overlay" onClick={() => !submitting && setShowCustomModal(false)}>
          <div className="custom-modal" onClick={e => e.stopPropagation()}>
            
            {submitted ? (
              <div className="custom-success">
                <div className="success-checkmark">✓</div>
                <h2>Order Submitted!</h2>
                <p>Your custom cake request has been sent. Check your <strong>Order History</strong> for the price update.</p>
              </div>
            ) : (
              <>
                <div className="custom-modal-header">
                  <div>
                    <h2>Build Your Dream Cake</h2>
                    <p>Upload a reference & tell us what you want</p>
                  </div>
                  <button className="custom-close" onClick={() => setShowCustomModal(false)}>
                    <X size={20} />
                  </button>
                </div>

                <div className="custom-modal-body">
                  {/* Image Upload */}
                  <div 
                    className={`custom-upload-area ${customImage ? 'has-image' : ''}`}
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    {customImage ? (
                      <>
                        <img src={customImage} alt="Reference" className="custom-preview" />
                        <button className="remove-image" onClick={(e) => { e.stopPropagation(); setCustomImage(null); }}>
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <div className="upload-placeholder">
                        <Upload size={32} />
                        <p>Upload Reference Image</p>
                        <span>Click or drag & drop (Max 3MB)</span>
                      </div>
                    )}
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      hidden
                    />
                  </div>

                  {/* Form Fields */}
                  <div className="custom-form">
                    <div className="custom-field">
                      <label>Cake Name / Occasion</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Birthday Cake for Mom"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                      />
                    </div>
                    
                    <div className="custom-field">
                      <label>Special Instructions</label>
                      <textarea 
                        placeholder="Describe the flavor, colors, decorations, text, layers..."
                        rows={3}
                        value={customDesc}
                        onChange={(e) => setCustomDesc(e.target.value)}
                      />
                    </div>

                    <div className="custom-field">
                      <label>Size</label>
                      <div className="size-options">
                        {['0.5kg', '1kg', '2kg', '3kg'].map(size => (
                          <button
                            key={size}
                            className={`size-btn ${customSize === size ? 'active' : ''}`}
                            onClick={() => setCustomSize(size)}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Notice Banner */}
                  <div className="custom-notice">
                    <Info size={18} />
                    <p>
                      <strong>Price will be decided after order is placed.</strong> You can check it in your Order History. You can also cancel within 30 minutes.
                    </p>
                  </div>

                  <button 
                    className="custom-submit-btn" 
                    onClick={handleCustomSubmit}
                    disabled={submitting || !customName.trim() || !customDesc.trim()}
                  >
                    {submitting ? 'Submitting...' : 'Submit Custom Order'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
