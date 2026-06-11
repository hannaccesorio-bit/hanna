import { useEffect, useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import PhotoCard from '../components/PhotoCard';
import AlertBanner from '../components/AlertBanner';
import SkeletonCard from '../components/SkeletonCard';
import { fetchProducts } from '../services/api';
import { useCart } from '../context/CartContext';

const Home = () => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('cat') || '');
  const [openDept, setOpenDept] = useState(null);

  useEffect(() => {
    const load = async () => {
      const data = await fetchProducts();
      setProducts(Array.isArray(data) ? data : []);
      setLoading(false);
    };
    load();
  }, []);

  const departments = useMemo(() => {
    const map = {};
    products.forEach(p => {
      const d = p.departamento || p.department || 'General';
      const c = p.categoria || p.category;
      if (!map[d]) map[d] = new Set();
      if (c && c !== d) map[d].add(c);
    });
    const result = [];
    for (const dep in map) {
      result.push({ name: dep, categories: Array.from(map[dep]) });
    }
    return result;
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const name = (p.nombre || p.name || '').toLowerCase();
      const ref = String(p.referencia || '').toLowerCase();
      const id = String(p.id || '');
      const matchesSearch = !searchQuery || name.includes(searchQuery.toLowerCase()) || ref.includes(searchQuery.toLowerCase()) || id.includes(searchQuery.toLowerCase());
      const matchesCategory = !categoryFilter ||
        (p.departamento || p.department || '').toLowerCase() === categoryFilter.toLowerCase() ||
        (p.categoria || p.category || '').toLowerCase() === categoryFilter.toLowerCase();
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, categoryFilter]);

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
          {departments.map((dep) => (
            <div key={dep.name} style={{ position: 'relative', display: 'inline-block' }}
              onMouseEnter={() => setOpenDept(dep.name)}
              onMouseLeave={() => setOpenDept(null)}
            >
              <button
                onClick={() => handleCategoryChange(dep.name)}
                className={categoryFilter === dep.name ? 'btn-accent' : 'btn-primary'}
                style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }}
              >
                {dep.name} {dep.categories.length > 0 && ' ▾'}
              </button>
              {openDept === dep.name && dep.categories.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-premium)', minWidth: '140px', padding: '0.4rem', zIndex: 50, animation: 'fadeIn 0.15s ease' }}>
                  {dep.categories.map(cat => (
                    <button key={cat}
                      onClick={() => handleCategoryChange(cat)}
                      style={{ display: 'block', width: '100%', padding: '0.4rem 0.8rem', border: 'none', background: categoryFilter === cat ? 'var(--color-accent)' : 'transparent', color: categoryFilter === cat ? '#111' : 'var(--color-text)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', textAlign: 'left', fontFamily: 'var(--font-sans)' }}
                      onMouseEnter={e => { if (categoryFilter !== cat) e.target.style.background = 'var(--color-bg)' }}
                      onMouseLeave={e => { if (categoryFilter !== cat) e.target.style.background = 'transparent' }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>
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
                onAddToCart={addToCart}
              />
            ))}
          </div>
        )}

      </section>

      <section style={{ padding: '2rem 0', textAlign: 'center' }}>
        <div className="premium-card" style={{ display: 'inline-flex', alignItems: 'center', gap: '2rem', padding: '1.5rem 2.5rem', margin: '0 auto' }}>
          <div>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Síguenos en</p>
            <a href="https://www.instagram.com/hannaccesorio/" target="_blank" rel="noopener noreferrer" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-accent)', textDecoration: 'none' }}>
              @hannaccesorio
            </a>
          </div>
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://www.instagram.com/hannaccesorio/" alt="QR Instagram" style={{ width: 80, height: 80, borderRadius: '8px' }} />
        </div>
      </section>
    </div>
  );
};

export default Home;
