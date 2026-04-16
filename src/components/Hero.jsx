import './Hero.css';

const InstaIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginBottom: '0.5rem'}}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const WhatsAppIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.06-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-socials">
        <a href="https://www.instagram.com/crumblecakes.in/" target="_blank" rel="noreferrer" aria-label="Instagram">
          <InstaIcon />
        </a>
        <a href="https://wa.me/917307729020" target="_blank" rel="noreferrer" aria-label="WhatsApp">
          <WhatsAppIcon />
        </a>
        <span className="socials-label" style={{marginTop: '1rem'}}>ANY TYPE OF CAKE YOU NEED</span>
      </div>

      <div className="hero-content">
        <h1 className="hero-title">
          <span className="text-black line-1">Every One</span>{' '}
          <span className="text-pink-italic line-1-end">Love's</span>
          <br />
          <span className="text-black-bold line-2">Natural and</span>
          <br />
          <span className="text-pink-bold line-3">healthy Cakes.</span>
        </h1>
        
        <p className="hero-tagline">FROM OUR OVEN TO YOUR HEART</p>
        <p className="hero-description">
          Discover our handcrafted, freshly baked cakes made with the finest natural ingredients. Perfect for every celebration, delivering joy and sweetness straight to your door!
        </p>
        
        <div className="hero-actions">
          <a href="#cakes" className="btn btn-primary" style={{textDecoration: 'none', display: 'inline-flex', justifyContent: 'center', alignItems: 'center'}}>ORDER NOW</a>
          <a href="#about" className="btn btn-outline" style={{textDecoration: 'none', display: 'inline-flex', justifyContent: 'center', alignItems: 'center'}}>EXPLORE MORE</a>
        </div>
      </div>

      <div className="hero-image-wrapper">
        <div className="image-frame-decoration"></div>
        <div className="badge-care">
           <svg viewBox="0 0 100 100" className="badge-text-curve">
              <path id="curve" d="M 50, 50 m -40, 0 a 40,40 0 1,1 80,0 a 40,40 0 1,1 -80,0" fill="transparent" />
              <text>
                <textPath href="#curve" startOffset="0%" className="badge-text">
                  WE CARE ABOUT YOUR CAKE!
                </textPath>
              </text>
            </svg>
            <div className="badge-center-icon">🎂</div>
        </div>
        <img src="/hero-cake.png" alt="Delicious Strawberry Cake" className="hero-cake-img" />
        <div className="rating-box">
          <div className="stars">★★★★★</div>
          <span className="rating-score">4.5</span>
        </div>
      </div>

      <div className="hero-pagination">
        <div className="pagination-line">
          <div className="active-dot" style={{ top: '0%' }}></div>
        </div>
        <span className="page-num top">01</span>
        <span className="page-num bottom">03</span>
      </div>
    </section>
  );
}
