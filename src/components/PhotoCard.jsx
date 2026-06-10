import { Link } from 'react-router-dom';
import Zoom from 'react-medium-image-zoom';
import { MessageCircle } from 'lucide-react';
import './PhotoCard.css';

const PHONE = '584123853699';

const PhotoCard = ({ product, isAdmin = false, onDelete, onEdit, onAddToCart }) => {
  const name = product.nombre || product.name || 'Sin nombre';
  const price = product.precio || product.price || '0';
  const imageUrl = product.imagenUrl || product.imageUrl || '';
  const isNew = product.isNew || product.nuevaColeccion || false;
  const available = product.available !== undefined
    ? product.available
    : product.disponible !== undefined
      ? product.disponible
      : true;

  const whatsappMsg = `Hola Hannaccesorio! Me interesa este producto:%0A*${name}*%0APrecio: $${price}%0A%0A¿Está disponible?`;
  const shareMsg = `Mira este producto de Hannaccesorio:%0A${name} - $${price}`;
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
              <button className="admin-btn btn-edit" onClick={(e) => { e.preventDefault(); onEdit && onEdit(product); }} title="Editar">✎</button>
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
          <button className="btn-accent add-btn" onClick={() => onAddToCart({ id: product.id, name, price, imageUrl })}>
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
    </div>
  );
};

export default PhotoCard;
