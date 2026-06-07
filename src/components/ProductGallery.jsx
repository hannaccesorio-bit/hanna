import React, { useEffect, useState } from 'react';
import Zoom from 'react-medium-image-zoom';
import { useCart } from '../context/CartContext';
import { fetchProducts } from '../services/api';
import './ProductGallery.css';

const ProductGallery = () => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      const data = await fetchProducts();
      // data should be an array of objects
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
        <div key={product.id || product.nombre} className="premium-card product-card">
          <div className="product-image-container">
            <Zoom>
              <img src={product.imagenUrl || product.imageUrl} alt={product.nombre || product.name} className="product-image" />
            </Zoom>
          </div>
          <div className="product-info">
            <h3 className="product-title">{product.nombre || product.name}</h3>
            <p className="product-price">${product.precio || product.price}</p>
            <button onClick={() => addToCart({
              id: product.id,
              name: product.nombre || product.name,
              price: product.precio || product.price,
              imageUrl: product.imagenUrl || product.imageUrl
            })} className="btn-primary add-to-cart-btn">
              Agregar al carrito
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductGallery;
