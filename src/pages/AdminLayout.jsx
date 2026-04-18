import { Link, NavLink, Outlet, Navigate } from 'react-router-dom';
import { LayoutDashboard, Cake, ShoppingBag, Settings, LogOut, BarChart, Users, Bell, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Admin.css';

export default function AdminLayout() {
  const { user, isAdmin, loading, signOut } = useAuth();

  if (loading) return <div style={{padding: '5rem', textAlign: 'center', background: '#f7f6f2', height: '100vh'}}>Loading Administration...</div>;
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
            
            <NavLink to="/admin/payments" onClick={e => e.preventDefault()}>
              <ShoppingBag size={20} />
              Payments
            </NavLink>
            <NavLink to="/admin/customers" onClick={e => e.preventDefault()}>
              <Users size={20} />
              Customers
            </NavLink>
            <NavLink to="/admin/reports" onClick={e => e.preventDefault()}>
              <Cake size={20} />
              Reports
            </NavLink>
            <NavLink to="/admin/statistics" onClick={e => e.preventDefault()}>
              <BarChart size={20} />
              Statistics
            </NavLink>

            <div style={{marginTop: 'auto', paddingTop: '2rem'}}>
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
