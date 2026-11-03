'use client';

import React, { useCallback, useEffect, useState } from 'react';

interface ReviewData {
  id: string;
  customerName: string;
  rating: number;
  comment: string | null;
  isApproved: boolean;
  createdAt: string;
  order: { trackingCode: string } | null;
}

export const ReviewsTab: React.FC<{ restaurantId: string }> = ({ restaurantId }) => {
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    const response = await fetch(`/api/reviews?restaurantId=${encodeURIComponent(restaurantId)}`, {
      cache: 'no-store',
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Impossible de charger les avis.');
    }
    return result.reviews as ReviewData[];
  }, [restaurantId]);

  useEffect(() => {
    let active = true;
    void fetchReviews()
      .then((loadedReviews) => {
        if (active) setReviews(loadedReviews);
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Impossible de charger les avis.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [fetchReviews]);

  const moderateReview = async (review: ReviewData, isApproved: boolean) => {
    try {
      const response = await fetch('/api/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: review.id, isApproved }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Impossible de modérer cet avis.');
      }
      setReviews((current) => current.map((item) =>
        item.id === review.id ? { ...item, isApproved } : item
      ));
      setError(null);
    } catch (moderationError: unknown) {
      setError(moderationError instanceof Error ? moderationError.message : 'Impossible de modérer cet avis.');
    }
  };

  return (
    <section className="space-y-5">
      <header className="rounded-3xl border border-stone-200/80 bg-white p-6 sm:p-8">
        <h2 className="text-xl font-black text-stone-950">Avis clients</h2>
        <p className="mt-1 text-xs text-stone-500">Les avis sont liés à une commande livrée et attendent votre modération.</p>
      </header>
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800">{error}</p>}
      {isLoading ? <p className="text-sm text-stone-500">Chargement des avis…</p> : reviews.length === 0 ? (
        <p className="rounded-2xl border border-stone-200 bg-white p-6 text-sm text-stone-500">Aucun avis pour le moment.</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <article key={review.id} className="rounded-2xl border border-stone-200 bg-white p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="font-bold text-stone-900">{review.customerName} · {review.rating}/5</h3>
                  <p className="text-[11px] text-stone-500">
                    {review.order?.trackingCode ?? 'Avis historique non vérifié'} · {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                  {review.comment && <p className="mt-3 whitespace-pre-wrap text-sm text-stone-700">{review.comment}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${review.isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {review.isApproved ? 'Publié' : 'À modérer'}
                  </span>
                  {review.order && <button type="button" onClick={() => void moderateReview(review, !review.isApproved)}
                    className="rounded-lg border border-stone-200 px-3 py-2 text-xs font-bold text-stone-800">
                    {review.isApproved ? 'Masquer' : 'Publier'}
                  </button>}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};
