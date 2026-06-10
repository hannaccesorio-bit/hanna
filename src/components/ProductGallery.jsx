import { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { fetchProducts } from '../services/api';
import PhotoCard from './PhotoCard';
import SkeletonCard from './SkeletonCard';
import './ProductGallery.css';

const ProductGallery = ({ isAdmin = false, onDelete, onEdit, searchQuery = '', categoryFilter = '' }) => {
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

  const filtered = products.filter((p) => {
    const name = (p.nombre || p.name || '').toLowerCase();
    const matchesSearch = !searchQuery || name.includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter ||
      (p.departamento || p.department || '').toLowerCase() === categoryFilter.toLowerCase() ||
      (p.categoria || p.category || '').toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="grid-gallery">
        {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
        {products.length === 0
          ? 'No hay productos destacados aún.'
          : 'No se encontraron productos con esos filtros.'}
      </div>
    );
  }

  return (
    <div className="grid-gallery">
      {filtered.map((product) => (
        <PhotoCard
          key={product.id || product.nombre}
          product={product}
          isAdmin={isAdmin}
          onDelete={onDelete}
          onEdit={onEdit}
          onAddToCart={addToCart}
        />
      ))}
    </div>
  );
};

export default ProductGallery;
