'use client';

import { useNavigation } from '@/context/NavigationContext';
import { useOrder } from '@/context/OrderContext';
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

  const [searchInput, setSearchInput] = useState<string>(
    (viewParams.trackingCode as string) || trackingCodeInput || ''
  );
  const [currentOrder, setCurrentOrder] = useState<Order | null>(trackedOrder);
  const [autoRefresh] = useState<boolean>(true);

  // 1. Recherche initiale (si un code est dans l'URL ou le contexte)
  useEffect(() => {
    const code = (viewParams.trackingCode as string) || trackingCodeInput;
    if (code && !currentOrder) {
      // searchTrackedOrder interroge maintenant l'API (PostgreSQL)
      searchTrackedOrder(code).then((found) => {
        if (found) setCurrentOrder(found);
      });
    }
  }, [viewParams.trackingCode, trackingCodeInput]);

  // 2. Polling : Actualisation silencieuse en arrière-plan toutes les 5 secondes
  useEffect(() => {
    if (!currentOrder || !autoRefresh) return;
    
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders?trackingCode=${currentOrder.trackingCode}`);
        if (res.ok) {
          const result = await res.json();
          // Si le statut a changé en cuisine, on met à jour l'affichage
          if (result.data && result.data.status !== currentOrder.status) {
            setCurrentOrder(result.data);
          }
        }
      } catch (err) {
        console.error('Erreur lors du rafraîchissement silencieux', err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [currentOrder, autoRefresh]);

  // 3. Recherche manuelle
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    const found = await searchTrackedOrder(searchInput);
    if (found) setCurrentOrder(found);
  };

  const handleDemoCodeClick = async (code: string) => {
    setSearchInput(code);
    const found = await searchTrackedOrder(code);
    if (found) setCurrentOrder(found);
  };

  // 4. Bouton de rafraîchissement manuel
  const handleManualRefresh = async () => {
    if (!currentOrder) return;
    await refreshTrackedOrder();
    const updated = await searchTrackedOrder(currentOrder.trackingCode);
    if (updated) setCurrentOrder(updated);
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
