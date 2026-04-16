import { useState } from 'react';
import { Search, Filter, Trash2, Eye, CheckCircle, Clock, Truck, Palette, X } from 'lucide-react';
import { useOrders } from '../context/OrderContext';
import './Admin.css';

export default function AdminOrders() {
  const { orders, updateOrderStatus, deleteOrder, updateOrderPrice } = useOrders();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [priceInput, setPriceInput] = useState('');
  const [editingPriceId, setEditingPriceId] = useState(null);

  const statuses = ['All', 'Processing', 'Completed', 'Delivered', 'Cancelled'];

  const isCustomOrder = (order) => {
    return Array.isArray(order.items) && order.items.some(i => i.type === 'custom');
  };

  const filteredOrders = orders.filter(o => {
    const customerName = o.customer || 'Guest';
    const matchesSearch = customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          o.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'All' || o.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return <CheckCircle size={16} />;
      case 'Delivered': return <Truck size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return '#10b981';
      case 'Delivered': return '#3b82f6';
      case 'Cancelled': return '#ef4444';
      default: return '#f59e0b';
    }
  };

  const handleSetPrice = async (orderId) => {
    const price = parseFloat(priceInput);
    if (isNaN(price) || price <= 0) {
      alert('Please enter a valid price');
      return;
    }
    await updateOrderPrice(orderId, price);
    setEditingPriceId(null);
    setPriceInput('');
  };

  return (
    <div className="admin-orders">
      <h3 className="section-title">Order Management ({filteredOrders.length})</h3>

      <div className="admin-toolbar" style={{padding: '0 0.5rem', marginBottom: '2rem'}}>
        <div style={{position: 'relative', flex: 1}}>
          <Search size={18} style={{position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-outline)'}} />
          <input 
            type="text" 
            placeholder="Search by ID or customer name..." 
            className="search-input"
            style={{paddingLeft: '3.5rem'}}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div style={{position: 'relative'}}>
          <Filter size={18} style={{position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-outline)'}} />
          <select 
            className="filter-select"
            style={{paddingLeft: '3rem'}}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="panel">
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order Ref</th>
                <th>Placement Date</th>
                <th>Customer</th>
                <th>Inventory Items</th>
                <th>Revenue</th>
                <th>Live Status</th>
                <th style={{textAlign: 'right'}}>Management</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{textAlign: 'center', padding: '5rem', color: 'var(--color-text-light)'}}>
                    No orders found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id}>
                    <td style={{fontWeight: '800', color: 'var(--color-primary)', letterSpacing: '0.05em'}}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                        #{order.id.length > 12 ? order.id.slice(0, 4) + '...' + order.id.slice(-4) : order.id}
                        {isCustomOrder(order) && (
                          <span style={{
                            background: 'linear-gradient(135deg, #8B5CF6, #A855F7)',
                            color: 'white',
                            fontSize: '0.6rem',
                            fontWeight: '800',
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            letterSpacing: '0.08em',
                          }}>CUSTOM</span>
                        )}
                      </div>
                    </td>
                    <td style={{fontSize: '0.9rem', opacity: 0.8}}>
                      {order.date.includes('T') 
                        ? new Date(order.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                        : order.date}
                    </td>
                    <td>
                      <div style={{display: 'flex', flexDirection: 'column'}}>
                        <span style={{fontWeight: '700'}}>{order.customer || 'Guest'}</span>
                        <span style={{fontSize: '0.75rem', color: 'var(--color-text-light)'}}>{order.email}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{fontSize: '0.9rem', fontWeight: '600'}}>
                        {Array.isArray(order.items) ? order.items.length : (order.items || 0)} items
                      </span>
                    </td>
                    <td>
                      {isCustomOrder(order) && Number(order.total) === 0 ? (
                        editingPriceId === order.id ? (
                          <div style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                            <input
                              type="number"
                              placeholder="₹"
                              value={priceInput}
                              onChange={(e) => setPriceInput(e.target.value)}
                              style={{
                                width: '90px',
                                padding: '0.35rem 0.5rem',
                                borderRadius: '8px',
                                border: '1.5px solid #8B5CF6',
                                fontSize: '0.85rem',
                                fontWeight: '700',
                                outline: 'none',
                              }}
                              autoFocus
                              onKeyDown={(e) => e.key === 'Enter' && handleSetPrice(order.id)}
                            />
                            <button 
                              onClick={() => handleSetPrice(order.id)}
                              style={{
                                background: '#8B5CF6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '0.35rem 0.65rem',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                fontWeight: '700',
                              }}
                            >✓</button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setEditingPriceId(order.id); setPriceInput(''); }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: 'rgba(139, 92, 246, 0.1)',
                              color: '#8B5CF6',
                              border: '1.5px solid #8B5CF6',
                              borderRadius: '9999px',
                              padding: '0.4rem 1rem',
                              fontSize: '0.75rem',
                              fontWeight: '800',
                              cursor: 'pointer',
                              letterSpacing: '0.05em',
                            }}
                          >
                            <span style={{fontWeight: '900'}}>₹</span> SET PRICE
                          </button>
                        )
                      ) : (
                        <span style={{fontWeight: '800', fontSize: '1.1rem'}}>₹{Number(order.total).toLocaleString()}</span>
                      )}
                    </td>
                    <td>
                      <select 
                        value={order.status || 'Processing'} 
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '1rem',
                          border: 'none',
                          fontSize: '0.75rem',
                          fontWeight: '800',
                          backgroundColor: getStatusColor(order.status) + '15',
                          color: getStatusColor(order.status),
                          cursor: 'pointer',
                          outline: 'none',
                          textTransform: 'uppercase'
                        }}
                      >
                        {statuses.filter(s => s !== 'All').map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{textAlign: 'right'}}>
                      <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px'}}>
                        <button 
                          className="action-btn edit" 
                          style={{color: 'var(--color-primary)'}}
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          className="action-btn" 
                          style={{color: '#ba1a1a'}}
                          onClick={() => deleteOrder(order.id)}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ marginBottom: '2rem', borderBottom: '1px solid var(--color-outline-variant)', paddingBottom: '1.5rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px', margin: 0 }}>
                Order Specifications
                {isCustomOrder(selectedOrder) && (
                  <span style={{
                    background: 'linear-gradient(135deg, #8B5CF6, #A855F7)',
                    color: 'white',
                    fontSize: '0.65rem',
                    fontWeight: '800',
                    padding: '4px 12px',
                    borderRadius: '9999px',
                    letterSpacing: '0.05em',
                  }}>CUSTOM ORDER</span>
                )}
              </h3>
              <button 
                onClick={() => setSelectedOrder(null)} 
                style={{ 
                  background: 'var(--color-surface-low)', 
                  border: 'none', 
                  cursor: 'pointer', 
                  color: 'var(--color-text-light)', 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="order-details-modal">
              <div className="flex-between" style={{marginBottom: '2rem'}}>
                <div>
                  <p style={{fontSize: '0.75rem', fontWeight: '800', color: 'var(--color-text-light)'}}>ORDER ID</p>
                  <p style={{fontSize: '1.2rem', fontWeight: '800', color: 'var(--color-primary)'}}>#{selectedOrder.id}</p>
                </div>
                <div style={{textAlign: 'right'}}>
                  <p style={{fontSize: '0.75rem', fontWeight: '800', color: 'var(--color-text-light)'}}>TOTAL AMOUNT</p>
                  <p style={{fontSize: '1.2rem', fontWeight: '800'}}>
                    {Number(selectedOrder.total) === 0 ? (
                      <span style={{color: '#EA580C'}}>Price Pending</span>
                    ) : (
                      `₹${Number(selectedOrder.total).toLocaleString()}`
                    )}
                  </p>
                </div>
              </div>

              <div style={{marginBottom: '2rem'}}>
                <p style={{fontSize: '0.75rem', fontWeight: '800', color: 'var(--color-text-light)', marginBottom: '0.5rem'}}>CUSTOMER DETAILS</p>
                <div className="panel" style={{padding: '1.5rem', backgroundColor: 'var(--color-surface-low)'}}>
                  <p style={{fontWeight: '700'}}>{selectedOrder.customer}</p>
                  <p style={{fontSize: '0.9rem', color: 'var(--color-text-light)'}}>{selectedOrder.email}</p>
                  <p style={{fontSize: '0.9rem', marginTop: '0.5rem', whiteSpace: 'pre-line'}}>{selectedOrder.address}</p>
                </div>
              </div>

              <div>
                <p style={{fontSize: '0.75rem', fontWeight: '800', color: 'var(--color-text-light)', marginBottom: '0.5rem'}}>ORDERED ITEMS</p>
                <div className="items-list" style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                  {Array.isArray(selectedOrder.items) ? selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="panel" style={{padding: '1.5rem', backgroundColor: 'var(--color-surface-low)'}}>
                      {item.type === 'custom' ? (
                        <div>
                          <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem'}}>
                            <Palette size={18} color="#8B5CF6" />
                            <p style={{fontWeight: '800', color: '#8B5CF6', letterSpacing: '0.02em'}}>Custom Cake Request</p>
                          </div>
                          {item.image && (
                            <img 
                              src={item.image} 
                              alt="Reference" 
                              style={{
                                width: '100%', 
                                maxHeight: '400px', 
                                objectFit: 'contain', 
                                backgroundColor: 'rgba(0,0,0,0.03)',
                                borderRadius: '12px', 
                                marginBottom: '1rem',
                                border: '1px solid var(--color-outline-variant)'
                              }} 
                            />
                          )}
                          <div style={{backgroundColor: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--color-outline-variant)'}}>
                            <p style={{fontWeight: '800', fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--color-text-dark)'}}>{item.name}</p>
                            <p style={{fontSize: '0.9rem', color: 'var(--color-text-light)', marginBottom: '1rem', lineHeight: '1.5'}}>
                              {item.description}
                            </p>
                            <p style={{fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-primary)', display: 'inline-block', backgroundColor: 'var(--color-primary-light)', padding: '0.3rem 0.8rem', borderRadius: '20px'}}>
                              Size: {item.size}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex-between">
                          <div>
                            <p style={{fontWeight: '800', fontSize: '1.1rem', color: 'var(--color-text-dark)'}}>{item.name}</p>
                            <p style={{fontSize: '0.9rem', color: 'var(--color-text-light)', marginTop: '0.25rem'}}>Qty: {item.quantity}</p>
                          </div>
                          <p style={{fontWeight: '800', fontSize: '1.1rem'}}>₹{(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  )) : (
                    <p style={{fontSize: '0.9rem', color: 'var(--color-text-light)', fontStyle: 'italic'}}>Item breakdown not available for this record.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
