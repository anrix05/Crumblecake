import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Save, Store, Shield, Eye, EyeOff, Package, Palette } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AdminSettings() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  const [storeInfo, setStoreInfo] = useState({
    name: 'Crumblecakes Bakery',
    email: user?.email || 'chef@crumblecakes.in'
  });
  const [newEmail, setNewEmail] = useState(user?.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isCleaning, setIsCleaning] = useState(false);

  const fixTypos = async () => {
    if (!window.confirm("This will scan all products and permanently fix common spelling errors (e.g., 'Choclate', 'Vanila', 'Pineaple') in your database. Proceed?")) return;
    
    setIsCleaning(true);
    const typosMap = {
      'Choclate': 'Chocolate',
      'Vanila': 'Vanilla',
      'Pineaple': 'Pineapple',
      'Strowberry': 'Strawberry',
      'Eggles': 'Eggless',
      'Chocoalte': 'Chocolate',
      'Strawbery': 'Strawberry'
    };

    try {
      const { data: products, error } = await supabase.from('products').select('*');
      if (error) throw error;

      let fixCount = 0;
      for (const product of products) {
        let newName = product.name;
        let newDesc = product.description || '';
        let newCat = product.category || '';

        let changed = false;
        Object.entries(typosMap).forEach(([typo, correct]) => {
          const regex = new RegExp(typo, 'gi');
          if (newName.match(regex)) { newName = newName.replace(regex, correct); changed = true; }
          if (newDesc.match(regex)) { newDesc = newDesc.replace(regex, correct); changed = true; }
          if (newCat.match(regex)) { newCat = newCat.replace(regex, correct); changed = true; }
        });

        if (changed) {
          const { error: updateError } = await supabase.from('products').update({
            name: newName,
            description: newDesc,
            category: newCat
          }).eq('id', product.id);
          if (!updateError) fixCount++;
        }
      }
      alert(`Success! Fixed typos in ${fixCount} products.`);
      window.location.reload();
    } catch (err) {
      alert("Error during cleanup: " + err.message);
    } finally {
      setIsCleaning(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const updates = {};
      if (newEmail && newEmail !== user?.email) {
        updates.email = newEmail;
      }
      if (newPassword) {
        if (newPassword !== confirmPassword) {
          setErrorMsg('New passwords do not match!');
          return;
        }
        updates.password = newPassword;
      }

      if (Object.keys(updates).length > 0) {
        if (user?.id === 'admin-mock-id') {
          if (updates.password) {
            localStorage.setItem('admin_bypass_password', updates.password);
            setSuccessMsg('Admin login password updated successfully! Use your new password for your subsequent logins.');
            setNewPassword('');
            setConfirmPassword('');
          }
          if (updates.email) {
            setErrorMsg('Bypass login email must remain chef@crumblecakes.in');
          }
          return;
        }
        const { error } = await supabase.auth.updateUser(updates);
        if (error) {
          setErrorMsg(error.message);
        } else {
          setSuccessMsg('Security updates applied! If you changed the email address, please check your old and new addresses for verification prompts.');
          setNewPassword('');
        }
      } else {
        alert('Bakery profile updated!');
      }
    } catch (err) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    }
  };

  return (
    <div className="admin-view-content admin-scrollable-view">
      <header className="view-header" style={{ marginBottom: '2.5rem' }}>
        <div>
          <h2 style={{ fontFamily: "'Noto Serif', serif", fontSize: '2.2rem', fontWeight: 700, color: '#3f4247' }}>Store Settings</h2>
          <p style={{ color: '#888', marginTop: '0.5rem', fontWeight: 600 }}>Manage your bakery profile and security preferences.</p>
        </div>
      </header>

      <div className="settings-layout-grid">
        
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
              <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#888', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Admin Email</label>
              <input 
                type="email" 
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                style={{ 
                  width: '100%', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #eab8c8', 
                  background: '#fdfafb', fontSize: '1rem', color: '#3f4247', fontFamily: 'inherit', transition: 'all 0.2s'
                }}
                onFocus={(e) => { e.target.style.borderColor = '#cd3d7a'; e.target.style.boxShadow = '0 0 0 4px rgba(205, 61, 122, 0.1)'; e.target.style.background = 'white'; }}
                onBlur={(e) => { e.target.style.borderColor = '#eab8c8'; e.target.style.boxShadow = 'none'; e.target.style.background = '#fdfafb'; }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#888', letterSpacing: '0.05em', textTransform: 'uppercase' }}>New Password</label>
                <button 
                  type="button" 
                  onClick={() => setShowPasswords(!showPasswords)} 
                  style={{ background: 'none', border: 'none', color: '#cd3d7a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', fontWeight: 600 }}
                >
                  {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
                  {showPasswords ? 'Hide' : 'Show'}
                </button>
              </div>
              <input 
                type={showPasswords ? 'text' : 'password'} 
                placeholder="Leave blank to keep current password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{ 
                  width: '100%', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #eab8c8', 
                  background: '#fdfafb', fontSize: '1rem', color: '#3f4247', fontFamily: 'inherit', transition: 'all 0.2s'
                }}
                onFocus={(e) => { e.target.style.borderColor = '#cd3d7a'; e.target.style.boxShadow = '0 0 0 4px rgba(205, 61, 122, 0.1)'; e.target.style.background = 'white'; }}
                onBlur={(e) => { e.target.style.borderColor = '#eab8c8'; e.target.style.boxShadow = 'none'; e.target.style.background = '#fdfafb'; }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#888', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Confirm New Password</label>
              <input 
                type={showPasswords ? 'text' : 'password'} 
                placeholder="Retype your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ 
                  width: '100%', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #eab8c8', 
                  background: '#fdfafb', fontSize: '1rem', color: '#3f4247', fontFamily: 'inherit', transition: 'all 0.2s'
                }}
                onFocus={(e) => { e.target.style.borderColor = '#cd3d7a'; e.target.style.boxShadow = '0 0 0 4px rgba(205, 61, 122, 0.1)'; e.target.style.background = 'white'; }}
                onBlur={(e) => { e.target.style.borderColor = '#eab8c8'; e.target.style.boxShadow = 'none'; e.target.style.background = '#fdfafb'; }}
              />
            </div>

            {errorMsg && (
              <div style={{ padding: '1rem', background: '#fff1f2', border: '1px solid #fecdd3', color: '#e11d48', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 600 }}>
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div style={{ padding: '1rem', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 600 }}>
                {successMsg}
              </div>
            )}

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

          {/* Maintenance Tools */}
          <div style={{ 
            background: '#fff', borderRadius: '24px', 
            border: '1px solid #e2e8f0', padding: '2.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
            marginTop: '2rem'
          }}>
            <h4 style={{ fontFamily: "'Noto Serif', serif", fontSize: '1.4rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#334155' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                <Package size={20} />
              </div>
              System Tools
            </h4>
            <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              Use these tools to keep your product database clean and accurate.
            </p>

            <button 
              disabled={isCleaning}
              onClick={fixTypos}
              style={{
                background: '#f8fafc', 
                color: '#334155', 
                width: '100%', 
                padding: '1rem', 
                borderRadius: '12px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '0.75rem', 
                fontWeight: '700',
                fontSize: '0.9rem',
                border: '1px solid #e2e8f0',
                cursor: isCleaning ? 'not-allowed' : 'pointer',
                opacity: isCleaning ? 0.6 : 1,
                transition: 'all 0.2s'
              }}
            >
              {isCleaning ? 'Cleaning Up...' : <><Palette size={18} /> Fix Spelling Errors in Database</>}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
