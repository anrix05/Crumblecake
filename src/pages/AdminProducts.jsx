import { useState, useRef } from 'react';
import { Plus, Edit, Trash2, X, Search, Filter, Bell, Cake, Package, Star, Palette, Image as ImageIcon, UploadCloud, Check } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import './Admin.css';

export default function AdminProducts() {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    actual_price: '',
    category: 'Classic',
    rating: 4.5,
    description: '',
    instructions: '',
    images: [],
    weight: '1kg',
    flavor: '',
    shape: '',
    serves: '',
    prices: {
      egg: { '0.5kg': '', '1kg': '', '1.5kg': '', '2kg': '', '3kg': '' },
      eggless: { '0.5kg': '', '1kg': '', '1.5kg': '', '2kg': '', '3kg': '' }
    },
    isEggless: true,
    isFreshlyBaked: true
  });

  const categories = ['All', 'Classic', 'Fruit', 'Chocolate', 'Specialty', 'Combos & Gifts'];
  const weightOptions = ['0.5kg', '1kg', '1.5kg', '2kg', '3kg', 'Custom'];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'All' || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const startEdit = (product) => {
    setIsAddingNew(false);
    setSelectedProduct(product);
    
    let images = [];
    try {
      if (typeof product.image === 'string' && product.image.startsWith('[')) {
        images = JSON.parse(product.image);
      } else if (Array.isArray(product.images)) {
        images = product.images;
      } else if (product.image) {
        images = [product.image];
      }
    } catch (e) {
      images = [product.image];
    }
    
    setFormData({ 
      ...product, 
      images,
      actual_price: product.actual_price || product.price || '',
      description: product.description || '',
      instructions: product.instructions || '',
      weight: product.weight || '1kg',
      flavor: product.flavor || product.prices?.metadata?.flavor || '',
      shape: product.shape || product.prices?.metadata?.shape || '',
      serves: product.serves || product.prices?.metadata?.serves || '',
      prices: (() => {
        let base = {
          egg: { '0.5kg': '', '1kg': product.price || '', '1.5kg': '', '2kg': '', '3kg': '' },
          eggless: { '0.5kg': '', '1kg': product.price || '', '1.5kg': '', '2kg': '', '3kg': '' }
        };
        if (product.prices) {
          if (product.prices.egg || product.prices.eggless) {
            base.egg = { ...base.egg, ...product.prices.egg };
            base.eggless = { ...base.eggless, ...product.prices.eggless };
          } else {
            base.egg = { ...base.egg, ...product.prices };
            base.eggless = { ...base.eggless, ...product.prices };
          }
        }
        return base;
      })(),
      isEggless: product.is_eggless !== undefined ? product.is_eggless : true,
      isFreshlyBaked: product.is_freshly_baked !== undefined ? product.is_freshly_baked : true
    });
  };

  const startAdd = () => {
    setSelectedProduct(null);
    setIsAddingNew(true);
    setFormData({
      name: '', price: '', actual_price: '', category: 'Classic', rating: 4.5, description: '', instructions: '', images: [],
      weight: '1kg', flavor: '', shape: '', serves: '',
      prices: {
        egg: { '0.5kg': '', '1kg': '', '1.5kg': '', '2kg': '', '3kg': '' },
        eggless: { '0.5kg': '', '1kg': '', '1.5kg': '', '2kg': '', '3kg': '' }
      }, 
      isEggless: true, isFreshlyBaked: true
    });
  };

  const closePanel = () => {
    setSelectedProduct(null);
    setIsAddingNew(false);
  };

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_SIZE = 1200;
          if (width > height) {
            if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
          } else {
            if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    for (const file of files) {
      const compressedBase64 = await compressImage(file);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, compressedBase64]
      }));
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const dbData = {
      name: formData.name,
      price: parseFloat(formData.price) || 0,
      actual_price: parseFloat(formData.actual_price) || parseFloat(formData.price) || 0,
      category: formData.category || 'Classic',
      description: formData.description || '',
      instructions: formData.instructions || '',
      rating: parseFloat(formData.rating) || 4.5,
      image: formData.images.length > 1 ? JSON.stringify(formData.images) : (formData.images[0] || '/hero-cake.png'),
      in_stock: true,
      weight: formData.weight,
      prices: {
        ...formData.prices,
        metadata: {
          flavor: formData.flavor,
          shape: formData.shape,
          serves: formData.serves
        }
      },
      is_eggless: formData.isEggless,
      is_freshly_baked: formData.isFreshlyBaked
    };

    if (selectedProduct) {
      updateProduct({ ...dbData, id: selectedProduct.id });
    } else {
      addProduct(dbData);
    }
    closePanel();
  };

  const isPanelOpen = selectedProduct || isAddingNew;

  return (
    <div className={`admin-view-content ${isPanelOpen ? 'has-selection' : ''}`}>
      {/* Left List Section */}
      <section className="list-section">
        <header className="view-header">
          <div>
            <h2>Inventory</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Manage your bakery's product catalog.</p>
          </div>
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
          <div className="filter-left" style={{ flex: 1 }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: '300px' }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="text" 
                placeholder="Search products..." 
                className="filter-select"
                style={{ paddingLeft: '2.5rem', width: '100%' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select 
              className="filter-select"
              style={{ minWidth: '120px' }}
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <button className="btn-action-main btn-black" onClick={startAdd} style={{ padding: '0.85rem 1.5rem' }}>
            <Plus size={20} /> Add New Cake
          </button>
        </div>

        <div className="orders-table-wrapper">
          <table className="orders-table">
            <thead>
              <tr>
                <th style={{width: '100px'}}>Preview</th>
                <th>Product Details</th>
                <th style={{width: '140px'}}>Category</th>
                <th style={{width: '120px'}}>Price</th>
                <th style={{width: '100px'}}>Rating</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(cake => (
                <tr 
                  key={cake.id} 
                  className={selectedProduct?.id === cake.id ? 'selected' : ''}
                  onClick={() => startEdit(cake)}
                >
                  <td style={{ padding: '1.5rem' }}>
                    <img src={cake.image || (cake.images?.[0])} alt={cake.name} style={{width:'64px', height:'64px', borderRadius:'16px', objectFit:'cover', boxShadow: '0 8px 20px rgba(0,0,0,0.06)'}}/>
                  </td>
                  <td>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                      <span style={{fontWeight: 800, fontSize: '1.05rem', color: '#1a1a1a'}}>{cake.name}</span>
                      {cake.category !== 'Combos & Gifts' && (
                        <span style={{fontSize: '0.8rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '240px'}}>
                          {cake.weight || '1kg'} • {cake.is_eggless ? 'Eggless' : 'Contains Egg'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="status-tag" style={{background: '#f1f5f9', color: '#475569', fontSize: '0.75rem'}}>
                      {cake.category}
                    </span>
                  </td>
                  <td style={{fontWeight: 900, fontSize: '1.15rem', color: '#1a1a1a'}}>₹{Number(cake.price).toLocaleString()}</td>
                  <td>
                    <div style={{display: 'flex', alignItems: 'center', gap: '6px', color: '#ca8a04', fontWeight: 800}}>
                      <Star size={16} fill="#ca8a04" strokeWidth={0} /> {cake.rating}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <aside className="details-section">
        <div className="details-header" style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontFamily: "'Noto Serif', serif", fontSize: '2rem', fontWeight: 700, color: '#3f4247', margin: 0 }}>{isAddingNew ? 'New Creation' : 'Edit Cake'}</h3>
          <button className="tool-icon-btn" onClick={closePanel} style={{ background: '#fdf2f5', border: 'none', color: '#cd3d7a' }}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '2rem' }}>
            
            {/* Multi-Image Uploader */}
            <div>
              <div 
                onClick={() => fileInputRef.current.click()}
                style={{ 
                  padding: '1.5rem', border: '2px dashed #eab8c8', borderRadius: '16px', textAlign: 'center', cursor: 'pointer', background: '#fdfafb', transition: 'all 0.2s', color: '#cd3d7a'
                }}
                onMouseEnter={(e) => e.target.style.background = '#fdf2f5'}
                onMouseLeave={(e) => e.target.style.background = '#fdfafb'}
              >
                <p style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Add / Drop product image</p>
                <input ref={fileInputRef} type="file" hidden multiple accept="image/*" onChange={handleImageUpload} />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
                {formData.images.map((img, idx) => (
                  <div key={idx} style={{ position: 'relative', flexShrink: 0, width: '60px', height: '60px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #eab8c8' }}>
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button type="button" onClick={() => removeImage(idx)} style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(255,255,255,0.9)', color: '#cd3d7a', border: 'none', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={12} /></button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#888', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>PRODUCT NAME</label>
              <input type="text" style={{ width: '100%', padding: '0.9rem 1.2rem', borderRadius: '12px', border: '1px solid #eab8c8', background: '#fdfafb', fontSize: '0.95rem', color: '#3f4247', fontFamily: 'inherit' }} value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
            </div>

            <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem'}}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#888', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>ACTUAL PRICE (₹)</label>
                <input type="number" style={{ width: '100%', padding: '0.9rem 1.2rem', borderRadius: '12px', border: '1px solid #eab8c8', background: '#fdfafb', fontSize: '0.95rem', color: '#3f4247', fontFamily: 'inherit' }} value={formData.actual_price} onChange={(e) => setFormData({...formData, actual_price: e.target.value})} required />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#888', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>OFFER PRICE (₹)</label>
                <input type="number" style={{ width: '100%', padding: '0.9rem 1.2rem', borderRadius: '12px', border: '1px solid #eab8c8', background: '#fdfafb', fontSize: '0.95rem', color: '#3f4247', fontFamily: 'inherit' }} value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#888', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>CATEGORY</label>
                <select style={{ width: '100%', padding: '0.9rem 1.2rem', borderRadius: '12px', border: '1px solid #eab8c8', background: '#fdfafb', fontSize: '0.95rem', color: '#3f4247', fontFamily: 'inherit' }} value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                  {categories.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem'}}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#888', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>FLAVOR</label>
                <input type="text" style={{ width: '100%', padding: '0.9rem 1.2rem', borderRadius: '12px', border: '1px solid #eab8c8', background: '#fdfafb', fontSize: '0.95rem', color: '#3f4247', fontFamily: 'inherit' }} value={formData.flavor || ''} onChange={(e) => setFormData({...formData, flavor: e.target.value})} placeholder="e.g. Pineapple" />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#888', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>SHAPE</label>
                <input type="text" style={{ width: '100%', padding: '0.9rem 1.2rem', borderRadius: '12px', border: '1px solid #eab8c8', background: '#fdfafb', fontSize: '0.95rem', color: '#3f4247', fontFamily: 'inherit' }} value={formData.shape || ''} onChange={(e) => setFormData({...formData, shape: e.target.value})} placeholder="e.g. Round" />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#888', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>SERVES</label>
                <input type="text" style={{ width: '100%', padding: '0.9rem 1.2rem', borderRadius: '12px', border: '1px solid #eab8c8', background: '#fdfafb', fontSize: '0.95rem', color: '#3f4247', fontFamily: 'inherit' }} value={formData.serves || ''} onChange={(e) => setFormData({...formData, serves: e.target.value})} placeholder="e.g. 4-6 People" />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#888', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>PRICING BY WEIGHT (WITH EGG)</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                {Object.keys(formData.prices.egg).map(weight => (
                  <div key={weight}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#c2410c', display: 'block', marginBottom: '0.25rem' }}>{weight} (₹)</label>
                    <input 
                      type="number" 
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #eab8c8', background: '#fff', fontSize: '0.9rem', color: '#3f4247' }} 
                      value={formData.prices.egg[weight]} 
                      onChange={(e) => setFormData({...formData, prices: {...formData.prices, egg: {...formData.prices.egg, [weight]: e.target.value}}})} 
                      placeholder="e.g. 500" 
                    />
                  </div>
                ))}
              </div>

              <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#888', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>PRICING BY WEIGHT (EGGLESS)</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                {Object.keys(formData.prices.eggless).map(weight => (
                  <div key={weight}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#15803d', display: 'block', marginBottom: '0.25rem' }}>{weight} (₹)</label>
                    <input 
                      type="number" 
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #eab8c8', background: '#fff', fontSize: '0.9rem', color: '#3f4247' }} 
                      value={formData.prices.eggless[weight]} 
                      onChange={(e) => setFormData({...formData, prices: {...formData.prices, eggless: {...formData.prices.eggless, [weight]: e.target.value}}})} 
                      placeholder="e.g. 550" 
                    />
                  </div>
                ))}
              </div>
            </div>



            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#888', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>DESCRIPTION</label>
              <textarea style={{ width: '100%', padding: '0.9rem 1.2rem', borderRadius: '12px', border: '1px solid #eab8c8', background: '#fdfafb', fontSize: '0.95rem', color: '#3f4247', fontFamily: 'inherit', minHeight: '100px', resize: 'none' }} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Rich product description..." />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#888', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>CARE / SPECIAL INSTRUCTIONS</label>
              <textarea style={{ width: '100%', padding: '0.9rem 1.2rem', borderRadius: '12px', border: '1px solid #eab8c8', background: '#fdfafb', fontSize: '0.95rem', color: '#3f4247', fontFamily: 'inherit', minHeight: '80px', resize: 'none' }} value={formData.instructions} onChange={(e) => setFormData({...formData, instructions: e.target.value})} placeholder="e.g. Keep refrigerated until serving..." />
            </div>
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '1.5rem', paddingBottom: '1rem', borderTop: '1px solid #fdf2f5' }}>
            <button type="submit" style={{ 
              width: '100%', padding: '1rem', background: 'linear-gradient(135deg, #d44d7d 0%, #c43369 100%)', 
              color: 'white', border: 'none', borderRadius: '50px', fontWeight: 700, fontSize: '1rem', fontFamily: 'inherit',
              cursor: 'pointer', boxShadow: '0 8px 24px rgba(200, 50, 100, 0.2)', transition: 'all 0.2s'
            }}>
              {selectedProduct ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}
