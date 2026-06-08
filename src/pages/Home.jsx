import React, { useEffect, useState } from 'react';
import PhotoCard from '../components/PhotoCard';
import AlertBanner from '../components/AlertBanner';
import { fetchProducts } from '../services/api';
import { useCart } from '../context/CartContext';

// Temporary admin flag – replace with real auth logic later
const isAdmin = true;

const Home = () => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      const data = await fetchProducts();
      setProducts(Array.isArray(data) ? data : []);
      setLoading(false);
    };
    loadProducts();
  }, []);

  const handleDelete = (product) => {
    // Placeholder – integrate with backend delete API
    if (window.confirm(`¿Eliminar "${product.nombre || product.name}"?`)) {
      setProducts(prev => prev.filter(p => p.id !== product.id));
    }
  };

  const handleEdit = (product) => {
    // Placeholder – open edit modal
    alert(`Editar: ${product.nombre || product.name}`);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', fontSize: '1.2rem', color: 'var(--color-text-muted)' }}>
        Cargando catálogo premium...
      </div>
    );
  }

  return (
    <div>
      {/* Hero banner full-width 16:9 */}
      <section className="hero-banner-container">
        <div className="hero-section">
          <div className="hero-overlay">
            <h1 className="hero-title">Nueva Colección</h1>
            <p className="hero-subtitle">
              Descubre los accesorios más exclusivos y premium diseñados para deslumbrar.
            </p>
            <a href="#colecciones" className="btn-accent" style={{ marginTop: '2rem' }}>Ver Catálogo</a>
          </div>
        </div>
        <AlertBanner message="✨ ¡Acceso exclusivo! Solo para usuarios premium." />
      </section>

      {/* Destacados grid */}
      <section style={{ padding: '4rem 0' }} id="colecciones">
        <h2 style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center' }}>Destacados</h2>

        {products.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>No hay productos destacados aún.</p>
        ) : (
          <div className="thumbnail-grid">
            {products.map(product => (
              <PhotoCard
                key={product.id || product.nombre}
                product={product}
                isAdmin={isAdmin}
                onDelete={handleDelete}
                onEdit={handleEdit}
                onAddToCart={addToCart}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
