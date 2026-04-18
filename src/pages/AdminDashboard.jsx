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
      icon: <DollarSign size={20} color="#bc024d" />, 
      trend: '+12.5%',
      color: 'rgba(188, 2, 77, 0.1)'
    },
    { 
      label: 'Delivered', 
      value: deliveredOrders.length, 
      icon: <CheckCircle size={20} color="#16a34a" />, 
      trend: '+4.2%',
      color: 'rgba(22, 163, 74, 0.1)'
    },
    { 
      label: 'Cancelled', 
      value: cancelledOrders.length, 
      icon: <XCircle size={20} color="#dc2626" />, 
      trend: 'Warning',
      color: 'rgba(220, 38, 38, 0.1)'
    },
    { 
      label: 'Total Orders', 
      value: orders.length, 
      icon: <ShoppingBag size={20} color="#ca8a04" />, 
      trend: '+28%',
      color: 'rgba(202, 138, 4, 0.1)'
    },
    { 
      label: 'Inventory', 
      value: activeInventory, 
      icon: <Package size={20} color="#2563eb" />, 
      trend: 'Active',
      color: 'rgba(37, 99, 235, 0.1)'
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
          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#1a1a1a' }}>Dashboard Overview</h2>
          <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Monitor your bakery's performance in real-time.</p>
        </div>
      </header>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        {stats.map((stat, idx) => (
          <div key={idx} style={{ background: 'white', borderRadius: '24px', padding: '1.5rem', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {stat.icon}
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: stat.label === 'Cancelled' ? '#dc2626' : '#16a34a' }}>{stat.trend}</span>
            </div>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '0.25rem' }}>{stat.value}</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>{stat.label}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
        {/* Recent Orders Card */}
        <div style={{ background: 'white', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.05)', padding: '1.5rem' }}>
          <h4 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem' }}>Recent Orders</h4>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 12px' }}>
            <thead>
              <tr style={{ textAlign: 'left', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ paddingBottom: '1rem' }}>Order</th>
                <th style={{ paddingBottom: '1rem' }}>Customer</th>
                <th style={{ paddingBottom: '1rem' }}>Amount</th>
                <th style={{ paddingBottom: '1rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map(order => (
                <tr key={order.id}>
                  <td style={{ fontWeight: 700 }}>#{order.id.slice(-6).toUpperCase()}</td>
                  <td style={{ fontWeight: 600 }}>{order.customer || 'Guest'}</td>
                  <td style={{ fontWeight: 700 }}>₹{Number(order.total).toLocaleString()}</td>
                  <td>
                    <span style={{ 
                      display: 'inline-block',
                      background: order.status === 'Delivered' ? '#dcfce7' : order.status === 'Cancelled' ? '#fee2e2' : '#fef9c3', 
                      color: order.status === 'Delivered' ? '#166534' : order.status === 'Cancelled' ? '#991b1b' : '#854d0e',
                      padding: '4px 10px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 700
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
        <div style={{ background: 'white', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.05)', padding: '1.5rem' }}>
          <h4 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem' }}>Daily Volume</h4>
          <div style={{ display: 'flex', alignItems: 'flex-end', height: '180px', gap: '8px', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
            {chartData.map(item => (
              <div key={item.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{ 
                  height: `${item.percent}%`, width: '100%', 
                  background: 'linear-gradient(to top, #bc024d, #ff6b9d)', 
                  borderRadius: '6px 6px 0 0', minHeight: '4px' 
                }}></div>
                <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>{item.day}</span>
              </div>
            ))}
          </div>
          <p style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center' }}>Total order count per day (excluding cancelled)</p>
        </div>
      </div>
    </div>
  );
}
