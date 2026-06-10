import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useCart } from '../context/CartContext';
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import { sendOrder } from '../services/api';
import { Plus, Minus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Checkout = () => {
  const { cart, totalItems, totalPrice, clearCart, updateQuantity, removeFromCart, updateCartItem } = useCart();
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('HANNA ACCESORIOS', 14, 22);
    doc.setFontSize(12);
    doc.text('TICKET DE COMPRA', 14, 30);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 38);
    doc.text(`Cliente: ${customer.name}`, 14, 50);
    doc.text(`Teléfono: ${customer.phone}`, 14, 56);
    doc.text(`Dirección: ${customer.address}`, 14, 62);

    const tableColumn = ["Producto", "Color/Talla", "Cantidad", "Precio Unitario", "Subtotal"];
    const tableRows = cart.map(item => [
      item.name,
      [item.selectedColor, item.selectedTalla].filter(Boolean).join(' / ') || '-',
      item.quantity.toString(),
      `$${item.price}`,
      `$${item.price * item.quantity}`
    ]);

    autoTable(doc, {
      startY: 70,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [212, 175, 55] },
    });

    const finalY = doc.lastAutoTable.finalY || 70;
    doc.setFontSize(14);
    doc.text(`Total a Pagar: $${totalPrice}`, 14, finalY + 15);
    doc.save('factura_hanna_accesorios.pdf');
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!customer.name || !customer.phone) {
      toast.error('Por favor ingresa tu nombre y teléfono.');
      return;
    }

    setIsProcessing(true);

    try {
      generatePDF();
      toast.success('Factura generada');

      const orderResult = await sendOrder({ customer, cart, totalPrice, date: new Date().toISOString() });
      if (!orderResult) {
        toast('No se pudo guardar en la nube, pero tu pedido se enviará por WhatsApp', { icon: '⚠️' });
      }

      const message = `Hola Hanna Accesorios!%0AQuiero realizar un pedido.%0A%0AMi nombre: ${customer.name}%0ATeléfono: ${customer.phone}%0ADirección: ${customer.address}%0A%0APedido:%0A${cart.map(item => {
        const variant = [item.selectedColor, item.selectedTalla].filter(Boolean).join(' - ');
        return `- ${item.quantity}x ${item.name}${variant ? ' (' + variant + ')' : ''} ($${item.price * item.quantity})`;
      }).join('%0A')}%0A%0A*Total: $${totalPrice}*%0A%0A¡Ya tengo la factura generada!`;
      window.open(`https://wa.me/584123853699?text=${message}`, '_blank');

      clearCart();
      toast.success('Pedido enviado con éxito');
    } catch (err) {
      toast.error(`Error: ${err.message || 'Intenta de nuevo'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <Helmet><title>Carrito - Hanna Accesorios</title></Helmet>
        <h2>Tu carrito está vacío</h2>
        <p style={{ color: 'var(--color-text-muted)', marginTop: '1rem' }}>Agrega productos desde el catálogo para comenzar.</p>
      </div>
    );
  }

  return (
    <div>
      <Helmet><title>Finalizar Compra - Hanna Accesorios</title></Helmet>
      <h2 style={{ marginBottom: '2rem' }}>Finalizar Compra ({totalItems} productos)</h2>
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '2 1 400px' }}>
          <h3 style={{ marginBottom: '1rem' }}>Tus Productos</h3>
          {cart.map(item => (
            <div key={item.cartKey} className="premium-card" style={{ padding: '1rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img src={item.imageUrl} alt={item.name} style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '8px' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</h4>
                  <p style={{ color: 'var(--color-accent)', fontWeight: 700, marginTop: '0.2rem' }}>${item.price}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <button className="qty-btn" onClick={() => updateQuantity(item.cartKey, item.quantity - 1)} style={{ padding: '0.4rem 0.6rem' }}>
                    <Minus size={14} />
                  </button>
                  <span className="qty-value" style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem', minWidth: '2rem' }}>{item.quantity}</span>
                  <button className="qty-btn" onClick={() => updateQuantity(item.cartKey, item.quantity + 1)} style={{ padding: '0.4rem 0.6rem' }}>
                    <Plus size={14} />
                  </button>
                </div>
                <div style={{ textAlign: 'right', minWidth: '70px' }}>
                  <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>${item.price * item.quantity}</p>
                </div>
                <button onClick={() => { removeFromCart(item.cartKey); toast('Producto eliminado', { icon: '🗑️' }); }} className="btn-icon" style={{ color: 'var(--color-error)' }}>
                  <Trash2 size={18} />
                </button>
              </div>
              {(item.availableColors?.length > 0 || item.availableTallas?.length > 0) && (
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)', flexWrap: 'wrap' }}>
                  {item.availableColors?.length > 0 && (
                    <div>
                      <p style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Color:</p>
                      <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                        {item.availableColors.map(c => (
                          <button key={c} onClick={() => updateCartItem(item.cartKey, { selectedColor: c })} className={item.selectedColor === c ? 'btn-accent' : 'btn-primary'} style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}>
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {item.availableTallas?.length > 0 && (
                    <div>
                      <p style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Talla:</p>
                      <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                        {item.availableTallas.map(t => (
                          <button key={t} onClick={() => updateCartItem(item.cartKey, { selectedTalla: t })} className={item.selectedTalla === t ? 'btn-accent' : 'btn-primary'} style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}>
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          <p style={{ fontWeight: 'bold', fontSize: '1.3rem', textAlign: 'right', marginTop: '1rem' }}>
            Total: ${totalPrice}
          </p>
        </div>
        <div className="premium-card" style={{ flex: '1 1 300px', padding: '2rem', height: 'fit-content' }}>
          <h3>Datos de Envío</h3>
          <form onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            <input type="text" placeholder="Nombre Completo" className="input-field" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} required />
            <input type="tel" placeholder="Teléfono / WhatsApp" className="input-field" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} required />
            <input type="text" placeholder="Dirección de Envío" className="input-field" value={customer.address} onChange={e => setCustomer({...customer, address: e.target.value})} />

            <hr style={{ margin: '1rem 0', borderColor: 'var(--color-border)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.5rem', marginBottom: '1rem' }}>
              <span>Total</span>
              <span>${totalPrice}</span>
            </div>
            <button type="submit" className="btn-accent" style={{ width: '100%' }} disabled={isProcessing}>
              {isProcessing ? 'Procesando...' : 'Confirmar y Enviar por WhatsApp'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
