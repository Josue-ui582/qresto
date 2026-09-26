'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useRouter, useSearchParams } from 'next/navigation';
import { EmptyCart } from './EmptyCart';
import { CartHeader } from './CartHeader';
import { CartItemsSummary } from './CartItemsSummary';
import { OrderTypeSelector } from './OrderTypeSelector';
import { CustomerInfoFields } from './CustomerInfoFields';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { useOrder } from '@/context/OrderContext';
import { OrderType, PaymentMethod, Restaurant } from '@/types';
import { useCart } from '@/context/CartContext';
import { FaIcon } from '@/components/common/Icon';
import { useNavigation } from '@/context/NavigationContext';

export const CartPage: React.FC = () => {
  const { cart, cartRestaurantId, cartTotal, updateCartQuantity, removeFromCart, clearCart } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { viewParams } = useNavigation();
  const { placeOrder } = useOrder();

  // Extraction de la table et du restaurant depuis l'URL ou les paramètres de vue
  const tableUrlParam = searchParams.get('table') || (viewParams.table as string) || '';
  const restaurantUrlParam = searchParams.get('restaurantId') || cartRestaurantId || '';

  // État local pour le restaurant récupéré depuis PostgreSQL
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoadingRestaurant, setIsLoadingRestaurant] = useState<boolean>(false);

  // Form states
  const [orderType, setOrderType] = useState<OrderType>(tableUrlParam ? 'DINE_IN' : 'DELIVERY');
  const [tableNumber, setTableNumber] = useState<string>(tableUrlParam ? String(tableUrlParam) : '');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerAddress, setCustomerAddress] = useState<string>('');
  const [customerNotes, setCustomerNotes] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('MTN_MOMO');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // 1. Récupération dynamique des infos du restaurant depuis PostgreSQL
  useEffect(() => {
    const targetRestaurantId = cartRestaurantId || restaurantUrlParam;
    if (!targetRestaurantId) return;

    const fetchRestaurantInfo = async () => {
      try {
        setIsLoadingRestaurant(true);
        const res = await fetch(`/api/restaurants/${targetRestaurantId}`);
        if (!res.ok) return;

        const data = await res.json();
        const fetchedRest = data.restaurant || data.data || data;
        if (fetchedRest) {
          setRestaurant(fetchedRest);
        }
      } catch (err) {
        console.error('Erreur lors du chargement du restaurant:', err);
      } finally {
        setIsLoadingRestaurant(false);
      }
    };

    fetchRestaurantInfo();
  }, [cartRestaurantId, restaurantUrlParam]);

  // Calcul du total avec frais de livraison
  const deliveryFee = orderType === 'DELIVERY' && restaurant ? (restaurant.deliveryFee || 0) : 0;
  const grandTotal = cartTotal + deliveryFee;

  // 2. Soumission de la commande vers l'API PostgreSQL
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const activeRestaurantId = restaurant?.id || cartRestaurantId || restaurantUrlParam;

    if (!activeRestaurantId) {
      setFormError('Restaurant introuvable. Veuillez sélectionner à nouveau vos plats.');
      return;
    }
    if (!customerName.trim()) {
      setFormError('Veuillez renseigner votre nom complet.');
      return;
    }
    if (!customerPhone.trim() || customerPhone.length < 8) {
      setFormError('Veuillez renseigner un numéro de téléphone valide.');
      return;
    }
    if (orderType === 'DELIVERY' && !customerAddress.trim()) {
      setFormError('Veuillez préciser votre adresse de livraison exacte.');
      return;
    }
    if (orderType === 'DINE_IN' && !tableNumber.trim()) {
      setFormError('Veuillez indiquer votre numéro de table en salle.');
      return;
    }

    try {
      setIsSubmitting(true);

      // Appel de placeOrder (connecté à POST /api/orders)
      const newOrder = await placeOrder({
        type: orderType,
        tableNumber: orderType === 'DINE_IN' ? tableNumber : undefined,
        customerName,
        customerPhone,
        customerAddress: orderType === 'DELIVERY' ? customerAddress : undefined,
        customerNotes,
        paymentMethod,
      });

      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch {
        // Fallback discret si canvas-confetti échoue
      }

      // Redirection vers le suivi en direct
      router.push(`/order-tracking?trackingCode=${encodeURIComponent(newOrder.trackingCode)}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Une erreur est survenue lors de la validation.';
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return <EmptyCart onExplore={() => router.push('/restaurants')} />;
  }

  return (
    <div className="min-h-screen bg-stone-50 py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <CartHeader
        restaurantName={restaurant?.name}
        restaurantCity={restaurant?.city}
        onClearCart={clearCart}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Colonne de gauche : Résumé des articles */}
        <div className="lg:col-span-5 space-y-4">
          <CartItemsSummary
            cart={cart}
            restaurantName={restaurant?.name}
            cartTotal={cartTotal}
            deliveryFee={deliveryFee}
            grandTotal={grandTotal}
            orderType={orderType}
            onUpdateQuantity={updateCartQuantity}
            onRemoveItem={removeFromCart}
          />
        </div>

        {/* Colonne de droite : Formulaire de livraison/table & paiement */}
        <div className="lg:col-span-7">
          <form onSubmit={handleCheckout} className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
            {formError && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
                <FaIcon name="fa-solid fa-circle-exclamation" />
                <span>{formError}</span>
              </div>
            )}

            <OrderTypeSelector
              orderType={orderType}
              setOrderType={setOrderType}
              tableNumber={tableNumber}
              setTableNumber={setTableNumber}
            />

            <CustomerInfoFields
              orderType={orderType}
              customerName={customerName}
              setCustomerName={setCustomerName}
              customerPhone={customerPhone}
              setCustomerPhone={setCustomerPhone}
              customerAddress={customerAddress}
              setCustomerAddress={setCustomerAddress}
              customerNotes={customerNotes}
              setCustomerNotes={setCustomerNotes}
            />

            <PaymentMethodSelector
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
            />

            <button
              type="submit"
              disabled={isSubmitting || isLoadingRestaurant}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <FaIcon name="fa-solid fa-spinner" className="animate-spin text-lg" />
                  <span>Validation de la commande en cours...</span>
                </>
              ) : (
                <>
                  <FaIcon name="fa-solid fa-lock" />
                  <span>Confirmer la commande ({grandTotal.toLocaleString()} FCFA)</span>
                </>
              )}
            </button>

            <p className="text-[11px] text-stone-400 text-center">
              🔒 Vous recevrez un code de suivi immédiat (ex: QR-7842) pour suivre l'avancement en temps réel.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};
