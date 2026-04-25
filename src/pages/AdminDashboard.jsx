import { TrendingUp, Users, DollarSign, Package, BarChart, AlertCircle, ShoppingBag, CheckCircle, XCircle } from 'lucide-react';
import { useOrders } from '../context/OrderContext';
import { useProducts } from '../context/ProductContext';
import './Admin.css';

export default function AdminDashboard() {
  const { orders } = useOrders();
  const { products } = useProducts();

  // Logic: Revenue only from DELIVERED orders. Cancelled excluded.
  const deliveredOrders = orders.filter(order => order.status === 'Delivered');
  const cancelledOrders = orders.filter(order => order.status === 'Cancelled');
  const totalRevenue = deliveredOrders.reduce((acc, order) => acc + (Number(order.total) || 0), 0);
  
  const activeInventory = products.filter(p => p.in_stock !== false).length;

  const stats = [
    { 
      label: 'Realized Revenue', 
      value: `₹${totalRevenue.toLocaleString()}`, 
      icon: <DollarSign size={20} color="#cd3d7a" />, 
      trend: '+12.5%',
      color: '#fdf2f5'
    },
    { 
      label: 'Delivered', 
      value: deliveredOrders.length, 
      icon: <CheckCircle size={20} color="#25D366" />, 
      trend: '+4.2%',
      color: '#e8f7ed'
    },
    { 
      label: 'Cancelled', 
      value: cancelledOrders.length, 
      icon: <XCircle size={20} color="#df725a" />, 
      trend: 'Warning',
      color: '#fef0f4'
    },
    { 
      label: 'Total Orders', 
      value: orders.length, 
      icon: <ShoppingBag size={20} color="#cd3d7a" />, 
      trend: '+28%',
      color: '#fdf2f5'
    },
    { 
      label: 'Inventory', 
      value: activeInventory, 
      icon: <Package size={20} color="#cd3d7a" />, 
      trend: 'Active',
      color: '#fdf2f5'
    },
  ];

  // Chart data - scaling relative to the busiest day
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dailyCounts = days.map((_, idx) => 
    orders.filter(o => o.status !== 'Cancelled' && new Date(o.date).getDay() === idx).length
  );
  const maxCount = Math.max(...dailyCounts, 1);
  const chartData = days.map((day, idx) => ({
    day,
    count: dailyCounts[idx],
    percent: (dailyCounts[idx] / maxCount) * 100
  }));

  return (
    <div className="admin-view-content" style={{ display: 'block', padding: '2.5rem', overflowY: 'auto' }}>
      <header className="view-header" style={{ marginBottom: '2.5rem' }}>
        <div>
          <h2 style={{ fontFamily: "'Noto Serif', serif", fontSize: '2.2rem', fontWeight: 700, color: '#3f4247' }}>Dashboard Overview</h2>
          <p style={{ color: '#888', marginTop: '0.5rem', fontWeight: 600 }}>Monitor your bakery's performance in real-time.</p>
        </div>
      </header>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        {stats.map((stat, idx) => (
          <div key={idx} style={{ background: 'white', borderRadius: '24px', padding: '1.5rem', border: '1px solid rgba(230, 190, 200, 0.4)', boxShadow: '0 10px 30px rgba(220, 150, 170, 0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {stat.icon}
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: stat.label === 'Cancelled' ? '#df725a' : '#25D366' }}>{stat.trend}</span>
            </div>
            <h3 style={{ fontFamily: "'Noto Serif', serif", fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem', color: '#3f4247' }}>{stat.value}</h3>
            <p style={{ fontSize: '0.9rem', color: '#888', fontWeight: 600 }}>{stat.label}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
        {/* Recent Orders Card */}
        <div style={{ background: 'white', borderRadius: '24px', border: '1px solid rgba(230, 190, 200, 0.4)', padding: '2rem', boxShadow: '0 10px 30px rgba(220, 150, 170, 0.08)' }}>
          <h4 style={{ fontFamily: "'Noto Serif', serif", fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.5rem', color: '#3f4247' }}>Recent Orders</h4>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 12px' }}>
            <thead>
              <tr style={{ textAlign: 'left', fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800 }}>
                <th style={{ paddingBottom: '1rem', borderBottom: '1px solid #f0d5df' }}>Order</th>
                <th style={{ paddingBottom: '1rem', borderBottom: '1px solid #f0d5df' }}>Customer</th>
                <th style={{ paddingBottom: '1rem', borderBottom: '1px solid #f0d5df' }}>Amount</th>
                <th style={{ paddingBottom: '1rem', borderBottom: '1px solid #f0d5df' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map(order => (
                <tr key={order.id}>
                  <td style={{ fontWeight: 700, color: '#3f4247', padding: '1rem 0' }}>#{order.id.slice(-6).toUpperCase()}</td>
                  <td style={{ fontWeight: 600, color: '#666' }}>{order.customer || 'Guest'}</td>
                  <td style={{ fontWeight: 800, color: '#3f4247' }}>₹{Number(order.total).toLocaleString()}</td>
                  <td>
                    <span style={{ 
                      display: 'inline-block',
                      background: order.status === 'Delivered' ? '#e8f7ed' : order.status === 'Cancelled' ? '#fef0f4' : '#fff3cd', 
                      color: order.status === 'Delivered' ? '#25D366' : order.status === 'Cancelled' ? '#df725a' : '#856404',
                      padding: '6px 12px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase'
                    }}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sales Trends Chart */}
        <div style={{ background: 'white', borderRadius: '24px', border: '1px solid rgba(230, 190, 200, 0.4)', padding: '2rem', boxShadow: '0 10px 30px rgba(220, 150, 170, 0.08)' }}>
          <h4 style={{ fontFamily: "'Noto Serif', serif", fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.5rem', color: '#3f4247' }}>Daily Volume</h4>
          <div style={{ display: 'flex', alignItems: 'flex-end', height: '180px', gap: '12px', paddingBottom: '1rem', borderBottom: '1px solid #f0d5df' }}>
            {chartData.map(item => (
              <div key={item.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <div style={{ 
                  height: `${item.percent}%`, width: '100%', 
                  background: 'linear-gradient(to top, #d44d7d, #f8bbd0)', 
                  borderRadius: '12px 12px 0 0', minHeight: '8px' 
                }}></div>
                <span style={{ fontSize: '0.8rem', color: '#888', fontWeight: 700 }}>{item.day}</span>
              </div>
            ))}
          </div>
          <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#888', textAlign: 'center', fontWeight: 600 }}>Total order count per day (excluding cancelled)</p>
        </div>
      </div>
    </div>
  );
}
