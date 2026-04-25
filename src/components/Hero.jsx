import { ChevronDown, Star } from 'lucide-react';
import './Hero.css';

export default function Hero() {
  return (
    <section className="hero-section">
      <div className="hero-bg-shape"></div>
      <div className="hero-bg-curve"></div>

      {/* Decorative Flowers (CSS-based placeholders for the mockup's florals) */}
      <div className="decor-flower top-left"></div>
      <div className="decor-flower top-middle"></div>
      <div className="decor-flower bottom-left"></div>
      <div className="decor-flower bottom-middle"></div>

      <div className="hero-content-area">
        <h1 className="hero-title-main">
          <span className="text-dark">Everyone </span>
          <span className="text-pink">Loves</span><span className="desktop-br"><br/></span>
          <span className="text-dark">Natural and </span><span className="desktop-br"><br/></span>
          <span className="text-pink">healthy Cakes.</span>
        </h1>
        
        <p className="hero-subtitle">FROM OUR OVEN TO YOUR HEART</p>
        <p className="hero-body-text">
          Discover our handcrafted, freshly baked cakes made with the
          finest natural ingredients. Perfect for every celebration, delivering
          joy and sweetness straight to your door!
        </p>
        
        <div className="hero-buttons">
          <a href="#cakes" className="hero-btn-primary">
            ORDER NOW <ChevronDown size={16} />
          </a>
          <a href="#about" className="hero-btn-outline">
            EXPLORE MORE
          </a>
        </div>
      </div>

      <div className="hero-image-area">
        {/* Badge */}
        <div className="hero-badge">
          <svg viewBox="0 0 100 100" className="badge-svg">
            <path id="curve" d="M 50, 15 a 35,35 0 1,1 0,70 a 35,35 0 1,1 0,-70" fill="transparent" />
            <text>
              <textPath href="#curve" startOffset="0%" className="badge-text">
                FRESHLY BAKED JUST FOR YOU •
              </textPath>
            </text>
          </svg>
          <div className="badge-icon">
            <img src="https://img.icons8.com/color/48/000000/cake.png" alt="Cake" width="24" height="24"/>
          </div>
        </div>

        {/* Cake Image Container */}
        <div className="cake-pedestal-container">
          <img src="/hero-cake.png" alt="Fresh Strawberry Cake" className="main-cake-img" />
        </div>

        {/* Rating Pill */}
        <div className="rating-pill">
          <div className="stars-wrapper">
             <Star size={16} fill="#FFC107" color="#FFC107" />
             <Star size={16} fill="#FFC107" color="#FFC107" />
             <Star size={16} fill="#FFC107" color="#FFC107" />
             <Star size={16} fill="#FFC107" color="#FFC107" />
             <Star size={16} fill="#FFC107" color="#FFC107" />
          </div>
          <span className="rating-number">4.5</span>
        </div>
      </div>
    </section>
  );
}
