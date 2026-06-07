import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Checkout from './pages/Checkout';
import Admin from './pages/Admin';

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="main-content animate-fade-in">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/admin/*" element={<Admin />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;
