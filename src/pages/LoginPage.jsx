import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChevronRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import './LoginPage.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const { error: signInError } = await signIn(email, password);

    if (signInError) {
      setError(signInError.message);
      setIsLoading(false);
    } else {
      navigate('/admin');
    }
  };

  return (
    <div className="login-wrapper">
      <Navbar />
      <div className="login-container">
        <div className="login-panel">
          <div className="login-header">
            <div className="login-logo">
              <img src="/logo.png" alt="Crumblecakes" />
            </div>
            <h2>Admin Portal</h2>
            <p>Enter your credentials to access the bakery management suite.</p>
          </div>
          
          <form className="login-form" onSubmit={handleLogin}>
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-group">
              <label>ADMIN EMAIL</label>
              <input 
                type="email" 
                placeholder="chef@crumblecakes.in" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label>PASSWORD</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary login-btn"
              disabled={isLoading}
            >
              {isLoading ? 'AUTHENTICATING...' : 'SECURE LOGIN'} <ChevronRight size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
