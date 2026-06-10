import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 2rem', maxWidth: 600, margin: '0 auto' }}>
      <h1 style={{ fontSize: '6rem', color: 'var(--color-accent)', marginBottom: '0.5rem' }}>404</h1>
      <h2 style={{ marginBottom: '1rem' }}>Página no encontrada</h2>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
        La página que buscas no existe o ha sido movida.
      </p>
      <Link to="/" className="btn-accent" style={{ textDecoration: 'none' }}>
        Volver al inicio
      </Link>
    </div>
  );
}
