'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  UtensilsCrossed,
  Plus,
  Loader2,
  X,
  Check,
  AlertTriangle,
} from 'lucide-react';
import {
  DishData,
  CategoryOption,
  DishFormData,
  DishesTabProps,
  ActionNoticeState,
} from './types';
import { DishesHeader } from './DishesHeader';
import { DishSearchBar } from './DishSearchBar';
import { DishCard } from './DishCard';
import { DishFormModal } from './DishFormModal';
import { DeleteDishModal } from './DeleteDishModal';

export const DishesTab: React.FC<DishesTabProps> = ({
  restaurantId,
  dishes: initialDishes = [],
  categories: initialCategories = [],
  onRefreshNeeded,
}) => {
  const [dishesList, setDishesList] = useState<DishData[]>(initialDishes);
  const [categoriesList, setCategoriesList] = useState<CategoryOption[]>(initialCategories);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  // Modal Création / Édition
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingDish, setEditingDish] = useState<DishData | null>(null);
  const [formData, setFormData] = useState<DishFormData>({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    categoryId: '',
    isAvailable: true,
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Suppression
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Notification Toast
  const [actionNotice, setActionNotice] = useState<ActionNoticeState | null>(null);

  const showNotice = (type: 'success' | 'error', msg: string) => {
    setActionNotice({ type, msg });
    setTimeout(() => setActionNotice(null), 4000);
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);

      const dishesUrl = restaurantId ? `/api/dishes?restaurantId=${restaurantId}` : '/api/dishes';
      const resDishes = await fetch(dishesUrl);
      const dataDishes = await resDishes.json();
      if (dataDishes.success) {
        setDishesList(dataDishes.dishes || []);
      }

      if (initialCategories.length === 0) {
        const catUrl = restaurantId ? `/api/categories?restaurantId=${restaurantId}` : '/api/categories';
        const resCat = await fetch(catUrl);
        const dataCat = await resCat.json();
        if (dataCat.success) {
          setCategoriesList(dataCat.categories || []);
        }
      }
    } catch (err) {
      console.error('Erreur chargement plats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [restaurantId]);

  const filteredDishes = useMemo(() => {
    return dishesList.filter((dish) => {
      const matchesSearch =
        dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (dish.description && dish.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategoryFilter === 'all' || dish.categoryId === selectedCategoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [dishesList, searchQuery, selectedCategoryFilter]);

  const stats = useMemo(() => {
    const total = dishesList.length;
    const available = dishesList.filter((d) => d.isAvailable).length;
    const unavailable = total - available;
    return { total, available, unavailable };
  }, [dishesList]);

  const handleToggleAvailability = async (dish: DishData) => {
    try {
      const newStatus = !dish.isAvailable;

      // Mise à jour optimiste dans l'UI
      setDishesList((prev) =>
        prev.map((d) => (d.id === dish.id ? { ...d, isAvailable: newStatus } : d))
      );

      const res = await fetch('/api/dishes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: dish.id, isAvailable: newStatus }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        // Rollback
        setDishesList((prev) =>
          prev.map((d) => (d.id === dish.id ? { ...d, isAvailable: dish.isAvailable } : d))
        );
        showNotice('error', 'Échec du changement de disponibilité.');
      } else {
        showNotice(
          'success',
          `Plat ${newStatus ? 'rendu disponible' : 'marqué comme indisponible'}.`
        );
      }
    } catch (err) {
      console.error('Erreur bascule disponibilité:', err);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingDish(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      imageUrl: '',
      categoryId: categoriesList.length > 0 ? categoriesList[0].id : '',
      isAvailable: true,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (dish: DishData) => {
    setEditingDish(dish);
    setFormData({
      name: dish.name,
      description: dish.description || '',
      price: dish.price.toString(),
      imageUrl: dish.imageUrl || '',
      categoryId: dish.categoryId,
      isAvailable: dish.isAvailable,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setFormError('Le nom du plat est obligatoire.');
      return;
    }
    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) < 0) {
      setFormError('Veuillez saisir un prix valide.');
      return;
    }
    if (!formData.categoryId) {
      setFormError('Veuillez sélectionner une catégorie.');
      return;
    }
    if (!formData.imageUrl || !formData.imageUrl.trim()) {
      setFormError('L\'image du plat est obligatoire (fichier ou URL).');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);

      const method = editingDish ? 'PUT' : 'POST';
      const payload = editingDish
        ? { id: editingDish.id, ...formData, price: Number(formData.price) }
        : { ...formData, price: Number(formData.price), restaurantId: restaurantId || '' };

      const res = await fetch('/api/dishes', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erreur lors de la sauvegarde.');
      }

      showNotice('success', editingDish ? 'Plat mis à jour !' : 'Nouveau plat ajouté au menu !');
      setIsModalOpen(false);
      fetchData();
      if (onRefreshNeeded) onRefreshNeeded();
    } catch (err: any) {
      setFormError(err.message || 'Erreur lors de la sauvegarde.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDish = async (id: string) => {
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/dishes?id=${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erreur lors de la suppression.');
      }

      showNotice('success', 'Plat supprimé du menu.');
      setDeletingId(null);
      fetchData();
      if (onRefreshNeeded) onRefreshNeeded();
    } catch (err: any) {
      showNotice('error', err.message || 'Impossible de supprimer ce plat.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      <AnimatePresence>
        {actionNotice && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-2xl flex items-center justify-between border text-xs sm:text-sm font-bold shadow-lg ${actionNotice.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
              }`}
          >
            <div className="flex items-center gap-2">
              {actionNotice.type === 'success' ? (
                <Check className="w-5 h-5 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              )}
              <span>{actionNotice.msg}</span>
            </div>
            <button
              onClick={() => setActionNotice(null)}
              className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <DishesHeader stats={stats} onOpenCreateModal={handleOpenCreateModal} />

      <DishSearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategoryFilter={selectedCategoryFilter}
        onCategoryFilterChange={setSelectedCategoryFilter}
        categoriesList={categoriesList}
        onRefresh={fetchData}
        isLoading={isLoading}
      />

      {/* Grille des Plats */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-stone-400 bg-white rounded-3xl border border-stone-200/80">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600 mb-3" />
          <span className="text-xs font-semibold">Chargement du menu...</span>
        </div>
      ) : filteredDishes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDishes.map((dish) => (
            <DishCard
              key={dish.id}
              dish={dish}
              onToggleAvailability={handleToggleAvailability}
              onEdit={handleOpenEditModal}
              onDeleteRequest={setDeletingId}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/80 max-w-lg mx-auto my-8">
          <div className="w-14 h-14 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <UtensilsCrossed className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-stone-900 font-display">
            {searchQuery || selectedCategoryFilter !== 'all'
              ? 'Aucun plat correspondant'
              : 'Votre menu est encore vide'}
          </h3>
          <p className="text-xs text-stone-500 mt-1 mb-6 leading-relaxed font-normal">
            {searchQuery || selectedCategoryFilter !== 'all'
              ? 'Ajustez vos filtres de recherche pour afficher vos plats.'
              : 'Commencez par ajouter les spécialités de votre restaurant pour régaler vos clients.'}
          </p>

          <button
            onClick={handleOpenCreateModal}
            className="px-5 py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs inline-flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter mon premier plat</span>
          </button>
        </div>
      )}

      {/* Modales */}
      <DishFormModal
        isOpen={isModalOpen}
        editingDish={editingDish}
        formData={formData}
        categoriesList={categoriesList}
        onChangeFormData={setFormData}
        onSubmit={handleSubmitForm}
        onClose={() => setIsModalOpen(false)}
        isSubmitting={isSubmitting}
        formError={formError}
      />

      <DeleteDishModal
        deletingId={deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteDish}
        isDeleting={isDeleting}
      />
    </div>
  );
};