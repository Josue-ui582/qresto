'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FolderPlus,
  Plus,
  Search,
  Edit3,
  Trash2,
  UtensilsCrossed,
  Loader2,
  X,
  Check,
  AlertTriangle,
  FolderTree,
  ArrowUpDown,
  Layers,
} from 'lucide-react';

export interface CategoryData {
  id: string;
  name: string;
  description?: string | null;
  sortOrder?: number;
  restaurantId: string;
  _count?: {
    dishes: number;
  };
}

interface CategoriesTabProps {
  restaurantId?: string;
  categories?: CategoryData[];
  onRefreshNeeded?: () => void;
  onOpenCategoryModal: () => void;
}

export const CategoriesTab: React.FC<CategoriesTabProps> = ({
  restaurantId,
  categories: initialCategories = [],
  onRefreshNeeded,
  onOpenCategoryModal
}) => {
  const [categoriesList, setCategoriesList] = useState<CategoryData[]>(initialCategories);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // États Modal Formulaire
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<CategoryData | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', sortOrder: 0 });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // État Suppression Confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Charger les données de la BDD si nécessaire
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

  // Toast / notification temporaire
  const showNotice = (type: 'success' | 'error', msg: string) => {
    setActionNotice({ type, msg });
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Filtrage par recherche
  const filteredCategories = useMemo(() => {
    return categoriesList.filter((cat) =>
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cat.description && cat.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [categoriesList, searchQuery]);

  // Total des plats représentés
  const totalDishesCount = useMemo(() => {
    return categoriesList.reduce((acc, cat) => acc + (cat._count?.dishes || 0), 0);
  }, [categoriesList]);

  // Ouvrir Modal Création
  const handleOpenCreateModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '', sortOrder: categoriesList.length + 1 });
    setFormError(null);
    setIsModalOpen(true);
  };

  // Ouvrir Modal Édition
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

  // Soumission Formulaire (Création / Modification)
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

  // Supprimer une catégorie
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
      {/* Notifications Flottantes */}
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

      {/* Header & Statistiques Rapides */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-amber-700 mb-1">
            <FolderTree className="w-4 h-4 text-amber-600" />
            <span>Organisation du Menu</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-950 font-display">
            Catégories de Plats
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 font-normal">
            Structurez votre carte en catégories claires pour faciliter la commande à vos clients.
          </p>
        </div>

        {/* Métriques */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-3 rounded-2xl bg-[#fbf9f5] border border-stone-200/80 text-center min-w-27.5">
            <span className="block text-2xl font-black text-stone-950 font-display">
              {categoriesList.length}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
              Catégories
            </span>
          </div>
          <div className="px-4 py-3 rounded-2xl bg-[#fbf9f5] border border-stone-200/80 text-center min-w-27.5">
            <span className="block text-2xl font-black text-amber-600 font-display">
              {totalDishesCount}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
              Plats Associés
            </span>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleOpenCreateModal}
            className="px-5 py-3.5 rounded-2xl bg-stone-950 hover:bg-stone-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Ajouter une catégorie</span>
          </motion.button>
        </div>
      </div>

      {/* Barre de Recherche et Filtres */}
      <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200/80">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une catégorie..."
            className="w-full pl-10 pr-4 py-2 bg-stone-50 text-stone-900 placeholder-stone-400 rounded-xl border border-stone-200 text-xs sm:text-sm font-medium focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
          />
        </div>
        <button
          onClick={fetchCategories}
          disabled={isLoading}
          className="p-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 transition-colors cursor-pointer"
          title="Rafraîchir"
        >
          <Loader2 className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-600' : ''}`} />
        </button>
      </div>

      {/* Liste / Grille des Catégories */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-stone-400 bg-white rounded-3xl border border-stone-200/80">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600 mb-3" />
          <span className="text-xs font-semibold">Chargement des catégories depuis la BDD...</span>
        </div>
      ) : filteredCategories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCategories.map((category) => {
            const dishCount = category._count?.dishes || 0;

            return (
              <motion.div
                key={category.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold text-xs">
                        #{category.sortOrder || 0}
                      </div>
                      <h3 className="text-base font-bold text-stone-950 group-hover:text-amber-700 transition-colors font-display">
                        {category.name}
                      </h3>
                    </div>

                    <span className="px-2.5 py-1 rounded-lg bg-stone-100 text-stone-600 text-[11px] font-bold shrink-0 flex items-center gap-1">
                      <Layers className="w-3 h-3 text-amber-600" />
                      <span>{dishCount} plat{dishCount > 1 ? 's' : ''}</span>
                    </span>
                  </div>

                  <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed mb-6 font-normal min-h-8">
                    {category.description || 'Aucune description renseignée pour cette catégorie.'}
                  </p>
                </div>

                {/* Actions sur la carte */}
                <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Ordre : {category.sortOrder || 0}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditModal(category)}
                      className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Éditer</span>
                    </button>

                    <button
                      onClick={() => setDeletingId(category.id)}
                      className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* État vide */
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

      {/* ================= MODAL CRÉATION / ÉDITION ================= */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 border border-stone-200 shadow-2xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
                    <FolderPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-stone-950 font-display">
                      {editingCategory ? 'Éditer la catégorie' : 'Nouvelle catégorie'}
                    </h3>
                    <p className="text-[11px] text-stone-500">
                      Renseignez les détails ci-dessous.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {formError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmitForm} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Nom de la catégorie <span className="text-amber-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Entrées froides, Desserts, Grillades..."
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Description (facultatif)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brève explication affichée sur la carte..."
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-all font-medium resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Ordre d'affichage
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.sortOrder}
                    onChange={(e) =>
                      setFormData({ ...formData, sortOrder: parseInt(e.target.value, 10) || 0 })
                    }
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-all font-medium"
                  />
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-stone-950 hover:bg-stone-800 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                        <span>Enregistrement...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 text-amber-400" />
                        <span>{editingCategory ? 'Mettre à jour' : 'Créer'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL CONFIRMATION SUPPRESSION ================= */}
      <AnimatePresence>
        {deletingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-sm w-full p-6 text-center border border-stone-200 shadow-2xl"
            >
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-stone-950 font-display mb-1">
                Supprimer la catégorie ?
              </h3>
              <p className="text-xs text-stone-500 mb-6 leading-relaxed">
                Cette action est irréversible. Vérifiez qu'aucun plat n'est rattaché à cette catégorie avant de continuer.
              </p>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setDeletingId(null)}
                  disabled={isDeleting}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 text-xs font-bold transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleDeleteCategory(deletingId)}
                  disabled={isDeleting}
                  className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  <span>Confirmer</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
