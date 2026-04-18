import { useState, useEffect } from 'react';
import { Search, Filter, Trash2, Eye, CheckCircle, Clock, Truck, Palette, X, Phone, Mail, MessageSquare, Download, Trash, ShoppingBag, Cake, Bell, User } from 'lucide-react';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import './Admin.css';

export default function AdminOrders() {
  const { orders, updateOrderStatus, deleteOrder, updateOrderPrice } = useOrders();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('Any status');
  const [sortOrder, setSortOrder] = useState('newest'); 
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [priceInput, setPriceInput] = useState('');
  const [editingPrice, setEditingPrice] = useState(false);

  const statuses = ['Any status', 'Ordered', 'Packed', 'On its way', 'Delivered', 'Cancelled'];

  const filteredOrders = orders
    .filter(o => {
      const customerName = o.customer || 'Guest';
      const matchesSearch = customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            o.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'Any status' || o.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  const getStatusClass = (status) => {
    switch (status) {
      case 'Ordered': return 'tag-paid';
      case 'Packed': return 'tag-processing';
      case 'On its way': return 'tag-delivered';
      case 'Delivered': return 'tag-completed';
      case 'Cancelled': return 'tag-cancelled';
      default: return 'tag-paid';
    }
  };

  const handleSetPrice = async (orderId) => {
    const price = parseFloat(priceInput);
    if (isNaN(price) || price <= 0) return;
    await updateOrderPrice(orderId, price);
    setEditingPrice(false);
    setPriceInput('');
    setSelectedOrder(prev => ({...prev, total: price}));
  };

  const extractPhone = (address) => {
    if (!address) return '';
    const match = address.match(/\d{10}/);
    return match ? match[0] : '';
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this order forever?')) {
      await deleteOrder(id);
      setSelectedOrder(null);
    }
  };

  return (
    <div className={`admin-view-content ${selectedOrder ? 'has-selection' : ''}`}>
      {/* Left List Section */}
      <section className="list-section">
        <header className="view-header">
          <h2>Orders</h2>
          <div className="header-tools">
            <button className="tool-icon-btn"><Bell size={20} /></button>
            <button className="tool-icon-btn"><Search size={20} /></button>
            <div className="profile-pill">
               <img src={`https://ui-avatars.com/api/?name=Admin+Chef&background=bc024d&color=fff`} alt="Admin" />
               <div className="details">
                 <span className="name">Admin Chef</span>
                 <span className="email">chef@crumblecakes.in</span>
               </div>
            </div>
          </div>
        </header>

        <div className="filter-toolbar">
          <div className="filter-left">
            <select 
              className="filter-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <select 
            className="filter-select"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="newest">Sort by Date: Newest</option>
            <option value="oldest">Sort by Date: Oldest</option>
          </select>
        </div>

        <div className="orders-table-wrapper">
          <table className="orders-table">
            <thead>
              <tr>
                <th style={{width: '40px'}}><input type="checkbox" /></th>
                <th>Order</th>
                <th>Customer</th>
                <th style={{width: '180px'}}>Status</th>
                <th>Total</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr 
                  key={order.id} 
                  className={selectedOrder?.id === order.id ? 'selected' : ''}
                  onClick={() => setSelectedOrder(order)}
                >
                  <td><input type="checkbox" checked={selectedOrder?.id === order.id} readOnly /></td>
                  <td style={{fontWeight: 700}}>#{order.id.slice(-6).toUpperCase()}</td>
                  <td>
                    <div className="customer-info">
                      <div className="avatar-mini">
                        {order.customer ? order.customer.charAt(0).toUpperCase() : 'G'}
                      </div>
                      <span style={{fontWeight: 600}}>{order.customer || 'Guest'}</span>
                    </div>
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <select 
                      className={`status-tag ${getStatusClass(order.status)}`}
                      style={{ border: 'none', appearance: 'none', cursor: 'pointer', outline: 'none' }}
                      value={order.status || 'Ordered'}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    >
                      {statuses.filter(s => s !== 'Any status').map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td style={{fontWeight: 700}}>
                    {Number(order.total) === 0 ? '₹ Pending' : `₹${Number(order.total).toLocaleString()}`}
                  </td>
                  <td style={{color: '#7a7a7a'}}>
                    {new Date(order.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Right Details Section */}
      <aside className="details-section">
        {selectedOrder ? (
          <>
            <div className="details-header">
              <h3>Order Details</h3>
              <button 
                className="tool-icon-btn" 
                onClick={() => setSelectedOrder(null)}
                style={{ background: '#f5f5f5', border: 'none' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#bc024d' }}>
                #{selectedOrder.id.slice(-6).toUpperCase()}
              </span>
            </div>

            <div className="status-tag-banner" style={{marginBottom: '2rem'}}>
               <span className={`status-tag ${getStatusClass(selectedOrder.status)}`}>
                 {selectedOrder.status || 'Ordered'}
               </span>
               <span style={{marginLeft: '12px', color: '#7a7a7a', fontSize: '0.85rem', fontWeight: 600}}>
                 {new Date(selectedOrder.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
               </span>
            </div>

            <div className="customer-card-hero">
               <div className="avatar-large">
                 {selectedOrder.customer ? selectedOrder.customer.charAt(0).toUpperCase() : 'G'}
               </div>
               <h4>{selectedOrder.customer || 'Guest'}</h4>
               <p style={{marginBottom: '1rem'}}>{selectedOrder.email}</p>
               
               <div className="contact-icons">
                 <button 
                   className="icon-circle" 
                   title="Send Email"
                   onClick={() => window.location.href = `mailto:${selectedOrder.email}`}
                 >
                   <Mail size={18} />
                 </button>
                 <button 
                   className="icon-circle" 
                   title="Call Customer"
                   onClick={() => {
                     const phone = extractPhone(selectedOrder.address);
                     if (phone) window.location.href = `tel:${phone}`;
                     else alert('No phone number found in address');
                   }}
                 >
                   <Phone size={18} />
                 </button>
                 <button 
                   className="icon-circle" 
                   title="Message on WhatsApp"
                   onClick={() => {
                     const phone = extractPhone(selectedOrder.address);
                     if (phone) window.open(`https://wa.me/91${phone}`, '_blank');
                     else alert('No phone number found in address');
                   }}
                 >
                   <MessageSquare size={18} />
                 </button>
               </div>
            </div>

            <div className="items-list-detail">
              <h5 style={{fontSize: '0.75rem', textTransform: 'uppercase', color: '#7a7a7a', letterSpacing: '0.05em', marginBottom: '1.5rem'}}>Order items</h5>
              {selectedOrder.items?.map((item, idx) => (
                <div key={idx} className="detail-item-row">
                  <div className="item-img-frame">
                    {item.image ? (
                      <img src={item.image} alt={item.name} />
                    ) : (
                      <Cake size={24} color="#bc024d" />
                    )}
                  </div>
                  <div className="item-info-main">
                    <span className="name">{item.name}</span>
                    <span className="qty-price">
                      {item.type === 'custom' ? `Size: ${item.size}` : `₹${item.price} x ${item.quantity}`}
                    </span>
                  </div>
                  {item.type !== 'custom' && (
                    <span className="item-price-final">₹{item.price * item.quantity}</span>
                  )}
                </div>
              ))}
            </div>

            <div className="details-summary">
              <div className="summary-line">
                <span className="label">Total</span>
                <span className="value">
                  {Number(selectedOrder.total) === 0 ? (
                    <span style={{color: '#bc024d'}}>Pending</span>
                  ) : (
                    `₹${Number(selectedOrder.total).toLocaleString()}`
                  )}
                </span>
              </div>

              {Number(selectedOrder.total) === 0 && (
                <div style={{marginBottom: '1.5rem'}}>
                  {editingPrice ? (
                    <div style={{display: 'flex', gap: '8px'}}>
                      <input 
                        type="number" 
                        placeholder="₹" 
                        className="filter-select" 
                        style={{flex: 1}}
                        value={priceInput}
                        onChange={(e) => setPriceInput(e.target.value)}
                      />
                      <button className="btn-action-main btn-black" style={{padding: '0 1rem'}} onClick={() => handleSetPrice(selectedOrder.id)}>✓</button>
                    </div>
                  ) : (
                    <button className="btn-action-main btn-yellow" style={{width: '100%'}} onClick={() => setEditingPrice(true)}>
                      <Palette size={18} /> Set Price
                    </button>
                  )}
                </div>
              )}

              <div style={{marginTop: '2rem'}}>
                <button 
                  className="btn-action-main btn-yellow" 
                  style={{width: '100%', background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca'}}
                  onClick={() => handleDelete(selectedOrder.id)}
                >
                  <Trash size={18} /> Delete This Order
                </button>
              </div>
            </div>
          </>
        ) : (
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8'}}>
            <ShoppingBag size={48} style={{opacity: 0.2, marginBottom: '1rem'}} />
            <p>Select an order to view details</p>
          </div>
        )}
      </aside>
    </div>
  );
}
