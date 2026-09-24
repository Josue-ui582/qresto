'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Order, OrderType, PaymentMethod, OrderStatus } from '../types';
import { storage } from '../lib/storage';
import { useToast } from './ToastContext';
import { useCart } from './CartContext';

interface OrderContextType {
  placeOrder: (orderData: { type: OrderType; tableNumber?: string | number; customerName: string; customerPhone: string; customerAddress?: string; customerNotes?: string; paymentMethod: PaymentMethod; }) => Promise<Order>;
  trackedOrder: Order | null;
  trackingCodeInput: string;
  setTrackingCodeInput: (code: string) => void;
  searchTrackedOrder: (code: string) => Order | null;
  refreshTrackedOrder: () => void;
  updateRestaurantStatus: (status: OrderStatus, orderId: string) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [trackingCodeInput, setTrackingCodeInput] = useState<string>('');
  
  const { showToast } = useToast();
  const { cart, cartRestaurantId, cartTotal, clearCart } = useCart();

  const placeOrder = async (orderData: any): Promise<Order> => {
    if (!cartRestaurantId || cart.length === 0) throw new Error('Votre panier est vide');
    const rest = storage.getRestaurantById(cartRestaurantId);
    if (!rest) throw new Error('Restaurant introuvable');

    const subtotal = cartTotal;
    const deliveryFee = orderData.type === 'DELIVERY' ? rest.deliveryFee : 0;
    
    const items = cart.map((item) => ({
      dishId: item.dish.id, name: item.dish.name, price: item.dish.price,
      quantity: item.quantity, notes: item.notes, image: item.dish.image,
    }));

    const order = storage.createOrder({
      restaurantId: rest.id,
      restaurantName: rest.name,
      restaurantPhone: rest.phone,
      type: orderData.type,
      items,
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      status: rest.settings.autoConfirmOrders ? 'CONFIRMED' : 'NEW',
      ...orderData
    });

    clearCart();
    setTrackedOrder(order);
    setTrackingCodeInput(order.trackingCode);
    showToast(`Commande ${order.trackingCode} enregistrée !`, 'success');
    return order;
  };

  const searchTrackedOrder = (code: string): Order | null => {
    if (!code) return null;
    const found = storage.getOrderByTrackingCode(code);
    if (found) {
      setTrackedOrder(found);
      setTrackingCodeInput(found.trackingCode);
      return found;
    }
    showToast('Aucune commande trouvée.', 'error');
    return null;
  };

  const refreshTrackedOrder = () => {
    if (!trackedOrder) return;
    const updated = storage.getOrderByTrackingCode(trackedOrder.trackingCode);
    if (updated) {
      setTrackedOrder(updated);
      showToast('Statut actualisé.', 'info');
    }
  };

  const updateRestaurantStatus = (status: OrderStatus, orderId: string) => {
    const updated = storage.updateOrderStatus(orderId, status);
    if (updated) {
      showToast(`Statut mis à jour : ${status}`, 'success');
      if (trackedOrder?.id === orderId) setTrackedOrder(updated);
    }
  };

  return (
    <OrderContext.Provider value={{ placeOrder, trackedOrder, trackingCodeInput, setTrackingCodeInput, searchTrackedOrder, refreshTrackedOrder, updateRestaurantStatus }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) throw new Error('useOrder must be used within an OrderProvider');
  return context;
};
