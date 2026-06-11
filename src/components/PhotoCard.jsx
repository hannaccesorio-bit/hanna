import { useState } from 'react';
import { Link } from 'react-router-dom';
import Zoom from 'react-medium-image-zoom';
import { MessageCircle, Plus, Minus } from 'lucide-react';
import toast from 'react-hot-toast';
import './PhotoCard.css';

const PHONE = '584123853699';

const PhotoCard = ({ product, isAdmin = false, onDelete, onAddToCart }) => {
  const [showModal, setShowModal] = useState(false);
  const [modalColor, setModalColor] = useState('');
  const [modalTalla, setModalTalla] = useState('');
  const [modalQty, setModalQty] = useState(1);
  const name = product.nombre || product.name || 'Sin nombre';
  const price = product.precio || product.price || '0';
  const imageUrl = product.imagenUrl || product.imageUrl || '';
  const isNew = product.isNew || product.nuevaColeccion || false;
  const available = product.available !== undefined
    ? product.available
    : product.disponible !== undefined
      ? product.disponible
      : true;

  const availableColors = String(product.colores || '').split(',').map(s => s.trim()).filter(Boolean);
  const availableTallas = String(product.tallas || '').split(',').map(s => s.trim()).filter(Boolean);
  const hasVariants = availableColors.length > 0 || availableTallas.length > 0;

  const handleAddClick = () => {
    if (hasVariants) {
      setModalColor(availableColors[0] || '');
      setModalTalla(availableTallas[0] || '');
      setModalQty(1);
      setShowModal(true);
    } else {
      onAddToCart({ id: product.id, name, price, imageUrl }, '', '', [], []);
      toast.success('Agregado al carrito');
    }
  };

  const handleConfirm = () => {
    onAddToCart(
      { ...product, name, price, imageUrl },
      modalColor,
      modalTalla,
      availableColors,
      availableTallas,
      modalQty
    );
    setShowModal(false);
    toast.success('Agregado al carrito');
  };

  const whatsappMsg = `Hola Hanna Accesorios! Me interesa este producto:%0A*${name}*%0APrecio: $${price}%0A%0A¿Está disponible?`;
  const shareMsg = `Mira este producto de Hanna Accesorios:%0A${name} - $${price}`;
  const productLink = `/producto/${product.id}`;

  return (
    <div className="photo-card">
      <Link to={productLink} className="photo-card-link">
        <div className="photo-card-image">
          {imageUrl ? (
            <Zoom>
              <img src={imageUrl} alt={name} loading="lazy" />
            </Zoom>
          ) : (
            <div className="photo-placeholder">📷</div>
          )}
          {isNew && <span className="badge new-badge">Nueva Colección</span>}
          {!available && <span className="badge out-badge">Agotado</span>}
          {isAdmin && (
            <div className="admin-buttons">
              <button className="admin-btn btn-delete" onClick={(e) => { e.preventDefault(); onDelete && onDelete(product); }} title="Eliminar">✕</button>

            </div>
          )}
        </div>
        <div className="photo-card-info">
          <h3 className="photo-card-title">{name}</h3>
          <p className="photo-card-price">${price}</p>
          <span className={`availability-badge ${available ? 'in-stock' : 'out-of-stock'}`}>
            {available ? 'Disponible' : 'Agotado'}
          </span>
        </div>
      </Link>
      <div className="photo-card-actions">
        {onAddToCart && available && (
          <button className="btn-accent add-btn" onClick={handleAddClick}>
            Agregar al carrito
          </button>
        )}
        <button
          className="btn-whatsapp"
          onClick={() => window.open(`https://wa.me/${PHONE}?text=${whatsappMsg}`, '_blank')}
        >
          <MessageCircle size={16} /> Consultar
        </button>
        <button
          className="share-btn"
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: name, text: shareMsg, url: window.location.href });
            } else {
              window.open(`https://wa.me/?text=${encodeURIComponent(shareMsg + ' ' + window.location.href)}`, '_blank');
            }
          }}
        >
          Compartir
        </button>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '340px' }}>
            <h3 style={{ marginBottom: '1rem' }}>Personalizar {name}</h3>
            {availableColors.length > 0 && (
              <div style={{ marginBottom: '0.8rem' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Color:</p>
                <select className="input-field" value={modalColor} onChange={e => setModalColor(e.target.value)} style={{ width: '100%' }}>
                  {availableColors.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            )}
            {availableTallas.length > 0 && (
              <div style={{ marginBottom: '0.8rem' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Talla:</p>
                <select className="input-field" value={modalTalla} onChange={e => setModalTalla(e.target.value)} style={{ width: '100%' }}>
                  {availableTallas.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            )}
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Cantidad:</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button className="qty-btn" onClick={() => setModalQty(Math.max(1, modalQty - 1))}><Minus size={14} /></button>
                <span style={{ minWidth: '2rem', textAlign: 'center', fontWeight: 600 }}>{modalQty}</span>
                <button className="qty-btn" onClick={() => setModalQty(modalQty + 1)}><Plus size={14} /></button>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn-primary" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Cancelar</button>
              <button className="btn-accent" onClick={handleConfirm} style={{ flex: 1 }}>Agregar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoCard;
