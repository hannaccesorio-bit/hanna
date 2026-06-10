import { useEffect, useState } from 'react';
import { fetchOrders } from '../services/api';
import { Package, CheckCircle, XCircle, Clock } from 'lucide-react';

const statusIcons = { pending: <Clock size={16} />, completed: <CheckCircle size={16} />, cancelled: <XCircle size={16} /> };
const statusColors = { pending: '#F59E0B', completed: '#10B981', cancelled: '#EF4444' };

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await fetchOrders();
      setOrders(Array.isArray(data) ? data : []);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>Cargando pedidos...</div>;
  }

  if (orders.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
        <Package size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
        <p>No hay pedidos registrados aún.</p>
      </div>
    );
  }

  return (
    <div>
      <h3 style={{ marginBottom: '1.5rem' }}>Pedidos Recibidos ({orders.length})</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {orders.map((order, idx) => (
          <div key={order.id || idx} className="premium-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <strong>#{order.id || idx + 1}</strong>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.8rem',
                fontWeight: 600, background: statusColors[order.status] + '20',
                color: statusColors[order.status]
              }}>
                {statusIcons[order.status] || <Clock size={16} />}
                {(order.status || 'pending').toUpperCase()}
              </span>
            </div>
            <p><strong>Cliente:</strong> {order.customer?.name || order.name || 'N/A'}</p>
            <p><strong>Teléfono:</strong> {order.customer?.phone || order.phone || 'N/A'}</p>
            <p><strong>Dirección:</strong> {order.customer?.address || order.address || 'N/A'}</p>
            <p><strong>Fecha:</strong> {order.date ? new Date(order.date).toLocaleString() : 'N/A'}</p>
            <p><strong>Total:</strong> ${order.totalPrice || order.total || 0}</p>
            {order.cart?.length > 0 && (
              <details style={{ marginTop: '0.5rem' }}>
                <summary style={{ cursor: 'pointer', color: 'var(--color-accent)' }}>Ver productos ({order.cart.length})</summary>
                <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                  {order.cart.map((item, i) => (
                    <li key={i}>{item.quantity}x {item.name} — ${item.price * item.quantity}</li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
