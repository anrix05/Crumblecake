import { TrendingUp, Users, DollarSign, Package, BarChart3 } from 'lucide-react';
import { useOrders } from '../context/OrderContext';
import { useProducts } from '../context/ProductContext';

export default function AdminDashboard() {
  const { orders } = useOrders();
  const { products } = useProducts();

  const deliveredOrders = orders.filter(order => order.status === 'Delivered');
  const totalRevenue = deliveredOrders.reduce((acc, order) => acc + order.total, 0);

  // Generate real weekly sales data
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push({
        full: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        short: d.toLocaleDateString('en-GB', { weekday: 'short' }),
        revenue: 0
      });
    }
    return days;
  };

  const weeklySales = getLast7Days().map(day => {
    const dayTotal = orders
      .filter(o => {
        const orderDay = o.date.includes('T') 
          ? new Date(o.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
          : o.date;
        return orderDay === day.full && o.status !== 'Cancelled';
      })
      .reduce((sum, o) => sum + o.total, 0);
    return { day: day.short, val: dayTotal, raw: dayTotal };
  });

  const maxSales = Math.max(...weeklySales.map(s => s.val), 100);
  const chartData = weeklySales.map(s => ({
    ...s,
    percent: (s.val / maxSales) * 100
  }));

  const stats = [
    { label: 'Realized Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: <DollarSign size={28} />, color: 'var(--color-primary)', bg: 'linear-gradient(135deg, rgba(185, 10, 90, 0.15), rgba(185, 10, 90, 0.02))', shadow: 'rgba(185, 10, 90, 0.15)', trend: '+12.5%', trendUp: true },
    { label: 'Delivered', value: deliveredOrders.length.toString(), icon: <Package size={28} />, color: '#10b981', bg: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.02))', shadow: 'rgba(16, 185, 129, 0.15)', trend: '+4.2%', trendUp: true },
    { label: 'Inventory', value: products.length.toString(), icon: <Users size={28} />, color: '#3b82f6', bg: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.02))', shadow: 'rgba(59, 130, 246, 0.15)', trend: 'Active', trendUp: true },
    { label: 'Total Orders', value: orders.length.toString(), icon: <TrendingUp size={28} />, color: '#f59e0b', bg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.02))', shadow: 'rgba(245, 158, 11, 0.15)', trend: '+28%', trendUp: true },
  ];

  return (
    <div className="admin-dashboard">
      <h3 className="section-title">Overview</h3>
      
      <div className="stats-grid">
        {stats.map(stat => (
          <div className="stat-card" key={stat.label}>
            <div className="flex-between" style={{ alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <div className="stat-icon" style={{
                color: stat.color, 
                background: stat.bg, 
                borderColor: stat.color + '30',
                boxShadow: `0 8px 24px ${stat.shadow}`,
                width: '64px',
                height: '64px',
                borderRadius: '16px'
              }}>
                {stat.icon}
              </div>
              <span style={{ 
                fontSize: '0.75rem', 
                fontWeight: '800', 
                backgroundColor: stat.trendUp ? 'rgba(16, 185, 129, 0.1)' : 'rgba(186, 26, 26, 0.1)', 
                color: stat.trendUp ? '#10b981' : '#ba1a1a', 
                padding: '0.35rem 0.75rem', 
                borderRadius: '20px' 
              }}>
                {stat.trend}
              </span>
            </div>
            <div className="stat-details" style={{ marginTop: '1rem' }}>
              <span className="stat-value" style={{ fontSize: '2.5rem', lineHeight: '1', letterSpacing: '-0.02em' }}>{stat.value}</span>
              <span className="stat-label" style={{ opacity: 0.8, marginTop: '0.25rem' }}>{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-layout" style={{display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '3rem'}}>
        <div className="recent-orders panel">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
            <h4 style={{fontSize: '1.25rem', fontWeight: '800'}}>Recent Orders</h4>
            <button className="btn-text" style={{color: 'var(--color-primary)', fontWeight: '700', fontSize: '0.85rem', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', textDecorationColor: 'transparent', transition: 'all 0.2s'}}>View All</button>
          </div>
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{textAlign: 'center', padding: '4rem', color: 'var(--color-text-light)'}}>No orders yet.</td>
                  </tr>
                ) : (
                  orders.slice(0, 5).map(order => (
                    <tr key={order.id}>
                      <td style={{fontWeight: '700', color: 'var(--color-text-dark)'}}>#{order.id.slice(0, 6)}</td>
                      <td style={{fontWeight: '600', color: 'var(--color-text-light)'}}>{order.customer || 'Guest'}</td>
                      <td style={{fontWeight: '800', color: 'var(--color-text-dark)'}}>₹{order.total.toFixed(2)}</td>
                      <td>
                        <span style={{
                          padding: '0.4rem 0.85rem',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: '800',
                          backgroundColor: order.status === 'Delivered' ? 'rgba(16, 185, 129, 0.1)' : order.status === 'Cancelled' ? 'rgba(186, 26, 26, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                          color: order.status === 'Delivered' ? '#10b981' : order.status === 'Cancelled' ? '#ba1a1a' : '#f59e0b',
                          display: 'inline-block'
                        }}>
                          {order.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="sales-trends panel">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
            <h4 style={{fontSize: '1.25rem', fontWeight: '800'}}>Sales Trends</h4>
            <div style={{background: 'var(--color-surface-low)', padding: '0.5rem', borderRadius: '12px', color: 'var(--color-primary)'}}>
              <BarChart3 size={20} />
            </div>
          </div>
          <div className="chart-container" style={{display: 'flex', alignItems: 'flex-end', height: '180px', gap: '8px', borderBottom: '1px solid var(--color-outline-variant)', marginTop: '2.5rem', padding: '0 0.5rem'}}>
            {chartData.map(item => (
              <div className="chart-bar-wrapper" key={item.day} style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', position: 'relative'}}>
                {item.raw > 0 && (
                  <span className="bar-value" style={{position: 'absolute', top: '-25px', fontSize: '0.65rem', fontWeight: '800', color: 'var(--color-primary)'}}>
                    ₹{item.raw > 1000 ? (item.raw/1000).toFixed(1)+'k' : item.raw}
                  </span>
                )}
                <div 
                  className="chart-bar" 
                  title={`₹${item.raw}`}
                  style={{ 
                    height: `${Math.max(item.percent, 8)}%`, 
                    width: '100%', 
                    background: item.raw > 0 
                      ? 'linear-gradient(to top, var(--color-primary), #ff6b9d)' 
                      : 'rgba(0,0,0,0.03)',
                    borderRadius: '6px 6px 0 0',
                    transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    cursor: 'pointer',
                    boxShadow: item.raw > 0 ? '0 4px 12px rgba(185, 10, 90, 0.2)' : 'none'
                  }}
                ></div>
                <span className="bar-label" style={{fontSize: '0.75rem', fontWeight: item.raw > 0 ? '800' : '600', color: item.raw > 0 ? 'var(--color-text-dark)' : 'var(--color-text-light)', marginTop: '4px'}}>{item.day}</span>
              </div>
            ))}
          </div>
          <p style={{fontSize: '0.85rem', color: 'var(--color-text-light)', marginTop: '2rem', textAlign: 'center', fontWeight: '500'}}>
            Daily baker's performance index for the current week.
          </p>
        </div>
      </div>
    </div>
  );
}
