import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import './Navbar.css';

export default function Navbar() {
  const { cartCount, setIsCartOpen } = useCart();
  const { user, isAdmin, setIsAuthModalOpen } = useAuth();
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleAuthClick = () => {
    setIsMobileMenuOpen(false);
    if (user) {
      navigate('/account');
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className="navbar">
      <a href="/#home" className="navbar-logo" onClick={closeMobileMenu}>
        <span className="logo-text-crumble">crumblecakes</span>
      </a>
      
      <div className={`navbar-overlay ${isMobileMenuOpen ? 'open' : ''}`} onClick={closeMobileMenu}></div>
      
      <ul className={`navbar-links ${isMobileMenuOpen ? 'open' : ''}`}>
        <li><a href="/#home" onClick={closeMobileMenu}>Home</a></li>
        <li><a href="/#cakes" onClick={closeMobileMenu}>Cakes</a></li>
        <li><a href="/#about" onClick={closeMobileMenu}>About</a></li>
        <li><a href="/#contact" onClick={closeMobileMenu}>Contact</a></li>
        {isAdmin && <li><Link to="/admin" style={{color: 'var(--color-primary)'}} onClick={closeMobileMenu}>Admin</Link></li>}
      </ul>

      <div className="navbar-actions">
        <a href="#cakes" className="navbar-order-btn">
          Order Now <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </a>
        <button className="icon-btn search-btn">
          <Search size={20} />
        </button>
        <button className="icon-btn auth-btn" onClick={handleAuthClick} aria-label="Account">
          <User size={20} style={{ color: user ? 'var(--color-primary)' : 'inherit' }} />
        </button>
        <button className="icon-btn cart-btn" onClick={() => navigate('/cart')} aria-label="Cart">
          <ShoppingBag size={20} />
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </button>
        <button className="hamburger-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          <div className={`hamburger-line ${isMobileMenuOpen ? 'open-1' : ''}`}></div>
          <div className={`hamburger-line ${isMobileMenuOpen ? 'open-2' : ''}`}></div>
          <div className={`hamburger-line ${isMobileMenuOpen ? 'open-3' : ''}`}></div>
        </button>
      </div>
    </nav>
  );
}
