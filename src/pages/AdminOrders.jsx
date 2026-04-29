import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const orderIdParam = searchParams.get('orderId');
  const selectedOrder = orders.find(o => o.id === orderIdParam) || null;

  const setSelectedOrder = (order) => {
    if (order) {
      setSearchParams({ orderId: order.id });
    } else {
      searchParams.delete('orderId');
      setSearchParams(searchParams);
    }
  };
  const [priceInput, setPriceInput] = useState('');
  const [editingPrice, setEditingPrice] = useState(false);

  const statuses = ['Any status', 'Ordered', 'Accepted', 'Packed', 'On its way', 'Delivered', 'Cancelled'];

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
      case 'Accepted': return 'tag-paid';
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
  };

  const extractPhone = (address) => {
    if (!address) return '';
    const match = address.match(/\d{10}/);
    return match ? match[0] : '';
  };

  const extractDeliveryDetails = (address) => {
    if (!address) return { date: '', slot: '' };
    const dateMatch = address.match(/\[Delivery:\s*([^|\]]+)/);
    const slotMatch = address.match(/\|\s*Slot:\s*([^|\]]+)/);
    return {
      date: dateMatch ? dateMatch[1].trim() : '',
      slot: slotMatch ? slotMatch[1].trim() : ''
    };
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
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{fontWeight: 600}}>{order.customer || 'Guest'}</span>
                        {extractDeliveryDetails(order.address).date && (
                          <span style={{fontSize: '0.75rem', color: '#bc024d', fontWeight: 600}}>
                            {extractDeliveryDetails(order.address).date} ({extractDeliveryDetails(order.address).slot})
                          </span>
                        )}
                      </div>
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
                     const phone = selectedOrder.phone || extractPhone(selectedOrder.address);
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
                     const phone = selectedOrder.phone || extractPhone(selectedOrder.address);
                     if (phone) window.open(`https://wa.me/91${phone}`, '_blank');
                     else alert('No phone number found in address');
                   }}
                 >
                   <MessageSquare size={18} />
                 </button>
               </div>
            </div>

            {(() => {
              const deliveryDetails = extractDeliveryDetails(selectedOrder.address);
              return deliveryDetails.date ? (
                <div style={{ background: '#fdf2f5', border: '1px solid #eab8c8', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#7a7a7a', textTransform: 'uppercase', fontWeight: 700 }}>Chosen Delivery Schedule</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#3f4247' }}>Date: {deliveryDetails.date}</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#cd3d7a' }}>Slot: {deliveryDetails.slot}</span>
                </div>
              ) : null;
            })()}

            <div className="items-list-detail">
              <h5 style={{fontSize: '0.75rem', textTransform: 'uppercase', color: '#7a7a7a', letterSpacing: '0.05em', marginBottom: '1.5rem'}}>Order items</h5>
              {selectedOrder.items?.map((item, idx) => (
                <div key={idx} className="detail-item-row" style={{flexDirection: 'column', alignItems: 'stretch', gap: '1.5rem', padding: '2rem 0'}}>
                  <div style={{display: 'flex', gap: '2rem', width: '100%', alignItems: 'flex-start'}}>
                    {item.type === 'custom' && item.image ? (
                      <div style={{width: '240px', height: '240px', borderRadius: '16px', overflow: 'hidden', border: '1px solid #eab8c8', flexShrink: 0, background: '#fffafb'}}>
                        <a href={item.image} target="_blank" rel="noreferrer" title="Click to view full image">
                          <img src={item.image} alt={item.name} style={{width: '100%', height: '100%', display: 'block', objectFit: 'cover'}} />
                        </a>
                      </div>
                    ) : (
                      <div className="item-img-frame" style={{width: '160px', height: '160px', flexShrink: 0, borderRadius: '16px'}}>
                        {item.image ? (
                          <img src={item.image} alt={item.name} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                        ) : (
                          <Cake size={40} color="#bc024d" />
                        )}
                      </div>
                    )}
                    <div className="item-info-main" style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingTop: '0.5rem'}}>
                      <span className="name" style={{fontSize: '1.6rem', fontWeight: 800, margin: 0}}>{item.name}</span>
                      <span className="qty-price" style={{fontSize: '1.1rem', color: '#64748b', fontWeight: 600}}>
                        {item.type === 'custom' ? `Size: ${item.size}` : `₹${item.price} x ${item.quantity}`}
                      </span>
                    </div>
                    {item.type !== 'custom' && (
                      <span className="item-price-final" style={{fontSize: '1.8rem', fontWeight: 800, marginLeft: 'auto', paddingTop: '0.5rem', color: '#1e293b'}}>₹{item.price * item.quantity}</span>
                    )}
                  </div>
                  
                  {item.type === 'custom' && item.details && (
                    <div style={{background: '#fffafb', padding: '1.5rem 2rem', borderRadius: '16px', border: '1px solid #fce7f3'}}>
                      <h6 style={{margin: '0 0 1rem', color: '#bc024d', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Custom Details</h6>
                      <ul style={{listStyle: 'none', padding: 0, margin: 0, fontSize: '1.05rem', color: '#4b5563', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                        <li style={{gridColumn: '1 / -1'}}><strong>Description:</strong> {item.description}</li>
                        <li><strong>Flavor:</strong> {item.details.flavor}</li>
                        <li><strong>Shape:</strong> {item.details.shape}</li>
                        <li><strong>Type:</strong> {item.details.isEggless ? 'Eggless' : 'With Egg'}</li>
                        <li><strong>Budget:</strong> {item.details.budget || 'Not specified'}</li>
                        {item.details.message && <li style={{gridColumn: '1 / -1'}}><strong>Message:</strong> {item.details.message}</li>}
                      </ul>
                    </div>
                  )}
                  {item.type !== 'custom' && item.variant_details && (
                    <div style={{background: '#f8fafc', padding: '1.5rem 2rem', borderRadius: '16px', border: '1px solid #e2e8f0'}}>
                      <h6 style={{margin: '0 0 1rem', color: '#475569', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Selected Options</h6>
                      <ul style={{listStyle: 'none', padding: 0, margin: 0, fontSize: '1.05rem', color: '#334155', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                        {item.variant_details.weight && <li><strong>Weight:</strong> {item.variant_details.weight}</li>}
                        {item.variant_details.is_eggless !== undefined && <li><strong>Type:</strong> {item.variant_details.is_eggless ? 'Eggless' : 'With Egg'}</li>}
                        {item.variant_details.combos && item.variant_details.combos.length > 0 && <li><strong>Combos:</strong> {item.variant_details.combos.join(', ')}</li>}
                        {item.variant_details.message && <li style={{gridColumn: '1 / -1'}}><strong>Message on Cake:</strong> {item.variant_details.message}</li>}
                      </ul>
                    </div>
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
