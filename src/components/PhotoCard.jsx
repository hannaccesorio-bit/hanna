import React from 'react';
import './PhotoCard.css';

const PhotoCard = ({ product, isAdmin = false, onDelete, onEdit, onAddToCart }) => {
  // Normalize field names (API returns Spanish keys)
  const name = product.nombre || product.name || 'Sin nombre';
  const price = product.precio || product.price || '0';
  const imageUrl = product.imagenUrl || product.imageUrl || '';
  const isNew = product.isNew || product.nuevaColeccion || false;
  const available = product.available !== undefined
    ? product.available
    : product.disponible !== undefined
      ? product.disponible
      : true;

  return (
    <div className="photo-card">
      <div className="photo-card-image">
        {imageUrl && <img src={imageUrl} alt={name} />}
        {!imageUrl && <div className="photo-placeholder">📷</div>}
        {isNew && <span className="badge new-badge">Nueva Colección</span>}
        {isAdmin && (
          <div className="admin-buttons">
            <button
              className="admin-btn btn-delete"
              onClick={() => onDelete && onDelete(product)}
              title="Eliminar foto"
            >✕</button>
            <button
              className="admin-btn btn-edit"
              onClick={() => onEdit && onEdit(product)}
              title="Editar datos"
            >✎</button>
          </div>
        )}
      </div>
      <div className="photo-card-info">
        <h3 className="photo-card-title">{name}</h3>
        <p className="photo-card-price">${price}</p>
        <span className={`availability-badge ${available ? 'in-stock' : 'out-of-stock'}`}>
          {available ? 'Disponible' : 'Agotado'}
        </span>
        {onAddToCart && (
          <button
            className="btn-accent add-btn"
            onClick={() => onAddToCart({
              id: product.id,
              name,
              price,
              imageUrl
            })}
          >
            Agregar al carrito
          </button>
        )}
      </div>
    </div>
  );
};

export default PhotoCard;
