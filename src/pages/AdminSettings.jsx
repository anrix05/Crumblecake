import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Save, Store, Mail } from 'lucide-react';
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
    <div className="admin-dashboard">
      <div className="flex-between" style={{marginBottom: '2rem'}}>
        <h3 className="section-title">Store Settings</h3>
      </div>

      <div className="dashboard-layout" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem'}}>
        
        {/* General Settings Panel */}
        <div className="panel">
          <h4 style={{marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            <Store size={20} color="var(--color-primary)" /> Bakery Profile
          </h4>
          
          <form className="admin-form" onSubmit={handleSave}>
            <div className="form-group">
              <label>STORE NAME</label>
              <input 
                type="text" 
                value={storeInfo.name}
                onChange={(e) => setStoreInfo({...storeInfo, name: e.target.value})}
                className="search-input"
                style={{width: '100%', marginTop: '0.5rem'}}
              />
            </div>
            
            <div className="form-group">
              <label>ADMIN CONTACT</label>
              <input 
                type="email" 
                value={storeInfo.email}
                onChange={(e) => setStoreInfo({...storeInfo, email: e.target.value})}
                className="search-input"
                style={{width: '100%', marginTop: '0.5rem'}}
                disabled
              />
              <span style={{fontSize: '0.75rem', color: 'var(--color-text-light)', marginTop: '0.25rem'}}>Admin email is bound to your Supabase account.</span>
            </div>

            <button type="submit" className="btn btn-primary" style={{marginTop: '1rem', padding: '1rem 2rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem'}}>
              <Save size={18} /> SAVE CHANGES
            </button>
          </form>
        </div>

        {/* Security & Account Panel */}
        <div className="panel" style={{alignSelf: 'start', backgroundColor: '#fff5f5', border: '1px solid #ffeexx'}}>
          <h4 style={{marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ba1a1a'}}>
            Authentication & Security
          </h4>
          
          <p style={{fontSize: '0.9rem', color: 'var(--color-text-light)', marginBottom: '1.5rem', lineHeight: '1.6'}}>
            You are currently logged in as <strong>{user?.email}</strong>. Logging out will secure your session and require credentials for the next access.
          </p>

          <button 
            onClick={handleLogout}
            className="btn" 
            style={{
              backgroundColor: '#ba1a1a', 
              color: 'white', 
              width: '100%', 
              padding: '1.25rem', 
              borderRadius: 'var(--radius-md)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '0.5rem', 
              fontWeight: '700',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <LogOut size={20} /> SECURE LOG OUT
          </button>
        </div>

      </div>
    </div>
  );
}
