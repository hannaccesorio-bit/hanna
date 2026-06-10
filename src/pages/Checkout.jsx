import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useCart } from '../context/CartContext';
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import { sendOrder } from '../services/api';
import toast from 'react-hot-toast';

const Checkout = () => {
  const { cart, totalItems, totalPrice, clearCart } = useCart();
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('HANNACCESORIO', 14, 22);
    doc.setFontSize(12);
    doc.text('TICKET DE COMPRA', 14, 30);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 38);
    doc.text(`Cliente: ${customer.name}`, 14, 50);
    doc.text(`Teléfono: ${customer.phone}`, 14, 56);
    doc.text(`Dirección: ${customer.address}`, 14, 62);

    const tableColumn = ["Producto", "Cantidad", "Precio Unitario", "Subtotal"];
    const tableRows = cart.map(item => [
      item.name,
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
    doc.save('factura_hannaccesorio.pdf');
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

      const message = `Hola Hannaccesorio!%0AQuiero realizar un pedido.%0A%0AMi nombre: ${customer.name}%0ATeléfono: ${customer.phone}%0ADirección: ${customer.address}%0A%0APedido:%0A${cart.map(item => `- ${item.quantity}x ${item.name} ($${item.price * item.quantity})`).join('%0A')}%0A%0A*Total: $${totalPrice}*%0A%0A¡Ya tengo la factura generada!`;
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
        <Helmet><title>Carrito - Hannaccesorio</title></Helmet>
        <h2>Tu carrito está vacío</h2>
        <p style={{ color: 'var(--color-text-muted)', marginTop: '1rem' }}>Agrega productos desde el catálogo para comenzar.</p>
      </div>
    );
  }

  return (
    <div>
      <Helmet><title>Finalizar Compra - Hannaccesorio</title></Helmet>
      <h2 style={{ marginBottom: '2rem' }}>Finalizar Compra ({totalItems} productos)</h2>
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '2 1 400px' }}>
          <h3 style={{ marginBottom: '1rem' }}>Tus Productos</h3>
          {cart.map(item => (
            <div key={item.id} className="premium-card" style={{ display: 'flex', padding: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
              <img src={item.imageUrl} alt={item.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
              <div style={{ flex: 1, marginLeft: '1rem' }}>
                <h4>{item.name}</h4>
                <p style={{ color: 'var(--color-text-muted)' }}>Cantidad: {item.quantity}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>${item.price * item.quantity}</p>
              </div>
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
