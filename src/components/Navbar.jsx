import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, User, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import './Navbar.css';

export default function Navbar() {
  const { cartCount, setIsCartOpen } = useCart();
  const { user, isAdmin, setIsAuthModalOpen } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const hideBanner = ['/cart', '/checkout', '/account'].includes(location.pathname) || location.pathname.startsWith('/account/order/');
  const isHome = location.pathname === '/';
  const isProductPage = location.pathname.startsWith('/product/');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}#cakes`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

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
    <header className={`header-wrapper ${!isHome ? 'solid-bg' : ''} ${isProductPage ? 'product-navbar' : ''}`}>
      {!hideBanner && (
        <div className="promo-banner">
          <Truck size={20} color="#ffe17c" style={{ zIndex: 1 }} />
          <span className="promo-banner-text">
            <span className="promo-banner-highlight">FREE DELIVERY!!!</span> 
            On eligible delivery time slots.
          </span>
          <Truck size={20} color="#ffe17c" style={{ zIndex: 1 }} />
        </div>
      )}
      <nav className="navbar">
        <a href="/#home" className="navbar-logo" onClick={closeMobileMenu}>
        <svg width="34" height="34" viewBox="0 0 100 100" fill="none" stroke="#3b1f13" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" className="logo-icon">
          <path d="M 22 55 L 55 35 C 65 35, 75 40, 75 45" />
          <path d="M 22 62 L 75 52 C 82 50, 82 60, 75 62 L 22 72 C 16 73, 16 63, 22 62 Z" />
          <path d="M 53 36 C 50 30, 56 22, 58 20 C 62 25, 64 30, 58 34" />
          <path d="M 50 34 C 55 31, 60 31, 64 35" strokeWidth="4.5" />
          <circle cx="58" cy="10" r="3" fill="#3b1f13" stroke="none" />
          <circle cx="48" cy="18" r="2.5" fill="#3b1f13" stroke="none" />
          <circle cx="68" cy="18" r="2.5" fill="#3b1f13" stroke="none" />
        </svg>
        <span className="logo-text-crumble">CRUMBLECAKE</span>
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
        {isSearchOpen ? (
          <form className="search-expand-form" onSubmit={handleSearchSubmit}>
            <input 
              autoFocus
              type="text" 
              placeholder="Search cakes..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onBlur={() => !searchQuery && setIsSearchOpen(false)}
              className="search-input-field"
            />
          </form>
        ) : (
          <>
            <a href="#cakes" className="navbar-order-btn">
              Order Now <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </a>
            <button className="icon-btn search-btn" onClick={() => setIsSearchOpen(true)}>
              <Search size={20} />
            </button>
          </>
        )}
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
    </header>
  );
}
