'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Dish } from '../types';
import { useToast } from './ToastContext';
import { getSelectedDishOptionTotal } from '@/lib/orders/order-pricing';

export interface CartItem {
  cartItemId: string;
  dish: Dish;
  quantity: number;
  notes?: string;
  optionIds: string[];
}

export interface AddToCartOptions {
  restaurantId?: string;
  notes?: string;
  optionIds?: string[];
}

function createCartItemId(dishId: string, optionIds: string[]): string {
  const sortedOptionIds = [...optionIds].sort();
  return sortedOptionIds.length > 0 ? `${dishId}:${sortedOptionIds.join(':')}` : dishId;
}

interface CartContextType {
  cart: CartItem[];
  cartRestaurantId: string | null;
  addToCart: (dish: Dish, quantity?: number, options?: AddToCartOptions) => void;
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
  const [isHydrated, setIsHydrated] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('qresto_cart');
      const storedCart: CartItem[] = stored ? JSON.parse(stored) : [];
      const normalizedCart = storedCart.map((item) => {
        const optionIds = item.optionIds ?? [];
        return {
          ...item,
          optionIds,
          cartItemId: item.cartItemId || createCartItemId(item.dish.id, optionIds),
        };
      });
      setCart(normalizedCart);
      setCartRestaurantId(
        localStorage.getItem('qresto_cart_rest_id') ||
        normalizedCart[0]?.dish.restaurantId ||
        null
      );
    } catch {
      setCart([]);
      setCartRestaurantId(null);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !isHydrated) return;
    localStorage.setItem('qresto_cart', JSON.stringify(cart));
    if (cart.length === 0) {
      localStorage.removeItem('qresto_cart_rest_id');
      setCartRestaurantId(null);
    } else if (cartRestaurantId) {
      localStorage.setItem('qresto_cart_rest_id', cartRestaurantId);
    }
  }, [cart, cartRestaurantId, isHydrated]);

  const addToCart = (dish: Dish, quantity: number = 1, options: AddToCartOptions = {}) => {
    const restaurantId = options.restaurantId || dish.restaurantId;
    const containsAnotherRestaurant = cart.some(
      (item) => item.dish.restaurantId !== restaurantId
    );
    if (cart.length > 0 && (cartRestaurantId !== restaurantId || containsAnotherRestaurant)) {
      const shouldReset = window.confirm("Votre panier contient déjà des plats d'un autre restaurant. Réinitialiser ?");
      if (!shouldReset) return;
      setCart([]);
    }

    setCartRestaurantId(restaurantId);
    const optionIds = options.optionIds ?? [];
    const cartItemId = createCartItemId(dish.id, optionIds);
    setCart((prev) => {
      const existing = prev.find((item) => item.cartItemId === cartItemId);
      if (existing) {
        return prev.map((item) => item.cartItemId === cartItemId
          ? { ...item, quantity: item.quantity + quantity, notes: options.notes || item.notes }
          : item
        );
      }
      return [...prev, { cartItemId, dish, quantity, notes: options.notes, optionIds }];
    });
    showToast(`${dish.name} ajouté au panier !`, 'success');
  };

  const updateCartQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) => prev.map((item) => {
      if (item.cartItemId === cartItemId) {
        const newQ = item.quantity + delta;
        return newQ > 0 ? { ...item, quantity: newQ } : null;
      }
      return item;
    }).filter((item): item is CartItem => item !== null));
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
    showToast('Plat retiré du panier.', 'info');
  };

  const clearCart = () => {
    setCart([]);
    setCartRestaurantId(null);
  };

  const cartTotal = cart.reduce((sum, item) => {
    const optionTotal = getSelectedDishOptionTotal(item.dish.optionGroups ?? [], item.optionIds);
    return sum + (item.dish.price + optionTotal) * item.quantity;
  }, 0);
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
