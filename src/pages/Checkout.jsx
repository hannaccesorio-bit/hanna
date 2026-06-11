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
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '', cedula: '', ciudad: '', pais: '', empresaEnvio: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  const generatePDF = (includeRef = false) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('HANNA ACCESORIOS', 14, 22);
    doc.setFontSize(12);
    doc.text('TICKET DE COMPRA', 14, 30);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 38);

    doc.setFontSize(10);
    doc.text('DATOS DEL CLIENTE', 14, 48);
    doc.text(`Nombre: ${customer.name}`, 14, 54);
    doc.text(`Teléfono: ${customer.phone}`, 14, 60);
    doc.text(`Cédula/RIF: ${customer.cedula}`, 14, 66);
    doc.text(`Dirección: ${customer.address}`, 14, 72);
    doc.text(`Ciudad: ${customer.ciudad}`, 14, 78);
    doc.text(`País: ${customer.pais}`, 14, 84);
    doc.text(`Empresa de Envío: ${customer.empresaEnvio}`, 14, 90);

    const tableColumn = ["Producto", "Ref", "Color/Talla", "Cantidad", "Precio", "Subtotal"];
    const tableRows = cart.map(item => [
      item.name,
      item.referencia || '-',
      [item.selectedColor, item.selectedTalla].filter(Boolean).join(' / ') || '-',
      item.quantity.toString(),
      `$${item.price}`,
      `$${item.price * item.quantity}`
    ]);

    autoTable(doc, {
      startY: 96,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [212, 175, 55] },
    });

    const finalY = doc.lastAutoTable.finalY || 96;
    doc.setFontSize(14);
    doc.text(`Total a Pagar: $${totalPrice}`, 14, finalY + 15);

    if (includeRef) {
      return doc.output('datauristring');
    }
    doc.save('factura_hanna_accesorios.pdf');
    return null;
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!customer.name || !customer.phone) {
      toast.error('Por favor ingresa tu nombre y teléfono.');
      return;
    }

    setIsProcessing(true);

    try {
      const pdfDataUri = generatePDF(true);
      const pdfBase64 = pdfDataUri ? pdfDataUri.split(',')[1] : '';

      toast.success('Factura generada');

      const orderResult = await sendOrder({
        customer,
        cart,
        totalPrice,
        date: new Date().toISOString(),
        pdfBase64
      });
      if (!orderResult) {
        toast('No se pudo guardar en la nube, pero tu pedido se enviará por WhatsApp', { icon: '⚠️' });
      }

      const itemsStr = cart.map(item => {
        const ref = item.referencia ? ` (Ref: ${item.referencia})` : '';
        const variant = [item.selectedColor, item.selectedTalla].filter(Boolean).join(' - ');
        return `- ${item.quantity}x ${item.name}${ref}${variant ? ' (' + variant + ')' : ''} ($${item.price * item.quantity})`;
      }).join('%0A');

      const message = `Hola Hanna Accesorios!%0AQuiero realizar un pedido.%0A%0A*DATOS DEL CLIENTE*%0ANombre: ${customer.name}%0ATeléfono: ${customer.phone}%0ACédula/RIF: ${customer.cedula}%0ADirección: ${customer.address}%0ACiudad: ${customer.ciudad}%0APaís: ${customer.pais}%0AEmpresa de Envío: ${customer.empresaEnvio}%0A%0A*PEDIDO*%0A${itemsStr}%0A%0A*Total: $${totalPrice}*%0A%0A¡Ya tengo la factura generada!`;
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
                    <div style={{ flex: '1 1 140px' }}>
                      <p style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Color:</p>
                      <select className="input-field" value={item.selectedColor} onChange={e => updateCartItem(item.cartKey, { selectedColor: e.target.value })} style={{ fontSize: '0.85rem', width: '100%' }}>
                        <option value="">Seleccionar</option>
                        {item.availableColors.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  )}
                  {item.availableTallas?.length > 0 && (
                    <div style={{ flex: '1 1 100px' }}>
                      <p style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Talla:</p>
                      <select className="input-field" value={item.selectedTalla} onChange={e => updateCartItem(item.cartKey, { selectedTalla: e.target.value })} style={{ fontSize: '0.85rem', width: '100%' }}>
                        <option value="">Seleccionar</option>
                        {item.availableTallas.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
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
            <input type="text" placeholder="Cédula / RIF" className="input-field" value={customer.cedula} onChange={e => setCustomer({...customer, cedula: e.target.value})} />
            <input type="text" placeholder="Dirección de Envío" className="input-field" value={customer.address} onChange={e => setCustomer({...customer, address: e.target.value})} />
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <input type="text" placeholder="Ciudad" className="input-field" value={customer.ciudad} onChange={e => setCustomer({...customer, ciudad: e.target.value})} style={{ flex: 1 }} />
              <input type="text" placeholder="País" className="input-field" value={customer.pais} onChange={e => setCustomer({...customer, pais: e.target.value})} style={{ flex: 1 }} />
            </div>
            <input type="text" placeholder="Empresa de Envío (Ej. MRW, Zoom, Domesa)" className="input-field" value={customer.empresaEnvio} onChange={e => setCustomer({...customer, empresaEnvio: e.target.value})} />

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
