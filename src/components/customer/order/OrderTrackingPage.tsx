'use client';

import { useNavigation } from '@/context/NavigationContext';
import { useOrder } from '@/context/OrderContext';
import { storage } from '@/lib/storage';
import { Order } from '@/types';
import React, { useState, useEffect } from 'react';
import { OrderTrackingSearch } from './OrderTrackingSearch';
import { OrderTrackingTimeline } from './OrderTrackingTimeline';
import { OrderTrackingSummary } from './OrderTrackingSummary';
import { FaIcon } from '@/components/common/Icon';

export const OrderTrackingPage: React.FC = () => {
  const { viewParams } = useNavigation();
  const {
    trackingCodeInput,
    searchTrackedOrder,
    trackedOrder,
    refreshTrackedOrder,
  } = useOrder();

  // CORRECTION TYPESCRIPT ICI : (viewParams.trackingCode as string)
  const [searchInput, setSearchInput] = useState<string>(
    (viewParams.trackingCode as string) || trackingCodeInput || ''
  );
  const [currentOrder, setCurrentOrder] = useState<Order | null>(trackedOrder);
  const [autoRefresh] = useState<boolean>(true);

  // Initial lookup if tracking code was passed in viewParams or app state
  useEffect(() => {
    // CORRECTION TYPESCRIPT ICI : (viewParams.trackingCode as string)
    const code = (viewParams.trackingCode as string) || trackingCodeInput;
    if (code) {
      const found = storage.getOrderByTrackingCode(code);
      if (found) {
        setCurrentOrder(found);
      }
    }
  }, [viewParams.trackingCode, trackingCodeInput]);

  // Polling effect every 4 seconds to catch kitchen updates in real time
  useEffect(() => {
    if (!currentOrder || !autoRefresh) return;
    const interval = setInterval(() => {
      const updated = storage.getOrderByTrackingCode(currentOrder.trackingCode);
      if (updated && updated.status !== currentOrder.status) {
        setCurrentOrder(updated);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [currentOrder, autoRefresh]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    const found = searchTrackedOrder(searchInput);
    if (found) {
      setCurrentOrder(found);
    }
  };

  const handleDemoCodeClick = (code: string) => {
    setSearchInput(code);
    const found = searchTrackedOrder(code);
    if (found) setCurrentOrder(found);
  };

  const handleManualRefresh = () => {
    if (!currentOrder) return;
    refreshTrackedOrder();
    const updated = storage.getOrderByTrackingCode(currentOrder.trackingCode);
    if (updated) {
      setCurrentOrder(updated);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <OrderTrackingSearch 
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        handleSearch={handleSearch}
        onDemoCodeClick={handleDemoCodeClick}
      />

      {currentOrder ? (
        <div className="space-y-6">
          <OrderTrackingTimeline 
            currentOrder={currentOrder} 
            handleManualRefresh={handleManualRefresh} 
          />
          <OrderTrackingSummary 
            currentOrder={currentOrder} 
          />
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-stone-300 p-8">
          <FaIcon name="fa-solid fa-receipt" className="text-3xl text-stone-300 mb-2" />
          <p className="text-stone-500 text-sm">Entrez votre code ci-dessus pour afficher votre commande.</p>
        </div>
      )}
    </div>
  );
};
