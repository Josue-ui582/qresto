'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Order, OrderType, PaymentMethod, OrderStatus } from '../types';
import { useToast } from './ToastContext';
import { useCart } from './CartContext';

interface OrderData {
  type: OrderType;
  tableNumber?: string | number;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  customerNotes?: string;
  paymentMethod: PaymentMethod;
}

interface OrderContextType {
  placeOrder: (orderData: OrderData) => Promise<Order>;
  trackedOrder: Order | null;
  trackingCodeInput: string;
  setTrackingCodeInput: (code: string) => void;
  searchTrackedOrder: (code: string) => Promise<Order | null>;
  refreshTrackedOrder: () => Promise<void>;
  updateRestaurantStatus: (status: OrderStatus, orderId: string) => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [trackingCodeInput, setTrackingCodeInput] = useState<string>('');

  const { showToast } = useToast();
  const { cart, cartRestaurantId, clearCart } = useCart();

  // 1. Passage de commande via API Next.js -> PostgreSQL
  const placeOrder = async (orderData: OrderData): Promise<Order> => {
    if (!cartRestaurantId || cart.length === 0) {
      throw new Error('Votre panier est vide');
    }

    const items = cart.map((item) => ({
      dishId: item.dish.id,
      name: item.dish.name,
      price: item.dish.price,
      quantity: item.quantity,
      notes: item.notes,
    }));

    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        restaurantId: cartRestaurantId,
        items,
        ...orderData,
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      const errorMsg = result.error || 'Erreur lors de la création de la commande.';
      showToast(errorMsg, 'error');
      throw new Error(errorMsg);
    }

    const newOrder: Order = result.data;
    clearCart();
    setTrackedOrder(newOrder);
    setTrackingCodeInput(newOrder.trackingCode);
    showToast(`Commande ${newOrder.trackingCode} enregistrée !`, 'success');
    return newOrder;
  };

  // 2. Recherche d'une commande par code de suivi via API
  const searchTrackedOrder = async (code: string): Promise<Order | null> => {
    if (!code.trim()) return null;

    try {
      const response = await fetch(`/api/orders?trackingCode=${encodeURIComponent(code.trim())}`);
      const result = await response.json();

      if (!response.ok || !result.data) {
        showToast('Aucune commande trouvée.', 'error');
        return null;
      }

      const foundOrder = result.data;
      setTrackedOrder(foundOrder);
      setTrackingCodeInput(foundOrder.trackingCode);
      return foundOrder;
    } catch (err) {
      console.error('Erreur lors de la recherche de la commande:', err);
      showToast('Impossible de récupérer la commande.', 'error');
      return null;
    }
  };

  // 3. Rafraîchir le suivi de la commande active
  const refreshTrackedOrder = async (): Promise<void> => {
    if (!trackedOrder) return;
    await searchTrackedOrder(trackedOrder.trackingCode);
    showToast('Statut actualisé.', 'info');
  };

  // 4. Mise à jour du statut (Admin / Restaurant) via API
  const updateRestaurantStatus = async (status: OrderStatus, orderId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur de mise à jour.');
      }

      showToast(`Statut mis à jour : ${status}`, 'success');
      if (trackedOrder?.id === orderId) {
        setTrackedOrder(result.data);
      }
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la mise à jour du statut', 'error');
    }
  };

  return (
    <OrderContext.Provider
      value={{
        placeOrder,
        trackedOrder,
        trackingCodeInput,
        setTrackingCodeInput,
        searchTrackedOrder,
        refreshTrackedOrder,
        updateRestaurantStatus,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) throw new Error('useOrder must be used within an OrderProvider');
  return context;
};
