import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import Navbar from '../components/Navbar';
import { Star, SearchX, ChevronRight, ArrowLeft } from 'lucide-react';
import './SearchPage.css';

function CakeCard({ cake }) {
  const navigate = useNavigate();
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

  return (
    <div className="cake-card" onClick={() => navigate(`/product/${cake.id}`)}>
      <div className="cake-image-section">
        <img src={images[0]} alt={cake.name} className="cake-img" />
      </div>
      <div className="cake-content">
        <h3 className="cake-title">{cake.name}</h3>
        <div className="cake-price-group">
          {cake.actual_price && Number(cake.actual_price) > Number(cake.price) && (
            <span className="cake-actual-price">₹{Math.round(cake.actual_price)}</span>
          )}
          <span className="cake-price-tag">₹{Math.round(cake.price)}</span>
        </div>
        <div className="cake-rating-box">
          <Star size={12} fill="#22c55e" color="#22c55e" />
          <span>{cake.rating || '4.5'}</span>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  const { products: CAKES } = useProducts();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';

  const filteredCakes = CAKES.filter(cake => 
    cake.name.toLowerCase().includes(query.toLowerCase()) ||
    (cake.description && cake.description.toLowerCase().includes(query.toLowerCase())) ||
    (cake.category && cake.category.toLowerCase().includes(query.toLowerCase()))
  );

  const otherCakes = CAKES.filter(cake => !filteredCakes.find(f => f.id === cake.id)).slice(0, 8);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [query]);

  return (
    <div className="search-page-wrapper">
      <Navbar />
      
      <main className="search-results-container">
        <div className="search-header-context">
          <button className="back-to-shop" onClick={() => navigate('/')}>
            <ArrowLeft size={18} /> Back to Home
          </button>
          <h1>Search Results for "<span className="text-pink">{query}</span>"</h1>
          <p>{filteredCakes.length} results found</p>
        </div>

        {filteredCakes.length > 0 ? (
          <div className="search-results-grid">
            {filteredCakes.map(cake => (
              <CakeCard key={cake.id} cake={cake} />
            ))}
          </div>
        ) : (
          <div className="no-search-results">
            <SearchX size={64} color="#ccc" />
            <h2>No cakes found matching your search</h2>
            <p>We couldn't find anything for "{query}". Try checking your spelling or using different keywords.</p>
            <button className="btn-explore" onClick={() => navigate('/')}>Explore All Cakes</button>
          </div>
        )}

        {otherCakes.length > 0 && (
          <div className="more-products-section">
            <div className="section-divider">
              <span>You might also like</span>
            </div>
            <div className="search-results-grid">
              {otherCakes.map(cake => (
                <CakeCard key={cake.id} cake={cake} />
              ))}
            </div>
          </div>
        )}

        <div className="search-footer-spacer"></div>
      </main>
    </div>
  );
}
