'use client';

import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';

interface PublicReview {
  customerName: string | null;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export const RestaurantReviewsSection: React.FC<{ slug: string }> = ({ slug }) => {
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    void fetch(`/api/restaurants/${encodeURIComponent(slug)}/reviews?pageSize=5`, {
      signal: controller.signal,
      cache: 'no-store',
    })
      .then(async (response) => {
        const result: { success?: boolean; reviews?: PublicReview[]; error?: string } = await response.json();
        if (!response.ok || !result.success || !result.reviews) {
          throw new Error(result.error || 'Impossible de charger les avis.');
        }
        setReviews(result.reviews);
      })
      .catch((loadError: unknown) => {
        if (!controller.signal.aborted) {
          setError(loadError instanceof Error ? loadError.message : 'Impossible de charger les avis.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [slug]);

  return (
    <section className="mx-auto mt-10 max-w-7xl px-4 sm:px-6 lg:px-8" aria-labelledby="restaurant-reviews-title">
      <h2 id="restaurant-reviews-title" className="mb-4 text-lg font-bold text-ink-900">Avis clients</h2>
      {isLoading ? (
        <p className="text-sm text-ink-500">Chargement des avis…</p>
      ) : error ? (
        <p role="alert" className="text-sm text-negative-700">{error}</p>
      ) : reviews.length === 0 ? (
        <p className="rounded-2xl border border-ink-200 bg-paper-white p-5 text-sm text-ink-500">Pas encore d’avis.</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((review, index) => (
            <article key={`${review.createdAt}-${index}`} className="rounded-2xl border border-ink-200 bg-paper-white p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-bold text-ink-900">{review.customerName || 'Client'}</p>
                <time className="text-xs text-ink-500" dateTime={review.createdAt}>
                  {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                </time>
              </div>
              <p className="mt-1 flex items-center gap-1 text-warning" aria-label={`${review.rating} étoiles sur 5`}>
                {Array.from({ length: review.rating }, (_, star) => <Star key={star} className="h-4 w-4 fill-current" aria-hidden="true" />)}
              </p>
              {review.comment && <p className="mt-2 whitespace-pre-wrap text-sm text-ink-700">{review.comment}</p>}
            </article>
          ))}
        </div>
      )}
    </section>
  );
};
