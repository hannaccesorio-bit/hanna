import { MapPin, Phone, Camera, MessageCircle, Globe } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="premium-footer">
      <div className="footer-container">

        <div className="footer-section">
          <h3 className="footer-title">Nuestra Visión</h3>
          <p className="footer-text">
            Brindar elegancia y distinción a través de accesorios de joyería exclusivos.
            Creemos que cada detalle cuenta para resaltar tu belleza natural con piezas únicas y de la más alta calidad.
          </p>
        </div>

        <div className="footer-section">
          <h3 className="footer-title">Contacto</h3>
          <ul className="footer-list">
            <li>
              <MapPin size={18} className="footer-icon" />
              <span>Avenida Urdaneta, Caracas, Venezuela</span>
            </li>
            <li>
              <Phone size={18} className="footer-icon" />
              <span>+58 412-3853699</span>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3 className="footer-title">Redes Sociales</h3>
          <div className="social-links">
            <a href="https://instagram.com/hannaccesorio" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Instagram">
              <Camera size={24} />
            </a>
            <a href="https://facebook.com/hannaccesorio" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Facebook">
              <Globe size={24} />
            </a>
            <a href="https://wa.me/584123853699" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="WhatsApp">
              <MessageCircle size={24} />
            </a>
          </div>
        </div>

      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Hannaccesorio. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
