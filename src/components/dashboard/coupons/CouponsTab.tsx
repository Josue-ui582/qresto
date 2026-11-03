'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Loader2, Plus, Tag, Trash2 } from 'lucide-react';

interface CouponData {
  id: string;
  code: string;
  discount: number;
  isPercentage: boolean;
  minOrder: number;
  startsAt: string | null;
  expiresAt: string | null;
  maxUses: number | null;
  usageCount: number;
  active: boolean;
}

interface CouponFormState {
  code: string;
  discount: string;
  isPercentage: boolean;
  minOrder: string;
  startsAt: string;
  expiresAt: string;
  maxUses: string;
  active: boolean;
}

const EMPTY_FORM: CouponFormState = {
  code: '',
  discount: '',
  isPercentage: true,
  minOrder: '0',
  startsAt: '',
  expiresAt: '',
  maxUses: '',
  active: true,
};

function toLocalDateTime(value: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

export const CouponsTab: React.FC<{ restaurantId: string; currency: string }> = ({ restaurantId, currency }) => {
  const [coupons, setCoupons] = useState<CouponData[]>([]);
  const [form, setForm] = useState<CouponFormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCoupons = useCallback(async (): Promise<CouponData[]> => {
    const response = await fetch(`/api/coupons?restaurantId=${encodeURIComponent(restaurantId)}`, {
      cache: 'no-store',
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Impossible de charger les promotions.');
    }
    return data.coupons;
  }, [restaurantId]);

  useEffect(() => {
    let active = true;
    void fetchCoupons()
      .then((loadedCoupons) => {
        if (!active) return;
        setCoupons(loadedCoupons);
        setError(null);
      })
      .catch((loadError: unknown) => {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : 'Impossible de charger les promotions.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [fetchCoupons]);

  const loadCoupons = async () => {
    try {
      setCoupons(await fetchCoupons());
      setError(null);
    } catch (loadError: unknown) {
      setError(loadError instanceof Error ? loadError.message : 'Impossible de charger les promotions.');
    }
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const saveCoupon = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setIsSaving(true);
      setError(null);
      const payload = {
        ...form,
        ...(editingId ? { id: editingId } : { restaurantId }),
        code: form.code.trim().toUpperCase(),
        discount: Number(form.discount),
        minOrder: Number(form.minOrder),
        maxUses: form.maxUses ? Number(form.maxUses) : null,
        startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      };
      const response = await fetch('/api/coupons', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Impossible d’enregistrer la promotion.');
      }
      resetForm();
      await loadCoupons();
    } catch (saveError: unknown) {
      setError(saveError instanceof Error ? saveError.message : 'Impossible d’enregistrer la promotion.');
    } finally {
      setIsSaving(false);
    }
  };

  const editCoupon = (coupon: CouponData) => {
    setEditingId(coupon.id);
    setForm({
      code: coupon.code,
      discount: String(coupon.discount),
      isPercentage: coupon.isPercentage,
      minOrder: String(coupon.minOrder),
      startsAt: toLocalDateTime(coupon.startsAt),
      expiresAt: toLocalDateTime(coupon.expiresAt),
      maxUses: coupon.maxUses === null ? '' : String(coupon.maxUses),
      active: coupon.active,
    });
  };

  const deleteCoupon = async (coupon: CouponData) => {
    if (!window.confirm(`Supprimer le code ${coupon.code} ?`)) return;
    try {
      const response = await fetch(`/api/coupons?id=${encodeURIComponent(coupon.id)}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Impossible de supprimer cette promotion.');
      }
      await loadCoupons();
    } catch (deleteError: unknown) {
      setError(deleteError instanceof Error ? deleteError.message : 'Impossible de supprimer cette promotion.');
    }
  };

  return (
    <div className="space-y-6">
      <header className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-stone-950">Coupons et promotions</h2>
            <p className="text-xs text-stone-500">Créez des codes contrôlés au moment de la commande.</p>
          </div>
        </div>
      </header>

      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800">{error}</div>}

      <form onSubmit={saveCoupon} className="bg-white rounded-3xl p-6 border border-stone-200/80 space-y-4">
        <h3 className="font-bold text-stone-900">{editingId ? 'Modifier le coupon' : 'Créer un coupon'}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <label className="text-xs font-semibold text-stone-700">
            Code
            <input required minLength={3} maxLength={30} pattern="[A-Za-z0-9_-]+" value={form.code}
              onChange={(event) => setForm((current) => ({ ...current, code: event.target.value.toUpperCase() }))}
              className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 uppercase" />
          </label>
          <label className="text-xs font-semibold text-stone-700">
            Remise
            <input required type="number" min={1} max={form.isPercentage ? 100 : 100000000} value={form.discount}
              onChange={(event) => setForm((current) => ({ ...current, discount: event.target.value }))}
              className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5" />
          </label>
          <label className="text-xs font-semibold text-stone-700">
            Type de remise
            <select value={form.isPercentage ? 'percentage' : 'fixed'}
              onChange={(event) => setForm((current) => ({ ...current, isPercentage: event.target.value === 'percentage' }))}
              className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5">
              <option value="percentage">Pourcentage</option>
              <option value="fixed">Montant fixe</option>
            </select>
          </label>
          <label className="text-xs font-semibold text-stone-700">
            Minimum de commande ({currency})
            <input type="number" min={0} required value={form.minOrder}
              onChange={(event) => setForm((current) => ({ ...current, minOrder: event.target.value }))}
              className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5" />
          </label>
          <label className="text-xs font-semibold text-stone-700">
            Début de validité
            <input type="datetime-local" value={form.startsAt}
              onChange={(event) => setForm((current) => ({ ...current, startsAt: event.target.value }))}
              className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5" />
          </label>
          <label className="text-xs font-semibold text-stone-700">
            Expiration
            <input type="datetime-local" value={form.expiresAt}
              onChange={(event) => setForm((current) => ({ ...current, expiresAt: event.target.value }))}
              className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5" />
          </label>
          <label className="text-xs font-semibold text-stone-700">
            Nombre maximal d’utilisations
            <input type="number" min={1} value={form.maxUses}
              onChange={(event) => setForm((current) => ({ ...current, maxUses: event.target.value }))}
              placeholder="Sans limite"
              className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5" />
          </label>
          <label className="flex items-center gap-2 text-xs font-semibold text-stone-700">
            <input type="checkbox" checked={form.active}
              onChange={(event) => setForm((current) => ({ ...current, active: event.target.checked }))} />
            Coupon actif
          </label>
        </div>
        <div className="flex gap-2">
          <button type="submit" disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-xl bg-stone-950 px-4 py-3 text-xs font-bold text-white disabled:opacity-50">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {editingId ? 'Enregistrer' : 'Créer le coupon'}
          </button>
          {editingId && <button type="button" onClick={resetForm} className="rounded-xl border px-4 py-3 text-xs font-bold">Annuler</button>}
        </div>
      </form>

      <section className="bg-white rounded-3xl p-6 border border-stone-200/80">
        <h3 className="mb-4 font-bold text-stone-900">Promotions existantes</h3>
        {isLoading ? <Loader2 className="h-6 w-6 animate-spin text-amber-600" /> : coupons.length === 0 ? (
          <p className="text-sm text-stone-500">Aucun code promotionnel.</p>
        ) : (
          <div className="space-y-3">
            {coupons.map((coupon) => (
              <article key={coupon.id} className="flex flex-col gap-3 rounded-2xl border border-stone-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="font-black text-stone-950">{coupon.code}</div>
                  <div className="text-xs text-stone-600">
                    {coupon.isPercentage ? `${coupon.discount}%` : `${coupon.discount.toLocaleString()} ${currency}`}
                    {' · '}minimum {coupon.minOrder.toLocaleString()} {currency}
                    {' · '}{coupon.usageCount}{coupon.maxUses === null ? ' utilisations' : ` / ${coupon.maxUses}`}
                  </div>
                  <div className="text-[11px] text-stone-500">
                    {coupon.active ? 'Actif' : 'Désactivé'}
                    {coupon.expiresAt ? ` · expire le ${new Date(coupon.expiresAt).toLocaleString('fr-FR')}` : ''}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => editCoupon(coupon)} className="rounded-lg border px-3 py-2 text-xs font-bold">Modifier</button>
                  <button type="button" onClick={() => void deleteCoupon(coupon)} aria-label={`Supprimer ${coupon.code}`}
                    className="rounded-lg border border-red-200 px-3 py-2 text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
