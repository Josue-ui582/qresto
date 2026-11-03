'use client';

import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';

interface ReviewData {
  customerName: string | null;
  rating: number;
  comment: string | null;
  createdAt: string;
}

interface OrderReviewFormProps {
  trackingCode: string;
  customerName?: string;
  onSubmitted: () => void;
}

export const OrderReviewForm: React.FC<OrderReviewFormProps> = ({
  trackingCode,
  customerName,
  onSubmitted,
}) => {
  const [name, setName] = useState(customerName || '');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingReview, setIsCheckingReview] = useState(true);
  const [existingReview, setExistingReview] = useState<ReviewData | null>(null);
  const [submittedReview, setSubmittedReview] = useState<ReviewData | null>(null);

  useEffect(() => {
    if (customerName) setName((currentName) => currentName || customerName);
  }, [customerName]);

  useEffect(() => {
    const controller = new AbortController();
    void fetch(`/api/reviews?code=${encodeURIComponent(trackingCode)}`, { signal: controller.signal })
      .then(async (response) => {
        const result: { success?: boolean; review?: ReviewData | null; error?: string } = await response.json();
        if (!response.ok || !result.success) throw new Error(result.error || 'Impossible de vérifier cet avis.');
        if (result.review) setExistingReview(result.review);
      })
      .catch((checkError: unknown) => {
        if (!controller.signal.aborted) {
          setError(checkError instanceof Error ? checkError.message : 'Impossible de vérifier cet avis.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsCheckingReview(false);
      });
    return () => controller.abort();
  }, [trackingCode]);

  const submitReview = async (event: React.FormEvent) => {
    event.preventDefault();
    if (rating === 0) return;
    try {
      setIsSubmitting(true);
      setError(null);
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackingCode,
          customerName: name.trim() || undefined,
          rating,
          comment: comment.trim() || undefined,
        }),
      });
      const result: { success?: boolean; review?: ReviewData; error?: string } = await response.json();
      if (!response.ok || !result.success || !result.review) {
        throw new Error(result.error || 'Impossible d’envoyer votre avis.');
      }
      setSubmittedReview(result.review);
      onSubmitted();
    } catch (submitError: unknown) {
      setError(submitError instanceof Error ? submitError.message : 'Impossible d’envoyer votre avis.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const readOnlyReview = existingReview || submittedReview;
  if (isCheckingReview) {
    return <p role="status" className="rounded-3xl border border-ink-200 bg-paper-white p-6 text-sm text-ink-500">Vérification de votre avis…</p>;
  }
  if (readOnlyReview) {
    return (
      <section className="rounded-3xl border border-ink-200 bg-paper-white p-6 shadow-sm" aria-label="Avis déjà envoyé">
        <h3 className="text-sm font-bold text-ink-900">Merci pour votre avis !</h3>
        <p className="mt-1 text-xs text-ink-500">Votre avis a bien été enregistré.</p>
        <p className="mt-3 flex items-center gap-1 text-warning" aria-label={`${readOnlyReview.rating} étoiles sur 5`}>
          {Array.from({ length: readOnlyReview.rating }, (_, index) => (
            <Star key={index} className="h-4 w-4 fill-current" aria-hidden="true" />
          ))}
        </p>
        {readOnlyReview.customerName && <p className="mt-2 text-sm font-semibold text-ink-800">{readOnlyReview.customerName}</p>}
        {readOnlyReview.comment && <p className="mt-2 whitespace-pre-wrap text-sm text-ink-700">{readOnlyReview.comment}</p>}
      </section>
    );
  }

  return (
    <form onSubmit={submitReview} className="space-y-4 rounded-3xl border border-ink-200 bg-paper-white p-6 shadow-sm">
      <div>
        <h3 className="text-sm font-bold text-ink-900">Donnez votre avis</h3>
        <p className="mt-1 text-xs text-ink-500">Partagez votre expérience avec le restaurant.</p>
      </div>
      <fieldset>
        <legend className="text-xs font-semibold text-ink-700">Votre note *</legend>
        <div role="radiogroup" aria-label="Votre note sur 5" className="mt-2 flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={rating === value}
              aria-label={`${value} étoile${value > 1 ? 's' : ''}`}
              onClick={() => setRating(value)}
              className="rounded p-1 text-warning focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
            >
              <Star className={`h-7 w-7 ${value <= rating ? 'fill-current' : ''}`} aria-hidden="true" />
            </button>
          ))}
        </div>
      </fieldset>
      <label className="block text-xs font-semibold text-ink-700">
        Prénom (facultatif)
        <input value={name} maxLength={80} onChange={(event) => setName(event.target.value)}
          className="mt-1 w-full rounded-xl border border-ink-200 bg-ink-50 px-3 py-2.5" />
      </label>
      <label className="block text-xs font-semibold text-ink-700">
        Commentaire (facultatif)
        <textarea maxLength={1000} value={comment} onChange={(event) => setComment(event.target.value)}
          rows={3} className="mt-1 w-full rounded-xl border border-ink-200 bg-ink-50 px-3 py-2.5" />
        <span className="mt-1 block text-right text-[0.6875rem] text-ink-500">{comment.length}/1000</span>
      </label>
      {error && <p role="alert" className="text-xs text-negative-700">{error}</p>}
      <button type="submit" disabled={isSubmitting || rating === 0}
        className="rounded-xl bg-ink-900 px-4 py-3 text-xs font-bold text-paper-white disabled:opacity-50">
        {isSubmitting ? 'Envoi…' : 'Envoyer mon avis'}
      </button>
    </form>
  );
};
