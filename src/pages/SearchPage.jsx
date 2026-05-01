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
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const force = searchParams.get('force') === 'true';

  // Refined fuzzy matching for "Did you mean?" functionality
  const getCorrection = (q) => {
    if (!q || q.length < 3 || force) return null;
    const lowerQ = q.toLowerCase();
    
    // If original query already has results, don't correct anything
    const hasActualResults = CAKES.some(cake => 
      cake.name.toLowerCase().includes(lowerQ) ||
      (cake.category && cake.category.toLowerCase().includes(lowerQ))
    );
    if (hasActualResults) return null;

    const keywords = ['chocolate', 'fruit', 'classic', 'specialty', 'combo', 'gift', 'dutch', 'truffle', 'red velvet', 'vanilla', 'strawberry', 'eggless'];
    const words = lowerQ.split(/\s+/);
    
    // Check each word in the user's query against our high-value keywords
    for (const word of words) {
      if (word.length < 3) continue;
      
      for (const key of keywords) {
        // Exact match within a word (e.g. "choc" in "chocolate")
        if (key.includes(word)) return key;
        
        // Basic Levenshtein-like distance check for typos
        let diff = 0;
        const maxLen = Math.max(key.length, word.length);
        const minLen = Math.min(key.length, word.length);
        
        if (Math.abs(key.length - word.length) > 2) continue;

        for (let i = 0; i < minLen; i++) {
          if (key[i] !== word[i]) diff++;
        }
        diff += (maxLen - minLen);

        if (diff <= 2) return key;
      }
    }
    return null;
  };

  const correction = getCorrection(query);
  const activeQuery = (correction && !force) ? correction : query;

  const filteredCakes = CAKES.filter(cake => 
    cake.name.toLowerCase().includes(activeQuery.toLowerCase()) ||
    (cake.description && cake.description.toLowerCase().includes(activeQuery.toLowerCase())) ||
    (cake.category && cake.category.toLowerCase().includes(activeQuery.toLowerCase()))
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
          
          {correction && !force ? (
            <div className="correction-info">
              <h1 className="showing-results-text">
                Showing results for <span className="text-pink italic">"{correction}"</span>
              </h1>
              <p className="search-instead-text">
                Search instead for <button className="force-search-link" onClick={() => setSearchParams({q: query, force: 'true'})}>{query}</button>
              </p>
            </div>
          ) : (
            <h1>Search Results for "<span className="text-pink">{query}</span>"</h1>
          )}
          
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
