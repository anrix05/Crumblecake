import { Link, NavLink, Outlet, Navigate } from 'react-router-dom';
import { LayoutDashboard, Cake, ShoppingBag, Settings, LogOut, BarChart, Users, Bell, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Admin.css';

export default function AdminLayout() {
  const { user, isAdmin, loading, signOut } = useAuth();

  if (loading) return <div style={{padding: '5rem', textAlign: 'center', background: '#fdf2f5', height: '100vh'}}>Loading Administration...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="admin-container">
      <div className="admin-layout-wrapper">
        <aside className="admin-sidebar">
          <div className="admin-logo">
            <BarChart className="logo-icon" size={24} />
            <span className="logo-text">Crumblecakes</span>
          </div>
          
          <nav className="admin-nav">
            <NavLink to="/admin" end>
              <LayoutDashboard size={20} />
              Dashboard
            </NavLink>
            <NavLink to="/admin/orders">
              <ShoppingBag size={20} />
              Orders
            </NavLink>
            <NavLink to="/admin/products">
              <Cake size={20} />
              Inventory
            </NavLink>


            <div className="admin-settings-nav-item">
               <NavLink to="/admin/settings">
                <Settings size={20} />
                Settings
              </NavLink>
            </div>
          </nav>

          <div className="admin-logout">
            <button 
              className="logout-btn"
              onClick={async () => {
                await signOut();
                window.location.href = "/";
              }}
            >
              <LogOut size={20} /> Log out
            </button>
          </div>
        </aside>
        
        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
