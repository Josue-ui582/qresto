'use client';

import React, { useCallback, useEffect, useState } from 'react';

interface ReviewData {
  id: string;
  customerName: string | null;
  rating: number;
  comment: string | null;
  isVisible: boolean;
  createdAt: string;
  order: {
    trackingCode: string;
    items: Array<{ name: string; quantity: number }>;
  } | null;
}

interface ReviewSummary {
  averageRating: number;
  reviewCount: number;
  distribution: Array<{ rating: number; count: number }>;
}

interface ReviewResponse {
  reviews: ReviewData[];
  pagination: { page: number; pageCount: number; total: number };
  summary: ReviewSummary;
}

export const ReviewsTab: React.FC<{ restaurantId: string }> = ({ restaurantId }) => {
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [ratingFilter, setRatingFilter] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReviews = useCallback(async (signal?: AbortSignal): Promise<ReviewResponse> => {
    const params = new URLSearchParams({
      restaurantId,
      page: String(page),
      pageSize: '10',
    });
    if (ratingFilter) params.set('rating', ratingFilter);
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const response = await fetch(`/api/reviews?${params}`, { cache: 'no-store', signal });
    const result: {
      success?: boolean;
      reviews?: ReviewData[];
      pagination?: ReviewResponse['pagination'];
      summary?: ReviewSummary;
      error?: string;
    } = await response.json();
    if (!response.ok || !result.success || !result.reviews || !result.pagination || !result.summary) {
      throw new Error(result.error || 'Impossible de charger les avis.');
    }
    return {
      reviews: result.reviews,
      pagination: result.pagination,
      summary: result.summary,
    };
  }, [from, page, ratingFilter, restaurantId, to]);

  useEffect(() => {
    const controller = new AbortController();
    void fetchReviews(controller.signal)
      .then((result) => {
        setReviews(result.reviews);
        setPageCount(result.pagination.pageCount);
        setSummary(result.summary);
        setError(null);
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
  }, [fetchReviews]);

  const moderateReview = async (review: ReviewData, isVisible: boolean) => {
    try {
      const response = await fetch('/api/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: review.id, isVisible }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Impossible de modifier la visibilité de cet avis.');
      }
      const refreshed = await fetchReviews();
      setReviews(refreshed.reviews);
      setPageCount(refreshed.pagination.pageCount);
      setSummary(refreshed.summary);
      setError(null);
    } catch (moderationError: unknown) {
      setError(moderationError instanceof Error ? moderationError.message : 'Impossible de modifier cet avis.');
    }
  };

  const updateFilter = (update: () => void) => {
    setPage(1);
    update();
    setIsLoading(true);
  };

  return (
    <section className="space-y-5">
      <header className="rounded-3xl border border-ink-200/80 bg-paper-white p-6 sm:p-8">
        <h2 className="text-xl font-black text-ink-950">Avis clients</h2>
        <p className="mt-1 text-xs text-ink-500">
          Les avis publiés sont associés aux commandes terminées.
        </p>
        {summary && (
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-ink-700">
            <p><strong>{summary.averageRating.toFixed(1)}/5</strong> · {summary.reviewCount} avis visibles</p>
            <div className="flex flex-wrap gap-2" aria-label="Répartition des notes">
              {summary.distribution.map((item) => (
                <span key={item.rating} className="rounded-full bg-ink-100 px-2.5 py-1 text-xs">
                  {item.rating}★ {item.count}
                </span>
              ))}
            </div>
          </div>
        )}
      </header>

      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-ink-200 bg-paper-white p-4">
        <label className="text-xs font-semibold text-ink-700">
          Note
          <select value={ratingFilter} onChange={(event) => updateFilter(() => setRatingFilter(event.target.value))}
            className="mt-1 block rounded-lg border border-ink-200 bg-paper-white px-3 py-2">
            <option value="">Toutes</option>
            {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} étoiles</option>)}
          </select>
        </label>
        <label className="text-xs font-semibold text-ink-700">
          Du
          <input type="date" value={from} onChange={(event) => updateFilter(() => setFrom(event.target.value))}
            className="mt-1 block rounded-lg border border-ink-200 bg-paper-white px-3 py-2" />
        </label>
        <label className="text-xs font-semibold text-ink-700">
          Au
          <input type="date" value={to} onChange={(event) => updateFilter(() => setTo(event.target.value))}
            className="mt-1 block rounded-lg border border-ink-200 bg-paper-white px-3 py-2" />
        </label>
      </div>

      {error && <p role="alert" className="rounded-xl border border-negative-200 bg-negative-50 p-4 text-xs text-negative-800">{error}</p>}
      {isLoading ? <p role="status" className="text-sm text-ink-500">Chargement des avis…</p> : reviews.length === 0 ? (
        <p className="rounded-2xl border border-ink-200 bg-paper-white p-6 text-sm text-ink-500">Aucun avis pour ces filtres.</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <article key={review.id} className="rounded-2xl border border-ink-200 bg-paper-white p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="font-bold text-ink-900">{review.customerName || 'Client'} · {review.rating}/5</h3>
                  <p className="text-[0.6875rem] text-ink-500">
                    {review.order?.trackingCode ?? 'Avis historique'} · {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                  {review.order?.items.length ? (
                    <p className="mt-2 text-xs text-ink-500">
                      Plats : {review.order.items.map((item) => `${item.name} × ${item.quantity}`).join(', ')}
                    </p>
                  ) : null}
                  {review.comment && <p className="mt-3 whitespace-pre-wrap text-sm text-ink-700">{review.comment}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-[0.6875rem] font-bold ${review.isVisible ? 'bg-positive-100 text-positive-800' : 'bg-ink-100 text-ink-700'}`}>
                    {review.isVisible ? 'Visible' : 'Masqué'}
                  </span>
                  <button type="button" onClick={() => void moderateReview(review, !review.isVisible)}
                    className="rounded-lg border border-ink-200 px-3 py-2 text-xs font-bold text-ink-800">
                    {review.isVisible ? 'Masquer' : 'Réafficher'}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      {!isLoading && pageCount > 1 && (
        <nav className="flex items-center justify-between" aria-label="Pagination des avis">
          <button type="button" disabled={page <= 1} onClick={() => { setPage((value) => value - 1); setIsLoading(true); }}
            className="rounded-lg border border-ink-200 px-3 py-2 text-xs font-semibold disabled:opacity-50">Précédent</button>
          <span className="text-xs text-ink-600">Page {page} / {pageCount}</span>
          <button type="button" disabled={page >= pageCount} onClick={() => { setPage((value) => value + 1); setIsLoading(true); }}
            className="rounded-lg border border-ink-200 px-3 py-2 text-xs font-semibold disabled:opacity-50">Suivant</button>
        </nav>
      )}
    </section>
  );
};
