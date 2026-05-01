import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useOrders } from './OrderContext';
import { useNavigate } from 'react-router-dom';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user } = useAuth();
  const { orders } = useOrders();
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('cart_items');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState('');

  useEffect(() => {
    localStorage.setItem('cart_items', JSON.stringify(cartItems));
  }, [cartItems]);
  const navigate = useNavigate();

  const addToCart = (product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      const qtyToAdd = product.quantity || 1;
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + qtyToAdd } : item);
      }
      return [...prev, { ...product, quantity: qtyToAdd }];
    });
  };

  const updateQuantity = (productId, amount) => {
    setCartItems(prev => {
      return prev.map(item => {
        if (item.id === productId) {
          const newQty = item.quantity + amount;
          return { ...item, quantity: newQty > 0 ? newQty : 1 };
        }
        return item;
      });
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const updateItemMessage = (productId, message) => {
    setCartItems(prev => prev.map(item => 
      item.id === productId ? { 
        ...item, 
        variant_details: { ...item.variant_details, message } 
      } : item
    ));
  };

  const clearCart = () => {
    setCartItems([]);
    setDiscountPercent(0);
    setAppliedPromo('');
  };

  const applyPromoCode = (code) => {
    if (!user) {
      return { success: false, message: 'Login to use this coupon' };
    }

    const cleanCode = code.toUpperCase().trim();
    if (cleanCode === 'CRUMBLE10') {
      // Check usage limit (Valid 2 times only)
      const userOrders = orders.filter(o => o.email === user.email);
      const usageCount = userOrders.filter(o => o.address && o.address.includes('[Promo Used: CRUMBLE10]')).length;
      
      if (usageCount >= 2) {
        return { success: false, message: 'Usage limit reached (2 times max)' };
      }

      setDiscountPercent(10);
      setAppliedPromo('CRUMBLE10');
      return { success: true, message: '10% discount applied!' };
    }
    return { success: false, message: 'Invalid promo code' };
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const totalPrice = subtotal - discountAmount;

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      removeFromCart, 
      updateQuantity,
      updateItemMessage,
      clearCart,
      cartCount, 
      subtotal,
      discountAmount,
      discountPercent,
      appliedPromo,
      applyPromoCode,
      totalPrice,
      isCartOpen, 
      setIsCartOpen 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
