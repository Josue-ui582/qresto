'use client';

import React, { useCallback, useEffect, useState } from 'react';

interface InventoryMovementData {
  id: string;
  quantityChange: number;
  type: 'RESTOCK' | 'ADJUSTMENT' | 'ORDER';
  createdAt: string;
}

interface InventoryDishData {
  id: string;
  name: string;
  isAvailable: boolean;
  stockQuantity: number | null;
  lowStockThreshold: number | null;
  inventoryMovements: InventoryMovementData[];
}

export const InventoryTab: React.FC<{ restaurantId: string }> = ({ restaurantId }) => {
  const [dishes, setDishes] = useState<InventoryDishData[]>([]);
  const [quantities, setQuantities] = useState<Record<string, string>>({});
  const [thresholds, setThresholds] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [savingDishId, setSavingDishId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchInventory = useCallback(async () => {
    const response = await fetch(`/api/inventory?restaurantId=${encodeURIComponent(restaurantId)}`, {
      cache: 'no-store',
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Impossible de charger l’inventaire.');
    }
    return result.dishes as InventoryDishData[];
  }, [restaurantId]);

  useEffect(() => {
    let active = true;
    void fetchInventory()
      .then((loadedDishes) => {
        if (!active) return;
        setDishes(loadedDishes);
        setQuantities(Object.fromEntries(loadedDishes.map((dish) => [
          dish.id, String(dish.stockQuantity ?? 0),
        ])));
        setThresholds(Object.fromEntries(loadedDishes.map((dish) => [
          dish.id, String(dish.lowStockThreshold ?? 5),
        ])));
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Impossible de charger l’inventaire.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [fetchInventory]);

  const saveInventory = async (dish: InventoryDishData) => {
    const quantity = Number(quantities[dish.id]);
    const lowStockThreshold = Number(thresholds[dish.id]);
    if (!Number.isSafeInteger(quantity) || quantity < 0 ||
      !Number.isSafeInteger(lowStockThreshold) || lowStockThreshold < 0) {
      setError('Les quantités et seuils doivent être des nombres entiers positifs ou nuls.');
      return;
    }

    try {
      setSavingDishId(dish.id);
      setError(null);
      setNotice(null);
      const response = await fetch('/api/inventory', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dishId: dish.id, quantity, lowStockThreshold }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Impossible d’enregistrer le stock.');
      }
      const loadedDishes = await fetchInventory();
      setDishes(loadedDishes);
      setQuantities(Object.fromEntries(loadedDishes.map((item) => [
        item.id, String(item.stockQuantity ?? 0),
      ])));
      setThresholds(Object.fromEntries(loadedDishes.map((item) => [
        item.id, String(item.lowStockThreshold ?? 5),
      ])));
      setNotice(`Stock de « ${dish.name} » mis à jour.`);
    } catch (saveError: unknown) {
      setError(saveError instanceof Error ? saveError.message : 'Impossible d’enregistrer le stock.');
    } finally {
      setSavingDishId(null);
    }
  };

  const lowStockCount = dishes.filter((dish) =>
    dish.stockQuantity !== null &&
    dish.lowStockThreshold !== null &&
    dish.stockQuantity <= dish.lowStockThreshold
  ).length;

  return (
    <section className="space-y-5">
      <header className="rounded-3xl border border-stone-200/80 bg-white p-6 sm:p-8">
        <h2 className="text-xl font-black text-stone-950">Gestion du stock</h2>
        <p className="mt-1 text-xs text-stone-500">Le stock est décrémenté avec la commande. Les plats épuisés sont automatiquement désactivés.</p>
        <p className="mt-3 text-xs font-bold text-amber-800">{lowStockCount} plat(s) au seuil d’alerte ou en rupture.</p>
      </header>
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800">{error}</p>}
      {notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800">{notice}</p>}
      {isLoading ? <p className="text-sm text-stone-500">Chargement de l’inventaire…</p> : dishes.length === 0 ? (
        <p className="rounded-2xl border border-stone-200 bg-white p-6 text-sm text-stone-500">Ajoutez des plats avant de configurer l’inventaire.</p>
      ) : (
        <div className="space-y-4">
          {dishes.map((dish) => {
            const isTracked = dish.stockQuantity !== null;
            const isLow = dish.stockQuantity !== null &&
              dish.lowStockThreshold !== null &&
              dish.stockQuantity <= dish.lowStockThreshold;
            return (
              <article key={dish.id} className="rounded-2xl border border-stone-200 bg-white p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <h3 className="font-bold text-stone-900">{dish.name}</h3>
                    <p className={`mt-1 text-xs font-semibold ${!isTracked ? 'text-stone-500' : isLow ? 'text-red-700' : 'text-emerald-700'}`}>
                      {!isTracked ? 'Suivi du stock non activé' : isLow ? 'Stock bas ou épuisé' : 'Stock disponible'}
                      {isTracked && !dish.isAvailable ? ' · plat désactivé' : ''}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-stone-500">
                      {dish.inventoryMovements.map((movement) => (
                        <span key={movement.id} className="rounded-full bg-stone-100 px-2.5 py-1">
                          {movement.type === 'ORDER' ? 'Commande' : movement.type === 'RESTOCK' ? 'Réapprovisionnement' : 'Ajustement'}
                          {' '}{movement.quantityChange > 0 ? '+' : ''}{movement.quantityChange}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-end gap-3">
                    <label className="text-xs font-semibold text-stone-700">
                      Quantité en stock
                      <input type="number" min={0} step={1} value={quantities[dish.id] ?? '0'}
                        onChange={(event) => setQuantities((current) => ({ ...current, [dish.id]: event.target.value }))}
                        className="mt-1 block w-28 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5" />
                    </label>
                    <label className="text-xs font-semibold text-stone-700">
                      Seuil d’alerte
                      <input type="number" min={0} step={1} value={thresholds[dish.id] ?? '5'}
                        onChange={(event) => setThresholds((current) => ({ ...current, [dish.id]: event.target.value }))}
                        className="mt-1 block w-28 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5" />
                    </label>
                    <button type="button" disabled={savingDishId === dish.id}
                      onClick={() => void saveInventory(dish)}
                      className="rounded-xl bg-stone-900 px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50">
                      {savingDishId === dish.id ? 'Enregistrement…' : isTracked ? 'Enregistrer' : 'Activer le suivi'}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};
