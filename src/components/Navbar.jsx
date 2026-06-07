import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const { totalItems } = useCart();

  return (
    <nav className="premium-navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          HANNACCESORIO
        </Link>
        <div className="nav-links">
          <Link to="/" className="nav-link">Inicio</Link>
          <Link to="/#colecciones" className="nav-link">Nueva Colección</Link>
        </div>
        <div className="nav-actions">
          <Link to="/checkout" className="cart-btn">
            <ShoppingBag size={24} />
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </Link>
          <Link to="/admin" className="admin-btn">
            <User size={24} />
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
