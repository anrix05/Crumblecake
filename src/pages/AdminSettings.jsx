import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Save, Store, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminSettings() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  const [storeInfo, setStoreInfo] = useState({
    name: 'Crumblecakes Bakery',
    email: user?.email || 'chef@crumblecakes.in',
    currency: 'INR (₹)'
  });

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const handleSave = (e) => {
    e.preventDefault();
    alert('Settings saved successfully!');
  };

  return (
    <div className="admin-view-content" style={{ display: 'block', padding: '2.5rem', overflowY: 'auto' }}>
      <header className="view-header" style={{ marginBottom: '2.5rem' }}>
        <div>
          <h2 style={{ fontFamily: "'Noto Serif', serif", fontSize: '2.2rem', fontWeight: 700, color: '#3f4247' }}>Store Settings</h2>
          <p style={{ color: '#888', marginTop: '0.5rem', fontWeight: 600 }}>Manage your bakery profile and security preferences.</p>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
        
        {/* General Settings Panel */}
        <div style={{ background: 'white', borderRadius: '24px', border: '1px solid rgba(230, 190, 200, 0.4)', padding: '2.5rem', boxShadow: '0 10px 30px rgba(220, 150, 170, 0.08)' }}>
          <h4 style={{ fontFamily: "'Noto Serif', serif", fontSize: '1.4rem', fontWeight: 700, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#3f4247' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#fdf2f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cd3d7a' }}>
              <Store size={20} />
            </div>
            Bakery Profile
          </h4>
          
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#888', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Store Name</label>
              <input 
                type="text" 
                value={storeInfo.name}
                onChange={(e) => setStoreInfo({...storeInfo, name: e.target.value})}
                style={{ 
                  width: '100%', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #eab8c8', 
                  background: '#fdfafb', fontSize: '1rem', color: '#3f4247', fontFamily: 'inherit', transition: 'all 0.2s'
                }}
                onFocus={(e) => { e.target.style.borderColor = '#cd3d7a'; e.target.style.boxShadow = '0 0 0 4px rgba(205, 61, 122, 0.1)'; e.target.style.background = 'white'; }}
                onBlur={(e) => { e.target.style.borderColor = '#eab8c8'; e.target.style.boxShadow = 'none'; e.target.style.background = '#fdfafb'; }}
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#888', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Admin Contact</label>
              <input 
                type="email" 
                value={storeInfo.email}
                onChange={(e) => setStoreInfo({...storeInfo, email: e.target.value})}
                disabled
                style={{ 
                  width: '100%', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #f0d5df', 
                  background: '#f9f9f9', fontSize: '1rem', color: '#aaa', fontFamily: 'inherit', cursor: 'not-allowed'
                }}
              />
              <span style={{ fontSize: '0.8rem', color: '#888', fontWeight: 600 }}>Admin email is bound to your Supabase account.</span>
            </div>

            <button type="submit" style={{ 
              marginTop: '1rem', padding: '1rem 2rem', background: 'linear-gradient(135deg, #d44d7d 0%, #c43369 100%)', 
              color: 'white', border: 'none', borderRadius: '50px', fontWeight: 700, fontSize: '0.95rem', fontFamily: 'inherit',
              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              boxShadow: '0 8px 24px rgba(200, 50, 100, 0.2)', transition: 'all 0.2s', width: 'max-content'
            }}
            onMouseEnter={(e) => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 12px 28px rgba(200, 50, 100, 0.3)'; }}
            onMouseLeave={(e) => { e.target.style.transform = 'none'; e.target.style.boxShadow = '0 8px 24px rgba(200, 50, 100, 0.2)'; }}
            >
              <Save size={18} /> SAVE CHANGES
            </button>
          </form>
        </div>

        {/* Security & Account Panel */}
        <div style={{ 
          background: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%)', borderRadius: '24px', 
          border: '1px solid white', padding: '2.5rem', boxShadow: '0 10px 30px rgba(220, 150, 170, 0.15)',
          alignSelf: 'start'
        }}>
          <h4 style={{ fontFamily: "'Noto Serif', serif", fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#c23368' }}>
            <Shield size={24} />
            Authentication & Security
          </h4>
          
          <p style={{ fontSize: '0.95rem', color: '#d44d7d', marginBottom: '2.5rem', lineHeight: '1.6', fontWeight: 600 }}>
            You are currently logged in as <strong style={{ color: '#c23368' }}>{user?.email}</strong>. Logging out will secure your session and require credentials for the next access.
          </p>

          <button 
            onClick={handleLogout}
            style={{
              background: 'white', 
              color: '#cd3d7a', 
              width: '100%', 
              padding: '1.15rem', 
              borderRadius: '50px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '0.5rem', 
              fontWeight: '800',
              fontSize: '0.95rem',
              fontFamily: 'inherit',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(200, 50, 100, 0.1)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 20px rgba(200, 50, 100, 0.15)'; }}
            onMouseLeave={(e) => { e.target.style.transform = 'none'; e.target.style.boxShadow = '0 4px 12px rgba(200, 50, 100, 0.1)'; }}
          >
            <LogOut size={18} /> SECURE LOG OUT
          </button>
        </div>

      </div>
    </div>
  );
}
