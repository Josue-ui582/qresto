'use client';

import React, { useState } from 'react';

interface OrderReviewFormProps {
  trackingCode: string;
  customerName: string;
  onSubmitted: () => void;
}

export const OrderReviewForm: React.FC<OrderReviewFormProps> = ({
  trackingCode,
  customerName,
  onSubmitted,
}) => {
  const [name, setName] = useState(customerName);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitReview = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setIsSubmitting(true);
      setError(null);
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingCode, customerName: name, rating, comment }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Impossible d’envoyer votre avis.');
      }
      onSubmitted();
    } catch (submitError: unknown) {
      setError(submitError instanceof Error ? submitError.message : 'Impossible d’envoyer votre avis.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={submitReview} className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
      <div>
        <h3 className="text-sm font-bold text-stone-900">Votre commande est terminée</h3>
        <p className="text-xs text-stone-500 mt-1">Partagez votre expérience avec le restaurant.</p>
      </div>
      <label className="block text-xs font-semibold text-stone-700">
        Votre nom
        <input required maxLength={150} value={name} onChange={(event) => setName(event.target.value)}
          className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5" />
      </label>
      <label className="block text-xs font-semibold text-stone-700">
        Note
        <select value={rating} onChange={(event) => setRating(Number(event.target.value))}
          className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5">
          {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} / 5</option>)}
        </select>
      </label>
      <label className="block text-xs font-semibold text-stone-700">
        Commentaire (facultatif)
        <textarea maxLength={2000} value={comment} onChange={(event) => setComment(event.target.value)}
          rows={3} className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5" />
      </label>
      {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
      <button type="submit" disabled={isSubmitting}
        className="rounded-xl bg-stone-900 px-4 py-3 text-xs font-bold text-white disabled:opacity-50">
        {isSubmitting ? 'Envoi…' : 'Envoyer mon avis'}
      </button>
      <p className="text-[11px] text-stone-500">Votre avis sera publié après modération par le restaurant.</p>
    </form>
  );
};
