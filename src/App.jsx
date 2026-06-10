import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import Admin from './pages/Admin';
import Invoice from './pages/Invoice';
import NotFound from './pages/NotFound';

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <CartProvider>
          <Router>
            <ErrorBoundary>
              <div className="app-container">
                <Navbar />
                <main className="main-content animate-fade-in">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/producto/:id" element={<ProductDetail />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/admin/*" element={<Admin />} />
                    <Route path="/invoice/:id" element={<Invoice />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            </ErrorBoundary>
          </Router>
        </CartProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
