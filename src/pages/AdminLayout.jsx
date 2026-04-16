import { Link, NavLink, Outlet, Navigate } from 'react-router-dom';
import { LayoutDashboard, Cake, ShoppingBag, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Admin.css';

export default function AdminLayout() {
  const { user, isAdmin, loading, signOut } = useAuth();

  if (loading) return <div style={{padding: '5rem', textAlign: 'center'}}>Loading Administration...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <img src="/logo.png" alt="Crumblecakes" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-primary-container)', padding: '2px' }} />
          <span className="logo-text">CRUMBLECAKES</span>
        </div>
        
        <nav className="admin-nav">
          <NavLink to="/admin" end>
            <LayoutDashboard size={20} />
            Dashboard
          </NavLink>
          <NavLink to="/admin/products">
            <Cake size={20} />
            Inventory
          </NavLink>
          <NavLink to="/admin/orders">
            <ShoppingBag size={20} />
            Orders
          </NavLink>
          <NavLink to="/admin/settings">
            <Settings size={20} />
            Settings
          </NavLink>
        </nav>

        <div className="admin-logout">
          <button 
            onClick={async () => {
              await signOut();
              window.location.href = "/";
            }}
            style={{
              background: 'none', border: 'none', width: '100%', 
              display: 'flex', alignItems: 'center', gap: '0.75rem', 
              padding: '0.75rem 1.5rem', color: 'var(--color-outline)', 
              fontWeight: '600', cursor: 'pointer', transition: 'color 0.3s'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = '#ba1a1a'}
            onMouseOut={(e) => e.currentTarget.style.color = 'var(--color-outline)'}
          >
            <LogOut size={20} /> Sign Out & Exit
          </button>
        </div>
      </aside>
      
      <main className="admin-main">
        <header className="admin-header">
          <h2>Welcome back, Admin!</h2>
          <div className="admin-profile">
            <div className="avatar">{user?.email ? user.email.charAt(0).toUpperCase() : 'A'}</div>
          </div>
        </header>
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
