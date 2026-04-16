import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Mail, Lock } from 'lucide-react';
import './CustomerAuthModal.css';

export default function CustomerAuthModal({ isOpen, onClose }) {
  const { signIn, signUp, user, signOut, resetPassword } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isResetting) {
        const { error } = await resetPassword(email);
        if (error) throw error;
        setResetSent(true);
      } else if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
        onClose(); // Hide modal on success
      } else {
        const { error } = await signUp(email, password);
        if (error) throw error;
        // Supabase might require email verification depending on settings. 
        // For standard local dev, it logs them straight in if autoconfirm is on.
        onClose(); 
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  return (
    <div className="auth-backdrop" onClick={onClose} style={{zIndex: 1100}}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close" onClick={onClose} aria-label="Close">
          <X size={24} />
        </button>

        {user ? (
          <div className="auth-logged-in text-center p-6">
            <h2 className="auth-title">Welcome Back</h2>
            <p className="auth-subtitle mb-6" style={{marginTop: '0.5rem'}}>{user.email}</p>
            
            <button 
              onClick={handleSignOut}
              className="btn btn-outline" 
              style={{width: '100%', borderColor: '#ba1a1a', color: '#ba1a1a'}}
            >
              Sign Out
            </button>
          </div>
        ) : resetSent ? (
          <div className="auth-content text-center">
            <div style={{width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(37, 211, 102, 0.1)', color: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem'}}>
              <Mail size={32} />
            </div>
            <h2 className="auth-title">Check Your Email</h2>
            <p className="auth-subtitle mb-6">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <button 
              onClick={() => { setResetSent(false); setIsResetting(false); setIsLogin(true); }}
              className="btn btn-primary" 
              style={{width: '100%', padding: '1rem'}}
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <div className="auth-content">
            <h2 className="auth-title">
              {isResetting ? 'Reset Password' : (isLogin ? 'Welcome Back' : 'Join Crumblecakes')}
            </h2>
            <p className="auth-subtitle">
              {isResetting 
                ? "Enter your email to receive a reset link" 
                : (isLogin ? "Sign in to skip the line" : "Create an account for sweet rewards")}
            </p>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <div className="input-with-icon">
                  <Mail size={18} className="input-icon" />
                  <input 
                    type="email" 
                    placeholder="Email Address" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                    className="search-input"
                    style={{width: '100%', paddingLeft: '2.5rem'}}
                  />
                </div>
              </div>
              
              {!isResetting && (
                <div className="form-group" style={{marginTop: '1rem'}}>
                  <div className="input-with-icon">
                    <Lock size={18} className="input-icon" />
                    <input 
                      type="password" 
                      placeholder="Password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required 
                      className="search-input"
                      style={{width: '100%', paddingLeft: '2.5rem'}}
                    />
                  </div>
                  {isLogin && (
                    <div style={{textAlign: 'right', marginTop: '0.5rem'}}>
                      <button 
                        type="button"
                        onClick={() => { setIsResetting(true); setError(''); }}
                        style={{background: 'none', border: 'none', fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: '600', cursor: 'pointer', padding: 0}}
                      >
                        Forgot Password?
                      </button>
                    </div>
                  )}
                </div>
              )}

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{width: '100%', marginTop: '1.5rem', padding: '1rem'}}
                disabled={loading}
              >
                {loading ? 'Processing...' : (isResetting ? 'Send Reset Link' : (isLogin ? 'Sign In' : 'Create Account'))}
              </button>
            </form>

            <div className="auth-toggle" style={{marginTop: '1.5rem', textAlign: 'center'}}>
              {isResetting ? (
                <>
                  Remembered your password?{' '}
                  <button type="button" className="toggle-btn" onClick={() => setIsResetting(false)}>Sign In</button>
                </>
              ) : (
                <>
                  {isLogin ? "New here? " : "Already have an account? "}
                  <button 
                    type="button"
                    className="toggle-btn"
                    onClick={() => setIsLogin(!isLogin)}
                  >
                    {isLogin ? 'Create Account' : 'Sign In'}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
