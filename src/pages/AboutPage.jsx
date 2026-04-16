import { ChefHat, Heart, Award, Sparkles } from 'lucide-react';
import './AboutPage.css';

export default function AboutPage() {
  return (
    <main id="about" className="about-section">
      <div className="about-container">
        {/* Section Header */}
        <header className="section-header">
          <span className="section-tag">Our Story</span>
          <h1 className="section-title">
            Crafted with <span className="text-gradient">Passion</span>
          </h1>
          <p className="section-desc">
            Baker | Food Creator | Dessert Enthusiast — bringing you freshly 
            baked happiness right here in Azamgarh.
          </p>
        </header>

        {/* Feature Cards */}
        <div className="about-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <ChefHat size={28} />
            </div>
            <h3>Handcrafted Daily</h3>
            <p>Every cake is baked fresh to order with premium ingredients and lots of love.</p>
          </div>

          <div className="feature-card featured">
            <div className="feature-icon">
              <Heart size={28} />
            </div>
            <h3>Made with Love</h3>
            <p>From our kitchen to your celebration — each creation is a labor of love and artistry.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Award size={28} />
            </div>
            <h3>Premium Quality</h3>
            <p>We use only the finest ingredients sourced locally to deliver the best flavors.</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="stats-row">
          <div className="stat-item">
            <span className="stat-number">500+</span>
            <span className="stat-label">Happy Customers</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-number">50+</span>
            <span className="stat-label">Cake Flavors</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-number">4.9</span>
            <span className="stat-label">Avg Rating ⭐</span>
          </div>
        </div>
      </div>
    </main>
  );
}
