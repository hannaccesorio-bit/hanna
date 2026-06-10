import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
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
            style={{ marginBottom: '1rem' }}
          >
            Recargar página
          </button>
          <details style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
            <summary>Ver detalle técnico</summary>
            <pre style={{ textAlign: 'left', marginTop: '0.5rem', padding: '0.5rem', background: '#f5f5f5', borderRadius: '4px', overflowX: 'auto', fontSize: '0.75rem', color: '#333' }}>
              {this.state.error?.message || 'Error desconocido'}
              {'\n'}
              {this.state.error?.stack || ''}
            </pre>
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}
