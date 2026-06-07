import React, { useState } from 'react';
import { loginAdmin, createProduct, uploadImageToImgBB, recoverPassword } from '../services/api';

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Product Form State
  const [product, setProduct] = useState({ name: '', price: '', department: '', category: '' });
  const [imageFile, setImageFile] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    const success = await loginAdmin(password);
    if (success) {
      setIsAuthenticated(true);
    } else {
      alert("Contraseña incorrecta o error de conexión.");
    }
    setIsProcessing(false);
  };

  const handleRecoverPassword = async () => {
    setIsProcessing(true);
    const success = await recoverPassword();
    if (success) {
      alert("Si el sistema está configurado, hemos enviado la contraseña a hannaccesorio@gmail.com.");
    } else {
      alert("Hubo un error al intentar enviar el correo de recuperación.");
    }
    setIsProcessing(false);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      alert("Por favor selecciona una imagen.");
      return;
    }

    setIsProcessing(true);
    
    // 1. Subir imagen a ImgBB
    const imageUrl = await uploadImageToImgBB(imageFile);
    
    if (!imageUrl) {
      alert("Error al subir la imagen. Verifica tu API Key de ImgBB.");
      setIsProcessing(false);
      return;
    }

    // 2. Guardar producto en Google Sheets
    const success = await createProduct({
      ...product,
      imageUrl
    });

    if (success) {
      alert("¡Producto agregado con éxito!");
      setProduct({ name: '', price: '', department: '', category: '' });
      setImageFile(null);
    } else {
      alert("Error al guardar en la base de datos.");
    }

    setIsProcessing(false);
  };

  if (isAuthenticated) {
    return (
      <div className="premium-card" style={{ padding: '3rem', maxWidth: '800px', margin: '2rem auto' }}>
        <h2>Panel de Control</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>Añade nuevos productos a tu catálogo</p>
        
        <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input 
            type="text" placeholder="Nombre del Producto" className="input-field" required 
            value={product.name} onChange={e => setProduct({...product, name: e.target.value})} 
          />
          <input 
            type="number" placeholder="Precio ($)" className="input-field" required 
            value={product.price} onChange={e => setProduct({...product, price: e.target.value})} 
          />
          <div style={{ display: 'flex', gap: '1rem' }}>
            <input 
              type="text" placeholder="Departamento (Ej. Joyas)" className="input-field" required 
              value={product.department} onChange={e => setProduct({...product, department: e.target.value})} 
            />
            <input 
              type="text" placeholder="Categoría (Ej. Anillos)" className="input-field" required 
              value={product.category} onChange={e => setProduct({...product, category: e.target.value})} 
            />
          </div>
          
          <div style={{ border: '1px dashed var(--color-border)', padding: '2rem', textAlign: 'center', borderRadius: '8px' }}>
            <label style={{ cursor: 'pointer', color: 'var(--color-primary)' }}>
              <strong>Seleccionar Imagen (Alta Calidad)</strong>
              <input 
                type="file" 
                accept="image/*" 
                style={{ display: 'none' }} 
                onChange={e => setImageFile(e.target.files[0])} 
              />
            </label>
            {imageFile && <p style={{ marginTop: '1rem', color: 'var(--color-success)' }}>{imageFile.name}</p>}
          </div>

          <button type="submit" className="btn-accent" disabled={isProcessing}>
            {isProcessing ? 'Subiendo Producto...' : 'Guardar Producto'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="premium-card" style={{ padding: '3rem', maxWidth: '400px', margin: '4rem auto', textAlign: 'center' }}>
      <h2>Acceso Administrador</h2>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>Inicia sesión para gestionar tu catálogo</p>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input 
          type="password" 
          placeholder="Contraseña Maestra" 
          className="input-field" 
          value={password}
          onChange={e => setPassword(e.target.value)}
          required 
        />
        <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={isProcessing}>
          {isProcessing ? 'Cargando...' : 'Ingresar'}
        </button>
      </form>
      <button 
        onClick={handleRecoverPassword}
        disabled={isProcessing}
        style={{ 
          background: 'none', 
          border: 'none', 
          color: 'var(--color-accent)', 
          marginTop: '1rem', 
          cursor: 'pointer',
          textDecoration: 'underline'
        }}
      >
        ¿Olvidaste tu contraseña?
      </button>
    </div>
  );
};

export default Admin;
