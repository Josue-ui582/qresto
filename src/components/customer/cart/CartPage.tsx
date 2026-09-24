'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { EmptyCart } from './EmptyCart';
import { CartHeader } from './CartHeader';
import { CartItemsSummary } from './CartItemsSummary';
import { OrderTypeSelector } from './OrderTypeSelector';
import { CustomerInfoFields } from './CustomerInfoFields';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { useNavigation } from '@/context/NavigationContext';
import { useOrder } from '@/context/OrderContext';
import { storage } from '@/lib/storage';
import { OrderType, PaymentMethod } from '@/types';
import { useCart } from '@/context/CartContext';
import { FaIcon } from '@/components/common/Icon';

export const CartPage: React.FC = () => {
  const { cart, cartRestaurantId, cartTotal, updateCartQuantity, removeFromCart, clearCart } = useCart();
  const { navigateTo, viewParams } = useNavigation();
  const { placeOrder } = useOrder();

  const restaurant = cartRestaurantId ? storage.getRestaurantById(cartRestaurantId) : null;
  const initialTable = viewParams.table || '';

  // Form state
  const [orderType, setOrderType] = useState<OrderType>(initialTable ? 'DINE_IN' : 'DELIVERY');
  const [tableNumber, setTableNumber] = useState<string>(initialTable ? String(initialTable) : '');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerAddress, setCustomerAddress] = useState<string>('');
  const [customerNotes, setCustomerNotes] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('MTN_MOMO');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  const deliveryFee = orderType === 'DELIVERY' && restaurant ? restaurant.deliveryFee : 0;
  const grandTotal = cartTotal + deliveryFee;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

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
        // Ignorer les erreurs éventuelles du confetti
      }

      navigateTo('order-tracking', { trackingCode: newOrder.trackingCode });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Une erreur est survenue lors de la validation.';
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return <EmptyCart onExplore={() => navigateTo('restaurants')} />;
  }

  return (
    <div className="min-h-screen bg-stone-50 py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <CartHeader
        restaurantName={restaurant?.name}
        restaurantCity={restaurant?.city}
        onClearCart={clearCart}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Colonne de gauche : Articles */}
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

        {/* Colonne de droite : Formulaire */}
        <div className="lg:col-span-7">
          <form onSubmit={handleCheckout} className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
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
              disabled={isSubmitting}
              className="btn-primary w-full"
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
