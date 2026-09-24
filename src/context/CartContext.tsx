'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Dish } from '../types';
import { useToast } from './ToastContext';

export interface CartItem {
  dish: Dish;
  quantity: number;
  notes?: string;
}

interface CartContextType {
  cart: CartItem[];
  cartRestaurantId: string | null;
  addToCart: (dish: Dish, quantity?: number, notes?: string) => void;
  updateCartQuantity: (dishId: string, delta: number) => void;
  removeFromCart: (dishId: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartRestaurantId, setCartRestaurantId] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('qresto_cart');
      setCart(stored ? JSON.parse(stored) : []);
      setCartRestaurantId(localStorage.getItem('qresto_cart_rest_id') || null);
    } catch {
      setCart([]);
      setCartRestaurantId(null);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('qresto_cart', JSON.stringify(cart));
    if (cart.length === 0) {
      localStorage.removeItem('qresto_cart_rest_id');
      setCartRestaurantId(null);
    } else if (cartRestaurantId) {
      localStorage.setItem('qresto_cart_rest_id', cartRestaurantId);
    }
  }, [cart, cartRestaurantId]);

  const addToCart = (dish: Dish, quantity: number = 1, notes?: string) => {
    if (cartRestaurantId && cartRestaurantId !== dish.restaurantId && cart.length > 0) {
      const shouldReset = window.confirm("Votre panier contient déjà des plats d'un autre restaurant. Réinitialiser ?");
      if (!shouldReset) return;
      setCart([]);
    }

    setCartRestaurantId(dish.restaurantId);
    setCart((prev) => {
      const existing = prev.find((item) => item.dish.id === dish.id);
      if (existing) {
        return prev.map((item) => item.dish.id === dish.id
          ? { ...item, quantity: item.quantity + quantity, notes: notes || item.notes }
          : item
        );
      }
      return [...prev, { dish, quantity, notes }];
    });
    showToast(`${dish.name} ajouté au panier !`, 'success');
  };

  const updateCartQuantity = (dishId: string, delta: number) => {
    setCart((prev) => prev.map((item) => {
      if (item.dish.id === dishId) {
        const newQ = item.quantity + delta;
        return newQ > 0 ? { ...item, quantity: newQ } : null;
      }
      return item;
    }).filter((item): item is CartItem => item !== null));
  };

  const removeFromCart = (dishId: string) => {
    setCart((prev) => prev.filter((item) => item.dish.id !== dishId));
    showToast('Plat retiré du panier.', 'info');
  };

  const clearCart = () => {
    setCart([]);
    setCartRestaurantId(null);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.dish.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, cartRestaurantId, addToCart, updateCartQuantity, removeFromCart, clearCart, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
