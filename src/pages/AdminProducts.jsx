import { useState } from 'react';
import { Plus, Edit, Trash2, X, Search, Filter } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import './Admin.css';

export default function AdminProducts() {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Classic',
    rating: 4.5,
    description: '',
    image: '/hero-cake.png'
  });

  const categories = ['All', 'Classic', 'Fruit', 'Chocolate', 'Specialty'];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'All' || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData(product);
    } else {
      setEditingProduct(null);
      setFormData({
        name: '', price: '', category: 'Classic', rating: 4.5, description: '', image: '/hero-cake.png'
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { ...formData, price: parseFloat(formData.price) };
    if (editingProduct) {
      updateProduct(data);
    } else {
      addProduct(data);
    }
    closeModal();
  };

  return (
    <div className="admin-products">
      <h3 className="section-title">Inventory ({filteredProducts.length})</h3>

      <div className="admin-toolbar" style={{padding: '0 0.5rem', alignItems: 'center'}}>
        <button className="btn btn-primary" onClick={() => openModal()} style={{padding: '1.25rem 2rem', display: 'flex', alignItems: 'center', gap: '10px', height: '100%', whiteSpace: 'nowrap'}}>
          <Plus size={20} style={{strokeWidth: 3}} /> CREATE PRODUCT
        </button>

        <div style={{position: 'relative', flex: 1}}>
          <Search size={18} style={{position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-outline)'}} />
          <input 
            type="text" 
            placeholder="Search by product name..." 
            className="search-input"
            style={{paddingLeft: '3.5rem', width: '100%'}}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{position: 'relative'}}>
          <Filter size={18} style={{position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-outline)'}} />
          <select 
            className="filter-select"
            style={{paddingLeft: '3.5rem'}}
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="panel" style={{marginTop: '1.5rem'}}>
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Preview</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Performance</th>
                <th style={{textAlign: 'right'}}>Management</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{textAlign: 'center', padding: '5rem', color: 'var(--color-text-light)'}}>
                    No inventory items found.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(cake => (
                  <tr key={cake.id}>
                    <td>
                      <img src={cake.image} alt={cake.name} style={{width:'56px', height:'56px', borderRadius:'14px', objectFit:'cover', boxShadow: 'var(--shadow-sm)'}}/>
                    </td>
                    <td style={{fontWeight: '700', color: 'var(--color-text-dark)'}}>{cake.name}</td>
                    <td><span className="badge" style={{background: 'var(--color-surface-low)', color: 'var(--color-text-light)', opacity: 0.8}}>{cake.category}</span></td>
                    <td style={{fontWeight: '700', fontSize: '1.1rem'}}>₹{cake.price.toLocaleString()}</td>
                    <td><span style={{color: '#10b981', fontWeight: '700'}}>{cake.rating} ★</span></td>
                    <td style={{textAlign: 'right'}}>
                      <div className="row-actions" style={{justifyContent: 'flex-end', gap: '10px'}}>
                        <button className="action-btn edit" onClick={() => openModal(cake)} title="Edit Details" style={{color: 'var(--color-primary)'}}><Edit size={18}/></button>
                        <button className="action-btn delete" onClick={() => deleteProduct(cake.id)} title="Remove Product" style={{color: '#ba1a1a'}}><Trash2 size={18}/></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{maxWidth: '600px'}}>
            <div className="modal-header">
              <h3 style={{fontFamily: 'var(--font-heading)', fontSize: '1.8rem'}}>{editingProduct ? 'Edit Inventory Item' : 'Create New Inventory Item'}</h3>
              <button className="close-btn" onClick={closeModal} style={{background:'none', border:'none', cursor:'pointer', color: 'var(--color-outline)'}}><X size={28} /></button>
            </div>
            <form onSubmit={handleSubmit} className="admin-form" style={{marginTop: '2rem'}}>
              <div className="form-group" style={{marginBottom: '1.5rem'}}>
                <label style={{fontSize: '0.75rem', fontWeight: '800', color: 'var(--color-text-light)', letterSpacing: '0.1em'}}>PRODUCT NAME</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  placeholder="e.g. Red Velvet Dream"
                  className="search-input"
                  style={{width: '100%', marginTop: '0.5rem'}}
                  required 
                />
              </div>
              <div className="form-row" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem'}}>
                <div className="form-group">
                  <label style={{fontSize: '0.75rem', fontWeight: '800', color: 'var(--color-text-light)', letterSpacing: '0.1em'}}>UNIT PRICE (₹)</label>
                  <input 
                    type="number" 
                    value={formData.price} 
                    onChange={(e) => setFormData({...formData, price: e.target.value})} 
                    placeholder="0.00"
                    className="search-input"
                    style={{width: '100%', marginTop: '0.5rem'}}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label style={{fontSize: '0.75rem', fontWeight: '800', color: 'var(--color-text-light)', letterSpacing: '0.1em'}}>CATEGORY</label>
                  <select 
                    value={formData.category} 
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="filter-select"
                    style={{width: '100%', marginTop: '0.5rem'}}
                  >
                    <option>Classic</option>
                    <option>Fruit</option>
                    <option>Chocolate</option>
                    <option>Specialty</option>
                  </select>
                </div>
              </div>
              <div className="form-group" style={{marginBottom: '2rem'}}>
                <label style={{fontSize: '0.75rem', fontWeight: '800', color: 'var(--color-text-light)', letterSpacing: '0.1em'}}>SPECIFICATIONS / DESCRIPTION</label>
                <textarea 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})} 
                  placeholder="Describe your delicious creation..."
                  className="search-input"
                  rows="4"
                  style={{width: '100%', marginTop: '0.5rem', resize: 'none'}}
                ></textarea>
              </div>
              <div className="image-upload-area">
                <label style={{fontSize: '0.75rem', fontWeight: '800', color: 'var(--color-text-light)', letterSpacing: '0.1em'}}>PRODUCT ILLUSTRATION</label>
                <div className="image-preview-wrapper" onClick={() => document.getElementById('cake-upload').click()} style={{cursor: 'pointer'}}>
                  <img src={formData.image} alt="Preview" className="image-preview-large" />
                  <div className="file-input-label">
                    <p>{editingProduct ? 'Change product image' : 'Upload a delicious cake photo'}</p>
                    <span>Click to browse files (JPG, PNG)</span>
                  </div>
                  <input 
                    id="cake-upload"
                    type="file" 
                    accept="image/*"
                    className="hidden-file-input"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setFormData({ ...formData, image: reader.result });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{width: '100%', padding: '1.25rem', borderRadius: '1.5rem', fontSize: '1rem', letterSpacing: '0.05em'}}>
                {editingProduct ? 'UPDATE INVENTORY' : 'CONFIRM ADDITION'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
