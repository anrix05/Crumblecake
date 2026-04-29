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
  const [resetMessage, setResetMessage] = useState('');
  
  const { signIn, resetPassword } = useAuth();
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
  
  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your admin email first.');
      return;
    }
    setIsLoading(true);
    setError('');
    setResetMessage('');
    
    const { error: resetError } = await resetPassword(email);
    setIsLoading(false);
    if (resetError) {
      setError(resetError.message);
    } else {
      setResetMessage('A secure password reset link has been dispatched to your email.');
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

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-0.5rem', marginBottom: '1.5rem' }}>
              <button 
                type="button" 
                onClick={handleForgotPassword}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#cd3d7a',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Forgot Password?
              </button>
            </div>

            {resetMessage && (
              <div style={{ color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.75rem', borderRadius: '12px', fontSize: '0.85rem', marginBottom: '1.5rem', fontWeight: 600 }}>
                {resetMessage}
              </div>
            )}
            
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
