import { useState } from 'react';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { ShoppingBag, Star, Plus, Upload, X, Palette, Info, Cake, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './CakesPage.css';

function CakeCard({ cake, addToCart }) {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  
  // Parse images from the workaround JSON string or fallback
  const images = (() => {
    try {
      if (typeof cake.image === 'string' && cake.image.startsWith('[')) {
        return JSON.parse(cake.image);
      }
      return [cake.image || '/hero-cake.png'];
    } catch (e) {
      return [cake.image || '/hero-cake.png'];
    }
  })();

  const nextImg = (e) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev + 1) % images.length);
  };

  const prevImg = (e) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const navigate = useNavigate();

  return (
    <div className="cake-card" onClick={() => navigate(`/product/${cake.id}`)}>
      <div className="cake-image-section">
        <img src={images[currentImgIndex]} alt={cake.name} className="cake-img" />
        {images.length > 1 && (
          <div className="pagination-dots">
            {images.map((_, idx) => (
              <div 
                key={idx} 
                className={`dot ${idx === currentImgIndex ? 'active' : ''}`}
                onClick={(e) => { e.stopPropagation(); setCurrentImgIndex(idx); }}
              ></div>
            ))}
          </div>
        )}
      </div>

      <div className="cake-content">
        <h3 className="cake-title">{cake.name}</h3>
        
        <div className="cake-price-group">
          {cake.actual_price && Number(cake.actual_price) > Number(cake.price) && (
            <span className="cake-actual-price">₹{Math.round(cake.actual_price)}</span>
          )}
          <span className="cake-price-tag">₹{Math.round(cake.price)}</span>
          {cake.actual_price && Number(cake.actual_price) > Number(cake.price) && (
            <span className="cake-off-badge">
              {Math.round(((Number(cake.actual_price) - Number(cake.price)) / Number(cake.actual_price)) * 100)}% OFF
            </span>
          )}
        </div>

        <div className="cake-rating-box">
          <Star size={12} fill="#22c55e" color="#22c55e" />
          <span>{cake.rating || '5'}</span>
          <span className="rating-divider">|</span>
          <span className="rating-count">1.0K</span>
        </div>
      </div>
    </div>
  );
}

export default function CakesPage() {
  const { products: CAKES } = useProducts();
  const { addToCart } = useCart();
  const { user, setIsAuthModalOpen } = useAuth();
  const [activeCategory, setActiveCategory] = useState('All');
  const navigate = useNavigate();

  const categories = ['All', 'Fruit', 'Chocolate', 'Classic', 'Specialty'];

  const filteredCakes = activeCategory === 'All' 
    ? CAKES 
    : CAKES.filter(cake => cake.category === activeCategory);



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
          {/* Build Your Own Cake Card */}
          <div className="cake-card custom-cake-card" onClick={() => navigate('/custom-cake')}>
            <div className="custom-cake-image-wrapper">
              <div className="cake-image-section custom-cake-image-bg">
                 <img src="/images/custom_cake_illustration.png" alt="Build Your Dream Cake" className="custom-cake-illustration" />
              </div>
            </div>

            <div className="cake-content custom-cake-content">
              <h3 className="custom-cake-title">Build Your Dream Cake</h3>
              <p className="custom-cake-subtitle">
                Fully Customizable Design
              </p>
              <div className="cake-footer custom-cake-footer">
                <button className="custom-cake-btn">
                  Start Designing <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {filteredCakes.map(cake => (
            <CakeCard key={cake.id} cake={cake} addToCart={addToCart} />
          ))}
        </div>
      </main>
    </>
  );
}
