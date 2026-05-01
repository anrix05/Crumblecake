import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, Trash2, Eye, CheckCircle, Clock, Truck, Palette, X, Phone, Mail, MessageSquare, Download, Trash, ShoppingBag, Cake, Bell, User } from 'lucide-react';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductContext';
import { supabase } from '../lib/supabase';
import './Admin.css';

export default function AdminOrders() {
  const { orders, updateOrderStatus, deleteOrder, updateOrderPrice } = useOrders();
  const { user } = useAuth();
  const { products } = useProducts();

  const getExpandedItems = (orderItems) => {
    if (!orderItems) return [];
    let expanded = [];

    orderItems.forEach((item) => {
      let totalComboPrice = 0;
      let comboItemsToPush = [];

      if (item.variant_details && item.variant_details.combos && Array.isArray(item.variant_details.combos)) {
        item.variant_details.combos.forEach(comboName => {
          const comboProduct = products?.find(p => p.name.toLowerCase() === comboName.toLowerCase());
          const comboPrice = comboProduct?.price || 0;
          const comboImage = comboProduct?.image || '';

          totalComboPrice += comboPrice;

          comboItemsToPush.push({
            name: comboName,
            price: comboPrice,
            image: comboImage,
            quantity: item.quantity,
            isCombo: true,
            type: 'combo'
          });
        });
      }

      const basePrice = item.type !== 'custom' ? Math.max(0, item.price - totalComboPrice) : item.price;

      expanded.push({
        ...item,
        price: basePrice,
        isCombo: false
      });

      expanded = [...expanded, ...comboItemsToPush];
    });

    return expanded;
  };
  const isCakeProduct = (item) => {
    if (item.type === 'custom') return true;
    if (item.type === 'combo' || item.isCombo) return false;
    
    const cleanName = item.name.split(' (')[0].trim().toLowerCase();
    const productObj = products?.find(p => 
      p.id === item.base_product_id || 
      p.id === item.id || 
      p.name.toLowerCase() === cleanName
    );

    if (productObj) {
      const nonCakeCategories = ['Combos & Gifts', 'Add-on'];
      return !nonCakeCategories.includes(productObj.category);
    }

    const nonCakeKeywords = ['bouquet', 'candle', 'balloon', 'chocolate box', 'teddy'];
    return !nonCakeKeywords.some(keyword => cleanName.includes(keyword));
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('Any status');
  const [sortOrder, setSortOrder] = useState('newest');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [checkedOrderIds, setCheckedOrderIds] = useState([]);
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

  const statuses = ['Any status', 'Ordered', 'Baking', 'Packing', 'Out for Delivery', 'Delivered', 'Cancelled'];

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
      case 'Baking': return 'tag-baking';
      case 'Packing': return 'tag-packing';
      case 'Out for Delivery': return 'tag-out-for-delivery';
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

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to permanently delete ${checkedOrderIds.length} orders from Supabase?`)) {
      const { error } = await supabase.from('orders').delete().in('id', checkedOrderIds);
      if (error) {
        alert("Error deleting orders: " + error.message);
      } else {
        alert("Successfully deleted orders!");
        setCheckedOrderIds([]);
        if (selectedOrder && checkedOrderIds.includes(selectedOrder.id)) {
          setSelectedOrder(null);
        }
      }
    }
  };

  const notifications = orders
    .filter(o => o.status === 'Ordered' || !o.status)
    .map(o => {
      const deliveryDetails = extractDeliveryDetails(o.address);
      return {
        id: o.id,
        text: `New order #${o.id.slice(-6).toUpperCase()} from ${o.customer || 'Guest'}`,
        date: deliveryDetails.date || new Date(o.date).toLocaleDateString(),
        order: o
      };
    });

  return (
    <div className={`admin-view-content ${selectedOrder ? 'has-selection' : ''}`}>
      {/* Left List Section */}
      <section className="list-section">
        <header className="view-header">
          <h2>Orders</h2>
          <div className="header-tools" style={{ position: 'relative' }}>
            {isSearchOpen && (
              <input 
                type="text" 
                placeholder="Search orders..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: '0.4rem 0.8rem',
                  borderRadius: '20px',
                  border: '1px solid #eab8c8',
                  fontSize: '0.9rem',
                  outline: 'none',
                  width: '180px',
                  background: '#fff'
                }}
                autoFocus
              />
            )}
            
            <button className="tool-icon-btn" onClick={() => { setIsNotifOpen(!isNotifOpen); setIsSearchOpen(false); }} style={{ position: 'relative' }}>
              <Bell size={20} />
              {notifications.length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  background: '#bc024d',
                  color: 'white',
                  fontSize: '0.65rem',
                  padding: '2px 6px',
                  borderRadius: '50%',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '16px',
                  height: '16px'
                }}>
                  {notifications.length}
                </span>
              )}
            </button>

            <button className="tool-icon-btn" onClick={() => { setIsSearchOpen(!isSearchOpen); setIsNotifOpen(false); }}><Search size={20} /></button>

            {isNotifOpen && (
              <div style={{
                position: 'absolute',
                top: '50px',
                right: '120px',
                background: '#fff',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                borderRadius: '16px',
                width: '320px',
                zIndex: 1000,
                border: '1px solid #f1f5f9',
                maxHeight: '400px',
                overflowY: 'auto'
              }}>
                <div style={{ padding: '1.25rem', borderBottom: '1px solid #f1f5f9', fontWeight: 800, color: '#1e293b', fontSize: '1rem', background: '#fffafb' }}>
                  Unresolved Notifications
                </div>
                <div style={{ padding: '0.5rem' }}>
                  {notifications.length === 0 ? (
                    <p style={{ padding: '2rem 1rem', color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center', margin: 0 }}>🎉 All orders handled!</p>
                  ) : (
                    notifications.map(n => (
                      <div 
                        key={n.id} 
                        onClick={() => {
                          setSearchParams({ orderId: n.id });
                          setIsNotifOpen(false);
                        }}
                        style={{ 
                          padding: '1rem', 
                          borderBottom: '1px solid #f8fafc', 
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          color: '#334155',
                          borderRadius: '8px',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#fff1f2'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem', marginBottom: '0.25rem' }}>{n.text}</div>
                        <div style={{ fontSize: '0.75rem', color: '#bc024d', fontWeight: 600 }}>Delivery Date: {n.date}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
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

        {checkedOrderIds.length > 0 && (
          <div style={{ padding: '0 1.5rem', marginBottom: '1rem' }}>
            <button 
              onClick={handleBulkDelete}
              style={{
                background: '#be123c',
                color: 'white',
                border: 'none',
                padding: '0.6rem 1.2rem',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            >
              <Trash2 size={18} /> Delete Selected Orders ({checkedOrderIds.length})
            </button>
          </div>
        )}

        <div className="orders-table-wrapper">
          <table className="orders-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }} className="hide-mobile">
                  <input 
                    type="checkbox" 
                    checked={checkedOrderIds.length === filteredOrders.length && filteredOrders.length > 0} 
                    onChange={(e) => {
                      if (e.target.checked) {
                        setCheckedOrderIds(filteredOrders.map(o => o.id));
                      } else {
                        setCheckedOrderIds([]);
                      }
                    }} 
                  />
                </th>
                <th>Order</th>
                <th>Customer</th>
                <th style={{ width: '180px' }}>Status</th>
                <th className="hide-mobile">Total</th>
                <th className="hide-mobile">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr
                  key={order.id}
                  className={selectedOrder?.id === order.id ? 'selected' : ''}
                  onClick={() => setSelectedOrder(order)}
                >
                  <td className="hide-mobile" onClick={(e) => e.stopPropagation()}>
                    <input 
                      type="checkbox" 
                      checked={checkedOrderIds.includes(order.id)} 
                      onChange={(e) => {
                        if (e.target.checked) {
                          setCheckedOrderIds([...checkedOrderIds, order.id]);
                        } else {
                          setCheckedOrderIds(checkedOrderIds.filter(id => id !== order.id));
                        }
                      }} 
                    />
                  </td>
                  <td style={{ fontWeight: 700 }}>#{order.id.slice(-6).toUpperCase()}</td>
                  <td>
                    <div className="customer-info">
                      <div className="avatar-mini">
                        {order.customer ? order.customer.charAt(0).toUpperCase() : 'G'}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600 }}>{order.customer || 'Guest'}</span>
                        {extractDeliveryDetails(order.address).date && (
                          <span style={{ fontSize: '0.75rem', color: '#bc024d', fontWeight: 600 }}>
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
                  <td style={{ fontWeight: 700 }} className="hide-mobile">
                    {Number(order.total) === 0 ? '₹ Pending' : `₹${Number(order.total).toLocaleString()}`}
                  </td>
                  <td style={{ color: '#7a7a7a' }} className="hide-mobile">
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

            <div className="status-tag-banner" style={{ marginBottom: '2rem' }}>
              <span className={`status-tag ${getStatusClass(selectedOrder.status)}`}>
                {selectedOrder.status || 'Ordered'}
              </span>
              <span style={{ marginLeft: '12px', color: '#7a7a7a', fontSize: '0.85rem', fontWeight: 600 }}>
                {new Date(selectedOrder.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div className="customer-card-hero">
              <div className="avatar-large">
                {selectedOrder.customer ? selectedOrder.customer.charAt(0).toUpperCase() : 'G'}
              </div>
              <h4>{selectedOrder.customer || 'Guest'}</h4>
              <p style={{ marginBottom: '1rem' }}>{selectedOrder.email}</p>

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
                    const phone = selectedOrder.phone;
                    if (phone) window.location.href = `tel:${phone}`;
                    else alert('No phone number found');
                  }}
                >
                  <Phone size={18} />
                </button>
                <button
                  className="icon-circle"
                  title="Message on WhatsApp"
                  onClick={() => {
                    const phone = selectedOrder.phone;
                    if (phone) window.open(`https://wa.me/91${phone}`, '_blank');
                    else alert('No phone number found');
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
              <h5 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#7a7a7a', letterSpacing: '0.05em', marginBottom: '1.5rem' }}>Order items</h5>
              {getExpandedItems(selectedOrder.items).map((item, idx) => (
                <div key={idx} className="detail-item-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1.5rem', padding: '2rem 0' }}>
                  <div className="admin-order-item-header">
                    {item.type === 'custom' && item.image ? (
                      <div style={{ width: '240px', height: '240px', borderRadius: '16px', overflow: 'hidden', border: '1px solid #eab8c8', flexShrink: 0, background: '#fffafb' }}>
                        <a href={item.image} target="_blank" rel="noreferrer" title="Click to view full image">
                          <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }} />
                        </a>
                      </div>
                    ) : (
                      <div className="item-img-frame" style={{ width: '160px', height: '160px', flexShrink: 0, borderRadius: '16px' }}>
                        {item.image ? (
                          <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <Cake size={40} color="#bc024d" />
                        )}
                      </div>
                    )}
                    <div className="item-info-main" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingTop: '0.5rem' }}>
                      <span className="name" style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>
                        {!isCakeProduct(item) ? item.name.split(' (')[0] : item.name} {item.isCombo && <span style={{ fontSize: '0.9rem', color: '#e11d48', background: '#ffe4e6', padding: '2px 8px', borderRadius: '4px', verticalAlign: 'middle', marginLeft: '8px' }}>Combo</span>}
                      </span>
                      <span className="qty-price" style={{ fontSize: '1.1rem', color: '#64748b', fontWeight: 600 }}>
                        {item.type === 'custom' ? `Size: ${item.size}` : `₹${item.price} x ${item.quantity}`}
                      </span>
                    </div>
                    {item.type !== 'custom' && (
                      <span className="item-price-final" style={{ fontSize: '1.8rem', fontWeight: 800, marginLeft: 'auto', paddingTop: '0.5rem', color: '#1e293b' }}>₹{item.price * item.quantity}</span>
                    )}
                  </div>

                  {item.type === 'custom' && item.details && (
                    <div style={{ background: '#fffafb', padding: '1.5rem 2rem', borderRadius: '16px', border: '1px solid #fce7f3' }}>
                      <h6 style={{ margin: '0 0 1rem', color: '#bc024d', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Custom Details</h6>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '1.05rem', color: '#4b5563', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <li style={{ gridColumn: '1 / -1' }}><strong>Description:</strong> {item.description}</li>
                        <li><strong>Flavor:</strong> {item.details.flavor}</li>
                        <li><strong>Shape:</strong> {item.details.shape}</li>
                        <li><strong>Type:</strong> {item.details.isEggless ? 'Eggless' : 'With Egg'}</li>
                        <li><strong>Budget:</strong> {item.details.budget || 'Not specified'}</li>
                        {item.details.message && <li style={{ gridColumn: '1 / -1' }}><strong>Message:</strong> {item.details.message}</li>}
                      </ul>
                    </div>
                  )}
                  {item.type !== 'custom' && item.variant_details && (isCakeProduct(item) || item.variant_details.message) && (
                    <div style={{ background: '#f8fafc', padding: '1.5rem 2rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                      <h6 style={{ margin: '0 0 1rem', color: '#475569', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Selected Options</h6>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '1.05rem', color: '#334155', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        {item.variant_details.weight && isCakeProduct(item) && <li><strong>Weight:</strong> {item.variant_details.weight}</li>}
                        {item.variant_details.is_eggless !== undefined && isCakeProduct(item) && <li><strong>Type:</strong> {item.variant_details.is_eggless ? 'Eggless' : 'With Egg'}</li>}
                        {item.variant_details.message && <li style={{ gridColumn: '1 / -1' }}><strong>Message on Cake:</strong> {item.variant_details.message}</li>}
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
                    <span style={{ color: '#bc024d' }}>Pending</span>
                  ) : (
                    `₹${Number(selectedOrder.total).toLocaleString()}`
                  )}
                </span>
              </div>

              {Number(selectedOrder.total) === 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  {editingPrice ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="number"
                        placeholder="₹"
                        className="filter-select"
                        style={{ flex: 1 }}
                        value={priceInput}
                        onChange={(e) => setPriceInput(e.target.value)}
                      />
                      <button className="btn-action-main btn-black" style={{ padding: '0 1rem' }} onClick={() => handleSetPrice(selectedOrder.id)}>✓</button>
                    </div>
                  ) : (
                    <button className="btn-action-main btn-yellow" style={{ width: '100%' }} onClick={() => setEditingPrice(true)}>
                      <Palette size={18} /> Set Price
                    </button>
                  )}
                </div>
              )}

              <div style={{ marginTop: '2rem' }}>
                <button
                  className="btn-action-main btn-yellow"
                  style={{ width: '100%', background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' }}
                  onClick={() => handleDelete(selectedOrder.id)}
                >
                  <Trash size={18} /> Delete This Order
                </button>
              </div>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
            <ShoppingBag size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <p>Select an order to view details</p>
          </div>
        )}
      </aside>
    </div>
  );
}
