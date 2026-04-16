import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import CakesPage from './CakesPage';
import AboutPage from './AboutPage';
import ContactPage from './ContactPage';
import '../decor.css';

export default function LandingPage() {
  return (
    <>
      {/* Absolute positioned decorative elements for background */}
      <div className="bg-decor bg-leaf pattern-1" style={{top: '5%', left: '10%'}}></div>
      <div className="bg-decor bg-berry pattern-2" style={{top: '15%', left: '40%'}}></div>
      <div className="bg-decor bg-strawberry pattern-3" style={{top: '25%', right: '5%'}}></div>
      <div className="bg-decor bg-cake pattern-4" style={{bottom: '5%', right: '20%'}}></div>
      <div className="bg-decor bg-strawberry pattern-5" style={{bottom: '20%', left: '15%'}}></div>

      <Navbar />
      <Hero />
      <CakesPage />
      <AboutPage />
      <ContactPage />
    </>
  );
}
