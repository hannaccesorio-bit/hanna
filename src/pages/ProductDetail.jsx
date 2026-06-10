import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Zoom from 'react-medium-image-zoom';
import { ShoppingCart, MessageCircle, Minus, Plus, ChevronRight, ArrowLeft } from 'lucide-react';
import { fetchProducts } from '../services/api';
import { useCart } from '../context/CartContext';
import PhotoCard from '../components/PhotoCard';
import toast from 'react-hot-toast';

const PHONE = '584123853699';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const load = async () => {
      const data = await fetchProducts();
      setProducts(Array.isArray(data) ? data : []);
      setLoading(false);
    };
    load();
  }, []);

  const product = useMemo(() => {
    return products.find(p => p.id === id || p.id?.toString() === id);
  }, [products, id]);

  const related = useMemo(() => {
    if (!product) return [];
    const department = product.departamento || product.department || '';
    const category = product.categoria || product.category || '';
    return products.filter(p => {
      if (p.id === product.id) return false;
      const d = p.departamento || p.department || '';
      const c = p.categoria || p.category || '';
      return d === department || c === category;
    }).slice(0, 4);
  }, [products, product]);

  const cartItem = cart.find(i => i.id === product?.id);

  const handleAdd = () => {
    if (!product) return;
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.nombre || product.name,
        price: product.precio || product.price,
        imageUrl: product.imagenUrl || product.imageUrl,
      });
    }
    toast.success(`${quantity}x ${product.nombre || product.name} agregado al carrito`);
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div className="product-detail-layout">
          <div className="skeleton-image" style={{ height: 400, borderRadius: 'var(--radius-lg)' }} />
          <div>
            <div className="skeleton-line" style={{ width: '60%', height: 28, marginBottom: 16 }} />
            <div className="skeleton-line" style={{ width: '30%', height: 24, marginBottom: 16 }} />
            <div className="skeleton-line" style={{ width: '100%', height: 16, marginBottom: 8 }} />
            <div className="skeleton-line" style={{ width: '80%', height: 16, marginBottom: 24 }} />
            <div className="skeleton-line" style={{ width: '50%', height: 48 }} />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <h2>Producto no encontrado</h2>
        <Link to="/" className="btn-accent" style={{ marginTop: '1rem', display: 'inline-block', textDecoration: 'none' }}>
          Volver al catálogo
        </Link>
      </div>
    );
  }

  const name = product.nombre || product.name || 'Sin nombre';
  const price = product.precio || product.price || '0';
  const imageUrl = product.imagenUrl || product.imageUrl || '';
  const isNew = product.isNew || product.nuevaColeccion || false;
  const available = product.available ?? product.disponible ?? true;
  const department = product.departamento || product.department || '';
  const category = product.categoria || product.category || '';
  const description = product.descripcion || product.description || '';
  const originalPrice = product.precioOriginal || product.originalPrice;
  const hasDiscount = originalPrice && Number(originalPrice) > Number(price);
  const sku = product.referencia || product.sku || product.id || '';

  const whatsappMsg = `Hola Hanna Accesorios! Me interesa este producto:%0A*${name}*%0APrecio: $${price}%0ACódigo: ${sku}%0A%0A¿Está disponible?`;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <Helmet>
        <title>{name} - Hanna Accesorios</title>
        <meta name="description" content={`${name} - ${price} en Hannaccesorio. ${description}`} />
        <meta property="og:title" content={`${name} - Hanna Accesorios`} />
        <meta property="og:description" content={description || `${name} - Precio: $${price}`} />
        {imageUrl && <meta property="og:image" content={imageUrl} />}
      </Helmet>

      <nav className="breadcrumbs">
        <Link to="/">Inicio</Link>
        {department && <><ChevronRight size={14} /><Link to="/">{department}</Link></>}
        {category && category !== department && <><ChevronRight size={14} /><Link to="/">{category}</Link></>}
        <ChevronRight size={14} />
        <span>{name}</span>
      </nav>

      <div className="product-detail-layout">
        <div className="product-detail-image">
          {imageUrl ? (
            <Zoom>
              <img src={imageUrl} alt={name} />
            </Zoom>
          ) : (
            <div className="photo-placeholder" style={{ height: 400 }}>📷</div>
          )}
          {isNew && <span className="badge new-badge" style={{ position: 'absolute', top: 12, left: 12 }}>Nueva Colección</span>}
        </div>

        <div className="product-detail-info">
          <h1 className="product-detail-title">{name}</h1>

          {hasDiscount ? (
            <div className="product-detail-price">
              <span className="price-original">${originalPrice}</span>
              <span className="price-current">${price}</span>
            </div>
          ) : (
            <div className="product-detail-price">
              <span className="price-current">${price}</span>
            </div>
          )}

          <div className="product-detail-actions">
            <div className="quantity-selector">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1} className="qty-btn">
                <Minus size={16} />
              </button>
              <span className="qty-value">{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)} className="qty-btn">
                <Plus size={16} />
              </button>
            </div>

            <button className="btn-accent add-to-cart-btn" onClick={handleAdd} disabled={!available}>
              <ShoppingCart size={18} />
              {available ? (cartItem ? 'Agregar más' : 'Agregar al carrito') : 'Agotado'}
            </button>

            <button className="btn-whatsapp detail-whatsapp" onClick={() => window.open(`https://wa.me/${PHONE}?text=${whatsappMsg}`, '_blank')}>
              <MessageCircle size={18} /> Consultar por WhatsApp
            </button>
          </div>

          {available && (
            <div className="stock-info">
              <span className="availability-badge in-stock">Disponible</span>
            </div>
          )}

          {description && (
            <div className="product-description">
              <h3>Descripción</h3>
              <p>{description}</p>
            </div>
          )}

          <div className="product-meta">
            {sku && <p><strong>SKU:</strong> {sku}</p>}
            {department && <p><strong>Categoría:</strong> <Link to="/">{department}</Link>{category && category !== department && <>, <Link to="/">{category}</Link></>}</p>}
          </div>

          {cartItem && (
            <div className="cart-notice">
              Ya tienes <strong>{cartItem.quantity}</strong> {cartItem.quantity === 1 ? 'unidad' : 'unidades'} en tu carrito.
              <Link to="/checkout" style={{ color: 'var(--color-accent)', marginLeft: 4 }}>Ver carrito</Link>
            </div>
          )}
        </div>
      </div>

      <button onClick={() => navigate(-1)} className="btn-back">
        <ArrowLeft size={16} /> Volver
      </button>

      {related.length > 0 && (
        <section style={{ marginTop: '4rem' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>Productos Relacionados</h3>
          <div className="thumbnail-grid">
            {related.map(p => (
              <PhotoCard
                key={p.id || p.nombre}
                product={p}
                onAddToCart={addToCart}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
