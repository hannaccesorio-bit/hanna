import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { loginAdmin, createProduct, uploadImageToImgBB, recoverPassword } from '../services/api';
import AdminOrders from './AdminOrders';
import toast from 'react-hot-toast';

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [tab, setTab] = useState('products');

  const [product, setProduct] = useState({ name: '', price: '', department: '', category: '' });
  const [imageFile, setImageFile] = useState(null);

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
    } else {
      toast.error('Error al guardar en la base de datos.');
    }

    setIsProcessing(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="premium-card" style={{ padding: '3rem', maxWidth: '400px', margin: '4rem auto', textAlign: 'center' }}>
        <Helmet><title>Admin - Hannaccesorio</title></Helmet>
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
      <Helmet><title>Panel Admin - Hannaccesorio</title></Helmet>
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
            <div style={{ border: '1px dashed var(--color-border)', padding: '2rem', textAlign: 'center', borderRadius: '8px' }}>
              <label style={{ cursor: 'pointer', color: 'var(--color-primary)' }}>
                <strong>Seleccionar Imagen (Alta Calidad)</strong>
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setImageFile(e.target.files[0])} />
              </label>
              {imageFile && <p style={{ marginTop: '1rem', color: 'var(--color-success)' }}>{imageFile.name}</p>}
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
    </div>
  );
};

export default Admin;
