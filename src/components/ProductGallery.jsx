import React, { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { fetchProducts } from '../services/api';
import PhotoCard from './PhotoCard';
import './ProductGallery.css';

const ProductGallery = ({ isAdmin = false, onDelete, onEdit }) => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      const data = await fetchProducts();
      if (Array.isArray(data)) {
        setProducts(data);
      }
      setLoading(false);
    };
    loadProducts();
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Cargando catálogo premium...</div>;
  }

  if (products.length === 0) {
    return <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>No hay productos destacados aún.</div>;
  }

  return (
    <div className="grid-gallery">
      {products.map(product => (
        <PhotoCard
          key={product.id || product.nombre}
          product={product}
          isAdmin={isAdmin}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
};

export default ProductGallery;
