/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

const CART_KEY = 'hannaccesorio_cart';

const loadCart = () => {
  try {
    const saved = localStorage.getItem(CART_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(loadCart);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, color = '', talla = '', availableColors = [], availableTallas = [], quantity = 1) => {
    setCart((prev) => {
      const key = product.id + '|' + color + '|' + talla;
      const existing = prev.find(item => item.cartKey === key);
      if (existing) {
        return prev.map(item =>
          item.cartKey === key ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { ...product, quantity, selectedColor: color, selectedTalla: talla, availableColors, availableTallas, cartKey: key }];
    });
  };

  const updateCartItem = (cartKey, updates) => {
    setCart((prev) => prev.map(item =>
      item.cartKey === cartKey ? { ...item, ...updates } : item
    ));
  };

  const removeFromCart = (cartKey) => {
    setCart((prev) => prev.filter(item => item.cartKey !== cartKey));
  };

  const updateQuantity = (cartKey, quantity) => {
    if (quantity <= 0) {
      removeFromCart(cartKey);
      return;
    }
    setCart((prev) => prev.map(item =>
      item.cartKey === cartKey ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => setCart([]);

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, updateCartItem, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};
