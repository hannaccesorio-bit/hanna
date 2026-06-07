import React from 'react';
import ProductGallery from '../components/ProductGallery';

const Home = () => {
  return (
    <div>
      <section className="hero-section">
        <div className="hero-overlay">
          <h1 className="hero-title">Nueva Colección</h1>
          <p className="hero-subtitle">
            Descubre los accesorios más exclusivos y premium diseñados para deslumbrar.
          </p>
          <a href="#colecciones" className="btn-accent" style={{ marginTop: '2rem' }}>Ver Catálogo</a>
        </div>
      </section>
      
      <section style={{ padding: '4rem 0' }} id="colecciones">
        <h2 style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center' }}>Destacados</h2>
        <ProductGallery />
      </section>
    </div>
  );
};

export default Home;
