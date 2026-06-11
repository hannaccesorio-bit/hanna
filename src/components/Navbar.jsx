import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Sun, Moon, Search, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import './Navbar.css';

const menuItems = [
  { label: 'Inicio', path: '/' },
];

const Navbar = ({ onSearch }) => {
  const { totalItems } = useCart();
  const { dark, toggleTheme } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [openMenu, setOpenMenu] = useState(null);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(query);
    navigate('/');
    setSearchOpen(false);
  };

  return (
    <nav className="premium-navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <span className="logo-icon">◆</span> HANNA ACCESORIOS
        </Link>

        <div className="nav-links">
          {menuItems.map((item) =>
            item.submenu ? (
              <div
                key={item.label}
                className="dropdown"
                onMouseEnter={() => setOpenMenu(item.label)}
                onMouseLeave={() => setOpenMenu(null)}
              >
                <Link to={item.path} className="nav-link dropdown-trigger">
                  {item.label} <ChevronDown size={14} />
                </Link>
                {openMenu === item.label && (
                  <div className="dropdown-menu">
                    {item.submenu.map((sub) => (
                      <Link key={sub.label} to={sub.path} className="dropdown-item" onClick={() => setOpenMenu(null)}>
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link key={item.label} to={item.path} className="nav-link">{item.label}</Link>
            )
          )}
        </div>

        <div className="nav-actions">
          {searchOpen ? (
            <form onSubmit={handleSearch} className="search-form">
              <input type="text" placeholder="Buscar productos..." value={query} onChange={(e) => setQuery(e.target.value)} className="input-field search-input" autoFocus />
              <button type="button" className="btn-icon" onClick={() => { setSearchOpen(false); setQuery(''); if (onSearch) onSearch(''); }}>
                <X size={20} />
              </button>
            </form>
          ) : (
            <button className="btn-icon" onClick={() => setSearchOpen(true)} aria-label="Buscar">
              <Search size={22} />
            </button>
          )}

          <button className="btn-icon" onClick={toggleTheme} aria-label={dark ? 'Modo claro' : 'Modo oscuro'}>
            {dark ? <Sun size={22} /> : <Moon size={22} />}
          </button>

          <a href="https://www.instagram.com/hannaccesorio/" target="_blank" rel="noopener noreferrer" className="btn-icon" aria-label="Instagram" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
            </svg>
          </a>

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
