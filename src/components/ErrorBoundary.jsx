import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Algo salió mal</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
            Ocurrió un error inesperado. Por favor recarga la página.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Recargar página
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
