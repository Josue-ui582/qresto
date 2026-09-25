'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, UtensilsCrossed, FolderPlus, Check, AlertTriangle, X } from 'lucide-react';
import { CategoryData, CategoryFormData, CategoriesTabProps, ActionNoticeState } from './types';
import { CategoriesHeader } from './CategoriesHeader';
import { CategorySearchBar } from './CategorySearchBar';
import { CategoryCard } from './CategoryCard';
import { CategoryFormModal } from './CategoryFormModal';
import { DeleteCategoryModal } from './DeleteCategoryModal';

export const CategoriesTab: React.FC<CategoriesTabProps> = ({
  restaurantId,
  categories: initialCategories = [],
  onRefreshNeeded,
}) => {
  const [categoriesList, setCategoriesList] = useState<CategoryData[]>(initialCategories);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // États du Formulaire
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<CategoryData | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    sortOrder: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // États de Suppression
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [actionNotice, setActionNotice] = useState<ActionNoticeState | null>(null);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const url = restaurantId
        ? `/api/categories?restaurantId=${restaurantId}`
        : '/api/categories';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setCategoriesList(data.categories || []);
      }
    } catch (err) {
      console.error('Erreur chargement catégories:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [restaurantId]);

  const showNotice = (type: 'success' | 'error', msg: string) => {
    setActionNotice({ type, msg });
    setTimeout(() => setActionNotice(null), 4000);
  };

  const filteredCategories = useMemo(() => {
    return categoriesList.filter(
      (cat) =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (cat.description && cat.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [categoriesList, searchQuery]);

  const totalDishesCount = useMemo(() => {
    return categoriesList.reduce((acc, cat) => acc + (cat._count?.dishes || 0), 0);
  }, [categoriesList]);

  const handleOpenCreateModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '', sortOrder: categoriesList.length + 1 });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (category: CategoryData) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      sortOrder: category.sortOrder || 0,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Le nom de la catégorie est obligatoire.');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);

      const method = editingCategory ? 'PUT' : 'POST';
      const payload = editingCategory
        ? { id: editingCategory.id, ...formData }
        : { ...formData, restaurantId: restaurantId || '' };

      const res = await fetch('/api/categories', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Une erreur est survenue.');
      }

      showNotice(
        'success',
        editingCategory ? 'Catégorie mise à jour avec succès.' : 'Nouvelle catégorie créée !'
      );
      setIsModalOpen(false);
      fetchCategories();
      if (onRefreshNeeded) onRefreshNeeded();
    } catch (err: any) {
      setFormError(err.message || 'Erreur lors de la sauvegarde.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/categories?id=${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erreur lors de la suppression.');
      }

      showNotice('success', 'Catégorie supprimée avec succès.');
      setDeletingId(null);
      fetchCategories();
      if (onRefreshNeeded) onRefreshNeeded();
    } catch (err: any) {
      showNotice('error', err.message || 'Impossible de supprimer cette catégorie.');
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
            className={`p-4 rounded-2xl flex items-center justify-between border text-xs sm:text-sm font-bold shadow-lg ${
              actionNotice.type === 'success'
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
              className="text-stone-400 hover:text-stone-700 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <CategoriesHeader
        categoriesCount={categoriesList.length}
        totalDishesCount={totalDishesCount}
        onOpenCreateModal={handleOpenCreateModal}
      />

      <CategorySearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onRefresh={fetchCategories}
        isLoading={isLoading}
      />

      {/* Grille des Catégories */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-stone-400 bg-white rounded-3xl border border-stone-200/80">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600 mb-3" />
          <span className="text-xs font-semibold">Chargement des catégories depuis la BDD...</span>
        </div>
      ) : filteredCategories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCategories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
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
            {searchQuery ? 'Aucun résultat trouvé' : 'Aucune catégorie disponible'}
          </h3>
          <p className="text-xs text-stone-500 mt-1 mb-6 leading-relaxed font-normal">
            {searchQuery
              ? `Aucune catégorie ne correspond à "${searchQuery}". Essayez d'autres mots-clés.`
              : 'Commencez par ajouter votre première catégorie (ex: Entrées, Plats principaux, Boissons) pour structurer votre menu.'}
          </p>

          {!searchQuery && (
            <button
              onClick={handleOpenCreateModal}
              className="px-5 py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs inline-flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Créer ma première catégorie</span>
            </button>
          )}
        </div>
      )}

      {/* Modales */}
      <CategoryFormModal
        isOpen={isModalOpen}
        editingCategory={editingCategory}
        formData={formData}
        onChangeFormData={setFormData}
        onSubmit={handleSubmitForm}
        onClose={() => setIsModalOpen(false)}
        isSubmitting={isSubmitting}
        formError={formError}
      />

      <DeleteCategoryModal
        deletingId={deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteCategory}
        isDeleting={isDeleting}
      />
    </div>
  );
};
