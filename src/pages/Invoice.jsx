import { useLocation } from 'react-router-dom';

// Simple invoice view – in real app replace with proper data fetching
export default function Invoice() {
  const { state } = useLocation();
  const invoice = state?.invoice || { id: '0001', items: [], total: 0 };

  return (
    <div className="invoice-page" style={{ padding: '2rem' }}>
      <h2>Factura #{invoice.id}</h2>
      <ul>
        {invoice.items.map((item, idx) => (
          <li key={idx}>
            {item.name} - ${item.price} × {item.quantity}
          </li>
        ))}
      </ul>
      <h3>Total: ${invoice.total}</h3>
    </div>
  );
}
