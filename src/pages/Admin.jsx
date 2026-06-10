import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { loginAdmin, createProduct, uploadImageToImgBB, recoverPassword } from '../services/api';
import AdminOrders from './AdminOrders';
import { Trash2, RotateCcw } from 'lucide-react';
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

  const [product, setProduct] = useState({ name: '', price: '', department: '', category: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [trashed, setTrashed] = useState(loadTrash);

  useEffect(() => {
    localStorage.setItem(TRASH_KEY, JSON.stringify(trashed));
  }, [trashed]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    const success = await loginAdmin(password);
    if (success) {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_authenticated', 'true');
      toast.success('Sesión iniciada');
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
    if (!imageFile) {
      toast.error('Por favor selecciona una imagen.');
      return;
    }

    setIsProcessing(true);

    const imageUrl = await uploadImageToImgBB(imageFile);

    if (!imageUrl) {
      toast.error('Error al subir la imagen. Verifica tu API Key de ImgBB.');
      setIsProcessing(false);
      return;
    }

    const success = await createProduct({ ...product, imageUrl });

    if (success) {
      toast.success('¡Producto agregado con éxito!');
      setProduct({ name: '', price: '', department: '', category: '' });
      setImageFile(null);
      setImagePreview(null);
    } else {
      toast.error('Error al guardar en la base de datos.');
    }

    setIsProcessing(false);
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
        <button onClick={() => setTab('products')} className={tab === 'products' ? 'btn-accent' : 'btn-primary'} style={{ fontSize: '0.9rem' }}>
          Añadir Producto
        </button>
        <button onClick={() => setTab('orders')} className={tab === 'orders' ? 'btn-accent' : 'btn-primary'} style={{ fontSize: '0.9rem' }}>
          Pedidos
        </button>
        <button onClick={() => setTab('trash')} className={tab === 'trash' ? 'btn-accent' : 'btn-primary'} style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Trash2 size={16} /> Papelera {trashed.length > 0 && `(${trashed.length})`}
        </button>
      </div>

      {tab === 'products' && (
        <div className="premium-card" style={{ padding: '3rem', maxWidth: '800px', margin: '0 auto' }}>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>Añade nuevos productos a tu catálogo</p>
          <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input type="text" placeholder="Nombre del Producto" className="input-field" required value={product.name} onChange={e => setProduct({...product, name: e.target.value})} />
            <input type="number" placeholder="Precio ($)" className="input-field" required value={product.price} onChange={e => setProduct({...product, price: e.target.value})} />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <input type="text" placeholder="Departamento (Ej. Joyas)" className="input-field" required value={product.department} onChange={e => setProduct({...product, department: e.target.value})} />
              <input type="text" placeholder="Categoría (Ej. Anillos)" className="input-field" required value={product.category} onChange={e => setProduct({...product, category: e.target.value})} />
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
              <button onClick={handleClearTrash} className="btn-primary" style={{ background: 'var(--color-error)', fontSize: '0.85rem' }}>
                Vaciar Papelera
              </button>
            )}
          </div>
          {trashed.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
              No hay productos eliminados.
            </p>
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
