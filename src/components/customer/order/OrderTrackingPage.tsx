'use client';

import { useNavigation } from '@/context/NavigationContext';
import { useOrder } from '@/context/OrderContext';
import { TrackedOrder } from '@/types';
import React, { useState, useEffect } from 'react';
import { OrderTrackingSearch } from './OrderTrackingSearch';
import { OrderTrackingTimeline } from './OrderTrackingTimeline';
import { OrderTrackingSummary } from './OrderTrackingSummary';
import { FaIcon } from '@/components/common/Icon';
import { useSearchParams } from 'next/navigation';

export const OrderTrackingPage: React.FC = () => {
  const { viewParams } = useNavigation();
  const searchParams = useSearchParams();
  const {
    trackingCodeInput,
    searchTrackedOrder,
    trackedOrder,
    refreshTrackedOrder,
  } = useOrder();

  const requestedTrackingCode =
    searchParams.get('trackingCode') ||
    (viewParams.trackingCode as string) ||
    trackingCodeInput ||
    '';
  const [searchInput, setSearchInput] = useState<string>(
    requestedTrackingCode
  );
  const [currentOrder, setCurrentOrder] = useState<TrackedOrder | null>(trackedOrder);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [autoRefresh] = useState<boolean>(true);

  useEffect(() => {
    if (requestedTrackingCode) setSearchInput(requestedTrackingCode);
  }, [requestedTrackingCode]);

  useEffect(() => {
    if (requestedTrackingCode) {
      searchTrackedOrder(requestedTrackingCode).then((found) => {
        if (found) {
          setCurrentOrder(found);
          setSearchError(null);
        } else {
          setSearchError('Aucune commande ne correspond à ce code. Vérifiez-le puis réessayez.');
        }
      });
    }
  }, [requestedTrackingCode, searchTrackedOrder]);

  useEffect(() => {
    if (!currentOrder || !autoRefresh) return;
    
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders?trackingCode=${currentOrder.trackingCode}`);
        if (res.ok) {
          const result = await res.json();
          if (result.data) setCurrentOrder(result.data);
        }
      } catch (err) {
        console.error('Erreur lors du rafraîchissement silencieux', err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [currentOrder, autoRefresh]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    const found = await searchTrackedOrder(searchInput);
    if (found) {
      setCurrentOrder(found);
      setSearchError(null);
    } else {
      setSearchError('Aucune commande ne correspond à ce code. Vérifiez-le puis réessayez.');
    }
  };

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
      />
      {searchError && (
        <p role="status" className="mb-6 text-center text-sm text-stone-600">
          {searchError}
        </p>
      )}

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
