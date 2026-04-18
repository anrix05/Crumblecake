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

  const handleAuthClick = () => {
    if (user) {
      navigate('/account');
    } else {
      setIsAuthModalOpen(true);
    }
  };

  return (
    <nav className="navbar">
      <a href="/#home" className="navbar-logo">
        <div className="logo-text">
          <span className="logo-black">Crumblecakes</span>
        </div>
      </a>
      
      <ul className="navbar-links">
        <li><a href="/#home">Home</a></li>
        <li><a href="/#cakes">Cakes</a></li>
        <li><a href="/#about">About</a></li>
        <li><a href="/#contact">Contact</a></li>
        {isAdmin && <li><Link to="/admin" style={{color: 'var(--color-primary)'}}>Admin</Link></li>}
      </ul>

      <div className="navbar-actions">
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
      </div>
    </nav>
  );
}
