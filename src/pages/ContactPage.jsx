import { MapPin, Phone, MessageCircle } from 'lucide-react';
import './AboutPage.css';

const InstagramIcon = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

export default function ContactPage() {
  return (
    <main id="contact" className="contact-section">
      <div className="about-container">
        {/* Section Header */}
        <header className="section-header">
          <span className="section-tag">Get in Touch</span>
          <h1 className="section-title">
            Let's <span className="text-gradient">Connect</span>
          </h1>
          <p className="section-desc">
            We would love to bake for you! Reach out and let's create something sweet together.
          </p>
        </header>

        {/* Contact Cards */}
        <div className="contact-grid">
          {/* Location Card */}
          <div className="contact-card">
            <div className="contact-card-icon">
              <MapPin size={24} />
            </div>
            <h3>Visit & Pick Up</h3>
            <div className="contact-details">
              <p className="contact-location"><MapPin size={14} /> Azamgarh</p>
              <p className="contact-address">
                Nagar Palika, Agrasen Chauraha<br/>
                Near Blackberry Showroom<br/>
                Azamgarh, 276001
              </p>
            </div>
            <a href="https://maps.google.com" target="_blank" rel="noreferrer" className="contact-action-btn primary-gradient">
              Get Directions <span className="arrow">&gt;</span>
            </a>
          </div>

          {/* WhatsApp Card */}
          <div className="contact-card">
            <div className="contact-card-icon whatsapp">
              <MessageCircle size={24} />
            </div>
            <h3>WhatsApp to Order</h3>
            <div className="contact-details">
              <div className="info-pill">
                <Phone size={14} />
                +91 7307729020
              </div>
              <div className="info-pill">
                <Phone size={14} />
                +91 9219309797
              </div>
            </div>
            <a href="https://wa.me/917307729020" target="_blank" rel="noreferrer" className="contact-action-btn green-gradient">
              WhatsApp Us <span className="arrow">&gt;</span>
            </a>
          </div>

          {/* Instagram Card */}
          <div className="contact-card">
            <div className="contact-card-icon instagram">
              <InstagramIcon size={24} />
            </div>
            <h3>Follow & Order in DM</h3>
            <div className="contact-details">
              <div className="info-pill instagram">
                <InstagramIcon size={14} />
                @crumblecakes.in
              </div>
              <p className="contact-hint">Follow us for the latest cakes, reels & daily specials!</p>
            </div>
            <a href="https://www.instagram.com/crumblecakes.in/" target="_blank" rel="noreferrer" className="contact-action-btn primary-gradient">
              Message Us <span className="arrow">&gt;</span>
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
