import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { loginAdmin, createProduct, uploadImageToImgBB, recoverPassword, fetchProducts, deleteProduct as deleteProductApi } from '../services/api';
import AdminOrders from './AdminOrders';
import { Trash2, RotateCcw, Search, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const TRASH_KEY = 'hanna_trashed_products';

const loadTrash = () => {
  try { return JSON.parse(localStorage.getItem(TRASH_KEY) || '[]'); } catch { return []; }
};

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [tab, setTab] = useState('products');

  const [product, setProduct] = useState({ name: '', price: '', department: '', category: '', referencia: '', colores: '', tallas: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [trashed, setTrashed] = useState(loadTrash);

  const [allProducts, setAllProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [newDepartment, setNewDepartment] = useState('');

  const [colorsMaster, setColorsMaster] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hanna_colors') || '[]'); } catch { return []; }
  });
  const [tallasMaster, setTallasMaster] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hanna_tallas') || '[]'); } catch { return []; }
  });
  const [newColor, setNewColor] = useState('');
  const [newTalla, setNewTalla] = useState('');

  useEffect(() => {
    localStorage.setItem('hanna_colors', JSON.stringify(colorsMaster));
  }, [colorsMaster]);

  useEffect(() => {
    localStorage.setItem('hanna_tallas', JSON.stringify(tallasMaster));
  }, [tallasMaster]);

  useEffect(() => {
    localStorage.setItem(TRASH_KEY, JSON.stringify(trashed));
  }, [trashed]);

  const loadProducts = async () => {
    const data = await fetchProducts();
    if (Array.isArray(data)) {
      setAllProducts(data);
      const cats = new Set(); const deps = new Set();
      data.forEach(p => {
        if (p.categoria || p.category) cats.add(p.categoria || p.category);
        if (p.departamento || p.department) deps.add(p.departamento || p.department);
      });
      setCategories(Array.from(cats));
      setDepartments(Array.from(deps));
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    const success = await loginAdmin(password);
    if (success) {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_authenticated', 'true');
      toast.success('Sesión iniciada');
      loadProducts();
    } else {
      toast.error('Contraseña incorrecta o error de conexión.');
    }
    setIsProcessing(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_authenticated');
    toast.success('Sesión cerrada');
  };

  const handleRecoverPassword = async () => {
    setIsProcessing(true);
    const success = await recoverPassword();
    if (success) {
      toast.success('Si el sistema está configurado, revisa tu correo.');
    } else {
      toast.error('Error al enviar el correo de recuperación.');
    }
    setIsProcessing(false);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target.result);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!imageFile) { toast.error('Por favor selecciona una imagen.'); return; }
    setIsProcessing(true);
    const imageUrl = await uploadImageToImgBB(imageFile);
    if (!imageUrl) { toast.error('Error al subir la imagen.'); setIsProcessing(false); return; }
    const success = await createProduct({ ...product, imageUrl });
    if (success) {
      toast.success('Producto agregado');
      setProduct({ name: '', price: '', department: '', category: '', referencia: '', colores: '', tallas: '' });
      setImageFile(null); setImagePreview(null);
      loadProducts();
    } else {
      toast.error('Error al guardar en la base de datos.');
    }
    setIsProcessing(false);
  };

  const handleDeleteProduct = async (item) => {
    if (!window.confirm(`¿Eliminar "${item.nombre || item.name}"?`)) return;
    const ok = await deleteProductApi(item.id);
    if (ok) {
      toast.success('Producto eliminado de la nube');
    } else {
      toast('No se pudo eliminar de la nube, se guarda en papelera local', { icon: '⚠️' });
    }
    const trash = JSON.parse(localStorage.getItem(TRASH_KEY) || '[]');
    trash.push(item);
    localStorage.setItem(TRASH_KEY, JSON.stringify(trash));
    setTrashed(trash);
    setAllProducts(prev => prev.filter(p => p.id !== item.id));
  };

  const handleRestoreProduct = (item) => {
    setTrashed(prev => prev.filter(t => t.id !== item.id));
    toast.success('Producto restaurado');
  };

  const handleClearTrash = () => {
    if (window.confirm('¿Eliminar permanentemente todos los productos de la papelera?')) {
      setTrashed([]);
      toast.success('Papelera vaciada');
    }
  };

  const handleDeleteCategory = (cat) => {
    if (window.confirm(`¿Eliminar categoría "${cat}"? (solo del listado local)`)) {
      setCategories(prev => prev.filter(c => c !== cat));
      toast.success(`Categoría "${cat}" eliminada del listado`);
    }
  };

  const handleDeleteDepartment = (dep) => {
    if (window.confirm(`¿Eliminar departamento "${dep}"? (solo del listado local)`)) {
      setDepartments(prev => prev.filter(d => d !== dep));
      toast.success(`Departamento "${dep}" eliminado del listado`);
    }
  };

  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    setCategories(prev => [...prev, newCategory.trim()]);
    setNewCategory('');
    toast.success(`Categoría "${newCategory.trim()}" agregada`);
  };

  const handleAddDepartment = () => {
    if (!newDepartment.trim()) return;
    setDepartments(prev => [...prev, newDepartment.trim()]);
    setNewDepartment('');
    toast.success(`Departamento "${newDepartment.trim()}" agregado`);
  };

  const handleAddColor = () => {
    if (!newColor.trim()) return;
    setColorsMaster(prev => [...prev, newColor.trim()]);
    setNewColor('');
    toast.success(`Color "${newColor.trim()}" agregado`);
  };

  const handleDeleteColor = (c) => {
    setColorsMaster(prev => prev.filter(x => x !== c));
    toast.success(`Color "${c}" eliminado`);
  };

  const handleAddTalla = () => {
    if (!newTalla.trim()) return;
    setTallasMaster(prev => [...prev, newTalla.trim()]);
    setNewTalla('');
    toast.success(`Talla "${newTalla.trim()}" agregada`);
  };

  const handleDeleteTalla = (t) => {
    setTallasMaster(prev => prev.filter(x => x !== t));
    toast.success(`Talla "${t}" eliminada`);
  };

  const toggleColor = (c) => {
    const current = product.colores ? product.colores.split(',').map(s => s.trim()).filter(Boolean) : [];
    const idx = current.indexOf(c);
    const next = idx >= 0 ? current.filter(x => x !== c) : [...current, c];
    setProduct({...product, colores: next.join(',')});
  };

  const toggleTalla = (t) => {
    const current = product.tallas ? product.tallas.split(',').map(s => s.trim()).filter(Boolean) : [];
    const idx = current.indexOf(t);
    const next = idx >= 0 ? current.filter(x => x !== t) : [...current, t];
    setProduct({...product, tallas: next.join(',')});
  };

  const filtered = allProducts.filter(p => {
    const name = (p.nombre || p.name || '').toLowerCase();
    return !searchQuery || name.includes(searchQuery.toLowerCase());
  });

  if (!isAuthenticated) {
    return (
      <div className="premium-card" style={{ padding: '3rem', maxWidth: '400px', margin: '4rem auto', textAlign: 'center' }}>
        <Helmet><title>Admin - Hanna Accesorios</title></Helmet>
        <h2>Acceso Administrador</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>Inicia sesión para gestionar tu catálogo</p>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input type="password" placeholder="Contraseña Maestra" className="input-field" value={password} onChange={e => setPassword(e.target.value)} required />
          <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={isProcessing}>
            {isProcessing ? 'Cargando...' : 'Ingresar'}
          </button>
        </form>
        <button onClick={handleRecoverPassword} disabled={isProcessing} style={{ background: 'none', border: 'none', color: 'var(--color-accent)', marginTop: '1rem', cursor: 'pointer', textDecoration: 'underline' }}>
          ¿Olvidaste tu contraseña?
        </button>
      </div>
    );
  }

  return (
    <div>
      <Helmet><title>Panel Admin - Hanna Accesorios</title></Helmet>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2>Panel de Control</h2>
        <button onClick={handleLogout} className="btn-primary" style={{ background: 'var(--color-error)' }}>Cerrar Sesión</button>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button onClick={() => setTab('products')} className={tab === 'products' ? 'btn-accent' : 'btn-primary'} style={{ fontSize: '0.9rem' }}>Añadir Producto</button>
        <button onClick={() => { setTab('manage'); loadProducts(); }} className={tab === 'manage' ? 'btn-accent' : 'btn-primary'} style={{ fontSize: '0.9rem' }}>Gestionar Productos</button>
        <button onClick={() => setTab('categories')} className={tab === 'categories' ? 'btn-accent' : 'btn-primary'} style={{ fontSize: '0.9rem' }}>Categorías</button>
        <button onClick={() => setTab('variants')} className={tab === 'variants' ? 'btn-accent' : 'btn-primary'} style={{ fontSize: '0.9rem' }}>Colores y Tallas</button>
        <button onClick={() => setTab('orders')} className={tab === 'orders' ? 'btn-accent' : 'btn-primary'} style={{ fontSize: '0.9rem' }}>Pedidos</button>
        <button onClick={() => setTab('trash')} className={tab === 'trash' ? 'btn-accent' : 'btn-primary'} style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Trash2 size={16} /> Papelera {trashed.length > 0 && `(${trashed.length})`}
        </button>
      </div>

      {tab === 'products' && (
        <div className="premium-card" style={{ padding: '3rem', maxWidth: '800px', margin: '0 auto' }}>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>Añade nuevos productos a tu catálogo</p>
          <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input type="text" placeholder="Nombre del Producto" className="input-field" required value={product.name} onChange={e => setProduct({...product, name: e.target.value})} />
            <input type="text" placeholder="Referencia / SKU (Código único)" className="input-field" value={product.referencia} onChange={e => setProduct({...product, referencia: e.target.value})} />
            <input type="number" placeholder="Precio ($)" className="input-field" required value={product.price} onChange={e => setProduct({...product, price: e.target.value})} />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <input type="text" placeholder="Departamento (Ej. Platería)" className="input-field" required list="dep-list" value={product.department} onChange={e => setProduct({...product, department: e.target.value})} />
              <datalist id="dep-list">{departments.map(d => <option key={d} value={d} />)}</datalist>
              <input type="text" placeholder="Categoría (Ej. Anillos)" className="input-field" required list="cat-list" value={product.category} onChange={e => setProduct({...product, category: e.target.value})} />
              <datalist id="cat-list">{categories.map(c => <option key={c} value={c} />)}</datalist>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Colores {product.colores && <span style={{ color: 'var(--color-accent)', fontSize: '0.8rem' }}>({product.colores})</span>}</p>
                <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                  {colorsMaster.length === 0 && <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Sin colores definidos</span>}
                  {colorsMaster.map(c => (
                    <button key={c} type="button" onClick={() => toggleColor(c)} style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', border: product.colores?.includes(c) ? '2px solid var(--color-accent)' : '1px solid var(--color-border)', borderRadius: '6px', background: product.colores?.includes(c) ? 'var(--color-accent)' : 'var(--color-surface)', color: product.colores?.includes(c) ? '#111' : 'var(--color-text)', cursor: 'pointer' }}>
                      {c} {product.colores?.includes(c) && ' ✓'}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Tallas {product.tallas && <span style={{ color: 'var(--color-accent)', fontSize: '0.8rem' }}>({product.tallas})</span>}</p>
                <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                  {tallasMaster.length === 0 && <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Sin tallas definidas</span>}
                  {tallasMaster.map(t => (
                    <button key={t} type="button" onClick={() => toggleTalla(t)} style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', border: product.tallas?.includes(t) ? '2px solid var(--color-accent)' : '1px solid var(--color-border)', borderRadius: '6px', background: product.tallas?.includes(t) ? 'var(--color-accent)' : 'var(--color-surface)', color: product.tallas?.includes(t) ? '#111' : 'var(--color-text)', cursor: 'pointer' }}>
                      {t} {product.tallas?.includes(t) && ' ✓'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="image-upload-area">
              <label className="image-upload-label">
                <strong>Seleccionar Imagen (Alta Calidad)</strong>
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageSelect} />
              </label>
              {imagePreview && (
                <div className="image-preview-container">
                  <img src={imagePreview} alt="Vista previa" className="image-preview" />
                  <button type="button" className="image-preview-remove" onClick={() => { setImageFile(null); setImagePreview(null); }}>✕</button>
                </div>
              )}
              {imageFile && !imagePreview && <p style={{ marginTop: '1rem', color: 'var(--color-success)' }}>{imageFile.name}</p>}
            </div>
            <button type="submit" className="btn-accent" disabled={isProcessing}>
              {isProcessing ? 'Subiendo Producto...' : 'Guardar Producto'}
            </button>
          </form>
        </div>
      )}

      {tab === 'manage' && (
        <div className="premium-card" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Buscar y Eliminar Productos</h3>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <input type="text" placeholder="Buscar productos por nombre..." className="input-field" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ flex: 1 }} />
            {searchQuery && <button className="btn-icon" onClick={() => setSearchQuery('')}><X size={20} /></button>}
          </div>
          {filtered.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>{allProducts.length === 0 ? 'No hay productos. Agrega algunos primero.' : 'No se encontraron productos.'}</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {filtered.map((item, idx) => (
                <div key={item.id || idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)' }}>
                  {item.imagenUrl || item.imageUrl ? (
                    <img src={item.imagenUrl || item.imageUrl} alt={item.nombre || item.name} style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: '6px' }} />
                  ) : <div style={{ width: 50, height: 50, borderRadius: '6px', background: 'var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📷</div>}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <strong style={{ fontSize: '0.9rem' }}>{item.nombre || item.name}</strong>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>${item.precio || item.price} — {(item.departamento || item.department || '')} / {(item.categoria || item.category || '')}</p>
                  </div>
                  <button onClick={() => handleDeleteProduct(item)} className="btn-icon" title="Eliminar" style={{ color: 'var(--color-error)' }}><X size={18} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'categories' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="premium-card" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Departamentos</h3>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input type="text" placeholder="Nuevo departamento..." className="input-field" value={newDepartment} onChange={e => setNewDepartment(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddDepartment())} />
              <button onClick={handleAddDepartment} className="btn-accent" style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>Agregar</button>
            </div>
            {departments.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Sin departamentos</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {departments.map(d => (
                  <div key={d} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)' }}>
                    <span>{d}</span>
                    <button onClick={() => handleDeleteDepartment(d)} className="btn-icon" style={{ color: 'var(--color-error)', width: 24, height: 24 }}><X size={14} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="premium-card" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Categorías</h3>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input type="text" placeholder="Nueva categoría..." className="input-field" value={newCategory} onChange={e => setNewCategory(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddCategory())} />
              <button onClick={handleAddCategory} className="btn-accent" style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>Agregar</button>
            </div>
            {categories.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Sin categorías</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {categories.map(c => (
                  <div key={c} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)' }}>
                    <span>{c}</span>
                    <button onClick={() => handleDeleteCategory(c)} className="btn-icon" style={{ color: 'var(--color-error)', width: 24, height: 24 }}><X size={14} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'variants' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="premium-card" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Colores</h3>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input type="text" placeholder="Nuevo color..." className="input-field" value={newColor} onChange={e => setNewColor(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddColor())} />
              <button onClick={handleAddColor} className="btn-accent" style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>Agregar</button>
            </div>
            {colorsMaster.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Sin colores definidos</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {colorsMaster.map(c => (
                  <div key={c} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)' }}>
                    <span>{c}</span>
                    <button onClick={() => handleDeleteColor(c)} className="btn-icon" style={{ color: 'var(--color-error)', width: 24, height: 24 }}><X size={14} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="premium-card" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Tallas de Anillos</h3>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input type="text" placeholder="Nueva talla..." className="input-field" value={newTalla} onChange={e => setNewTalla(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTalla())} />
              <button onClick={handleAddTalla} className="btn-accent" style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>Agregar</button>
            </div>
            {tallasMaster.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Sin tallas definidas</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {tallasMaster.map(t => (
                  <div key={t} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)' }}>
                    <span>{t}</span>
                    <button onClick={() => handleDeleteTalla(t)} className="btn-icon" style={{ color: 'var(--color-error)', width: 24, height: 24 }}><X size={14} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'orders' && (
        <div className="premium-card" style={{ padding: '2rem' }}>
          <AdminOrders />
        </div>
      )}

      {tab === 'trash' && (
        <div className="premium-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3>Productos Eliminados ({trashed.length})</h3>
            {trashed.length > 0 && (
              <button onClick={handleClearTrash} className="btn-primary" style={{ background: 'var(--color-error)', fontSize: '0.85rem' }}>Vaciar Papelera</button>
            )}
          </div>
          {trashed.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>No hay productos eliminados.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {trashed.map((item, idx) => (
                <div key={item.id || idx} className="premium-card" style={{ display: 'flex', alignItems: 'center', padding: '1rem', gap: '1rem' }}>
                  {item.imagenUrl || item.imageUrl ? (
                    <img src={item.imagenUrl || item.imageUrl} alt={item.nombre || item.name} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: '8px' }} />
                  ) : (
                    <div style={{ width: 60, height: 60, borderRadius: '8px', background: 'var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📷</div>
                  )}
                  <div style={{ flex: 1 }}>
                    <strong>{item.nombre || item.name || 'Sin nombre'}</strong>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>${item.precio || item.price || '0'}</p>
                  </div>
                  <button onClick={() => handleRestoreProduct(item)} className="btn-icon" title="Restaurar" style={{ color: 'var(--color-success)' }}>
                    <RotateCcw size={20} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Admin;
