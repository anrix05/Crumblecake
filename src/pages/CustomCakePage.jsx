import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import Navbar from '../components/Navbar';
import { Upload, X, ArrowLeft, Cake, CheckCircle2, ChevronRight, Image as ImageIcon } from 'lucide-react';
import './CustomCakePage.css';

export default function CustomCakePage() {
  const navigate = useNavigate();
  const { user, savedName, savedAddress, setIsAuthModalOpen } = useAuth();
  const { addOrder } = useOrders();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    weight: '1kg',
    isEggless: true,
    shape: 'Round',
    flavor: 'Chocolate Truffle',
    message: '',
    budget: '₹1000 - ₹2000'
  });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [customImage, setCustomImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef(null);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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

  const handlePreSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!formData.name.trim() || !formData.description.trim()) {
      alert('Please fill in all details');
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirmModal(false);
    setSubmitting(true);


    const customOrder = {
      customer: savedName || user.email.split('@')[0],
      email: user.email,
      address: savedAddress || 'Not provided',
      total: 0,
      items: [{
        type: 'custom',
        name: formData.name,
        description: formData.description,
        size: formData.weight,
        image: customImage,
        details: {
          isEggless: formData.isEggless,
          shape: formData.shape,
          flavor: formData.flavor,
          message: formData.message,
          budget: formData.budget
        },
        quantity: 1,
        price: 0
      }]
    };

    await addOrder(customOrder);
    setSubmitting(false);
    setSubmitted(true);

    setTimeout(() => {
      navigate('/account');
    }, 3000);
  };

  if (submitted) {
    return (
      <div className="custom-cake-wrapper">
        <Navbar />
        <div className="custom-success-container">
          <CheckCircle2 size={80} color="#22c55e" />
          <h1>Dream Cake Request Submitted!</h1>
          <p>Our expert bakers will review your design and contact you with a quote shortly.</p>
          <button className="btn-primary" onClick={() => navigate('/account')}>View My Orders</button>
        </div>
      </div>
    );
  }

  return (
    <div className="custom-cake-wrapper">
      <Navbar />
      
      <main className="custom-cake-main">

        {showConfirmModal && (
          <div className="modal-overlay" style={{position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <div className="modal-content confirm-modal" style={{background: 'white', padding: '2rem', borderRadius: '16px', maxWidth: '400px', textAlign: 'center'}}>
              <h2 style={{color: '#bc024d', marginBottom: '1rem'}}>Confirm Quote Request</h2>
              <p style={{marginBottom: '1rem', color: '#4b5563', fontSize: '0.95rem'}}>You are about to submit a request for a custom cake quote.</p>
              <p style={{marginBottom: '1.5rem', color: '#4b5563', fontSize: '0.95rem'}}>Our admin will review your details, including your budget range (<strong>{formData.budget}</strong>), and set a final price for your order.</p>
              <p style={{marginBottom: '2rem', color: '#4b5563', fontSize: '0.95rem'}}>Once the price is set, you can review it in your account and choose to <strong>Accept</strong> or <strong>Cancel</strong> the order.</p>
              <div className="modal-actions" style={{display: 'flex', gap: '1rem', justifyContent: 'center'}}>
                <button className="btn-secondary" style={{padding: '0.75rem 1.5rem', borderRadius: '50px', border: '1px solid #ccc', background: 'white'}} onClick={() => setShowConfirmModal(false)}>Go Back</button>
                <button className="btn-primary" style={{padding: '0.75rem 1.5rem', borderRadius: '50px', border: 'none', background: '#cd3d7a', color: 'white'}} onClick={handleConfirmSubmit}>Submit Request</button>
              </div>
            </div>
          </div>
        )}


        <div className="custom-cake-header">
          <h1>Build Your Dream Cake</h1>
          <p>Bring your imagination to life. Customize every detail and our expert bakers will make it a reality.</p>
        </div>

        <div className="custom-cake-container">
          <div className="custom-form-side">
            <form onSubmit={handlePreSubmit} className="dream-cake-form">
              
              {/* Basic Details */}
              <div className="form-section">
                <h2>1. What are we building?</h2>
                <div className="input-group">
                  <label>Cake Concept / Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Spiderman Theme Birthday Cake" 
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required 
                  />
                </div>
                <div className="input-group">
                  <label>Describe your vision in detail</label>
                  <textarea 
                    placeholder="Describe the colors, decorations, tiers, and any special elements you want..." 
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    required
                    rows={4}
                  />
                </div>
              </div>

              {/* Specifications */}
              <div className="form-section">
                <h2>2. Specifications</h2>
                
                <div className="spec-grid">
                  <div className="input-group">
                    <label>Weight</label>
                    <div className="pill-selector">
                      {['0.5kg', '1kg', '1.5kg', '2kg', '3kg+'].map(w => (
                        <button 
                          key={w} type="button"
                          className={`pill-btn ${formData.weight === w ? 'active' : ''}`}
                          onClick={() => handleInputChange('weight', w)}
                        >{w}</button>
                      ))}
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Dietary Preference</label>
                    <div className="pill-selector">
                      <button 
                        type="button"
                        className={`pill-btn ${formData.isEggless ? 'active eggless' : ''}`}
                        onClick={() => handleInputChange('isEggless', true)}
                      >Eggless</button>
                      <button 
                        type="button"
                        className={`pill-btn ${!formData.isEggless ? 'active with-egg' : ''}`}
                        onClick={() => handleInputChange('isEggless', false)}
                      >With Egg</button>
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Shape</label>
                    <select value={formData.shape} onChange={(e) => handleInputChange('shape', e.target.value)}>
                      <option>Round</option>
                      <option>Square</option>
                      <option>Heart</option>
                      <option>Rectangle</option>
                      <option>Tiered</option>
                      <option>Custom Shape</option>
                    </select>
                  </div>

                  <div className="input-group">
                    <label>Base Flavor</label>
                    <select value={formData.flavor} onChange={(e) => handleInputChange('flavor', e.target.value)}>
                      <option>Chocolate Truffle</option>
                      <option>Black Forest</option>
                      <option>Vanilla</option>
                      <option>Red Velvet</option>
                      <option>Butterscotch</option>
                      <option>Pineapple</option>
                      <option>Mixed Fruit</option>
                      <option>Custom/Other</option>
                    </select>
                  </div>

                  <div className="input-group">
                    <label>Estimated Budget</label>
                    <select value={formData.budget} onChange={(e) => handleInputChange('budget', e.target.value)}>
                      <option>Under ₹1000</option>
                      <option>₹1000 - ₹2000</option>
                      <option>₹2000 - ₹3000</option>
                      <option>₹3000 - ₹5000</option>
                      <option>₹5000+</option>
                    </select>
                  </div>
                </div>

                <div className="input-group" style={{marginTop: '1.5rem'}}>
                  <label>Message on Cake</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Happy 10th Birthday Leo!" 
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-submit-row">
                <p className="price-note">Price will be quoted upon review</p>
                <button type="submit" className="submit-dream-btn" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Request Quote'} <ChevronRight size={18} />
                </button>
              </div>
            </form>
          </div>

          <div className="custom-visual-side">
            <div className="upload-container">
              <h3>Have a reference image?</h3>
              <p>Upload a picture of a cake you like or a sketch of your idea.</p>
              
              <div 
                className={`upload-dropzone ${customImage ? 'has-image' : ''}`}
                onClick={() => fileInputRef.current?.click()}
              >
                {customImage ? (
                  <>
                    <img src={customImage} alt="Reference" className="reference-preview" />
                    <button 
                      className="remove-img-btn" 
                      onClick={(e) => { e.stopPropagation(); setCustomImage(null); }}
                    >
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <div className="upload-placeholder">
                    <ImageIcon size={48} color="#cd3d7a" />
                    <span>Click or drag to upload</span>
                    <span className="upload-hint">PNG, JPG up to 3MB</span>
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

              <div className="inspiration-note">
                <Cake size={20} color="#cd3d7a" />
                <span>Our chefs specialize in fondant, fresh floral arrangements, and intricate structural cakes.</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
