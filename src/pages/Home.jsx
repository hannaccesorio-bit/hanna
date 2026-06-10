import { useEffect, useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import PhotoCard from '../components/PhotoCard';
import AlertBanner from '../components/AlertBanner';
import SkeletonCard from '../components/SkeletonCard';
import { fetchProducts, deleteProduct as deleteProductApi } from '../services/api';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const Home = () => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('cat') || '');
  const [isAdmin] = useState(() => sessionStorage.getItem('admin_authenticated') === 'true');
  const [editProduct, setEditProduct] = useState(null);

  useEffect(() => {
    const load = async () => {
      const data = await fetchProducts();
      setProducts(Array.isArray(data) ? data : []);
      setLoading(false);
    };
    load();
  }, []);

  const categories = useMemo(() => {
    const cats = new Set();
    products.forEach(p => {
      const d = p.departamento || p.department;
      const c = p.categoria || p.category;
      if (d) cats.add(d);
      if (c) cats.add(c);
    });
    return Array.from(cats);
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const name = (p.nombre || p.name || '').toLowerCase();
      const ref = (p.referencia || '').toLowerCase();
      const id = String(p.id || '');
      const matchesSearch = !searchQuery || name.includes(searchQuery.toLowerCase()) || ref.includes(searchQuery.toLowerCase()) || id.includes(searchQuery.toLowerCase());
      const matchesCategory = !categoryFilter ||
        (p.departamento || p.department || '').toLowerCase() === categoryFilter.toLowerCase() ||
        (p.categoria || p.category || '').toLowerCase() === categoryFilter.toLowerCase();
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, categoryFilter]);

  const handleDelete = async (product) => {
    if (window.confirm(`¿Eliminar "${product.nombre || product.name}"?`)) {
      const ok = await deleteProductApi(product.id);
      if (ok) {
        setProducts(prev => prev.filter(p => p.id !== product.id));
        toast.success('Producto eliminado');
      } else {
        const trash = JSON.parse(localStorage.getItem('hanna_trashed_products') || '[]');
        trash.push(product);
        localStorage.setItem('hanna_trashed_products', JSON.stringify(trash));
        setProducts(prev => prev.filter(p => p.id !== product.id));
        toast('Producto movido a la papelera (local)', { icon: '🗑️' });
      }
    }
  };

  const handleEdit = (product) => {
    setEditProduct(product);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editProduct) return;
    const ok = await deleteProductApi(editProduct.id);
    if (ok) {
      toast.success('Producto actualizado (requiere reconexión del backend)');
      setEditProduct(null);
    } else {
      toast.error('Error al actualizar');
    }
  };

  const handleSearchChange = (q) => {
    setSearchQuery(q);
    if (q) setSearchParams({ q });
    else setSearchParams({});
  };

  const handleCategoryChange = (cat) => {
    setCategoryFilter(cat === categoryFilter ? '' : cat);
    if (cat) setSearchParams({ cat });
    else setSearchParams({});
  };

  return (
    <div>
      <Helmet>
        <title>Hanna Accesorios - Catálogo Premium</title>
        <meta name="description" content="Descubre los accesorios más exclusivos y premium diseñados para deslumbrar." />
      </Helmet>

      <section className="hero-banner-container">
        <div className="hero-section" style={{ backgroundImage: 'url(https://www.mojecafe.pl/wp-content/uploads/2024/12/co-oznaczaja-dwie-obraczki-na-palcu-1.png)' }}>
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

      <section style={{ padding: '4rem 0' }} id="colecciones">
        <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', textAlign: 'center' }}>Colección</h2>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '2rem' }}>
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="input-field search-input"
            style={{ maxWidth: '300px', paddingLeft: '1rem' }}
          />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={categoryFilter === cat ? 'btn-accent' : 'btn-primary'}
              style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="thumbnail-grid">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>
            {products.length === 0 ? 'No hay productos destacados aún.' : 'No se encontraron productos con esos filtros.'}
          </p>
        ) : (
          <div className="thumbnail-grid">
            {filtered.map((product) => (
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

      {editProduct && (
        <div className="modal-overlay" onClick={() => setEditProduct(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Editar Producto</h3>
            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <input className="input-field" defaultValue={editProduct.nombre || editProduct.name} placeholder="Nombre" />
              <input className="input-field" defaultValue={editProduct.precio || editProduct.price} placeholder="Precio" type="number" />
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-primary" onClick={() => setEditProduct(null)}>Cancelar</button>
                <button type="submit" className="btn-accent">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
