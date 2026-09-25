'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  UtensilsCrossed,
  Plus,
  Search,
  Edit3,
  Trash2,
  Loader2,
  X,
  Check,
  AlertTriangle,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Tag,
  Filter,
  CheckCircle2,
} from 'lucide-react';

export interface CategoryOption {
  id: string;
  name: string;
}

export interface DishData {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  isAvailable: boolean;
  categoryId: string;
  restaurantId: string;
  category?: CategoryOption;
}

interface DishesTabProps {
  restaurantId?: string;
  dishes?: DishData[];
  categories?: CategoryOption[];
  onRefreshNeeded?: () => void;
}

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
  const [formData, setFormData] = useState({
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
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const showNotice = (type: 'success' | 'error', msg: string) => {
    setActionNotice({ type, msg });
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Chargement des données depuis l'API
  const fetchData = async () => {
    try {
      setIsLoading(true);

      // Charger les plats
      const dishesUrl = restaurantId ? `/api/dishes?restaurantId=${restaurantId}` : '/api/dishes';
      const resDishes = await fetch(dishesUrl);
      const dataDishes = await resDishes.json();
      if (dataDishes.success) {
        setDishesList(dataDishes.dishes || []);
      }

      // Charger les catégories pour le filtre & le formulaire si non transmises
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

  // Filtrage combiné par recherche et par catégorie
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

  // Statistiques
  const stats = useMemo(() => {
    const total = dishesList.length;
    const available = dishesList.filter((d) => d.isAvailable).length;
    const unavailable = total - available;
    return { total, available, unavailable };
  }, [dishesList]);

  // Bascule rapide de disponibilité (Oui / Non)
  const handleToggleAvailability = async (dish: DishData) => {
    try {
      const newStatus = !dish.isAvailable;

      // Mise à jour optimiste dans l'IHM
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
        // Revenir en arrière en cas d'erreur
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

  // Ouverture Modal Création
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

  // Ouverture Modal Édition
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

  // Soumission Formulaire
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

  // Suppression
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
              className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header & Statistiques */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-amber-700 mb-1">
            <UtensilsCrossed className="w-4 h-4 text-amber-600" />
            <span>Gestion de la Carte</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-950 font-display">
            Plats et Menu
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 font-normal">
            Gérez vos plats, ajustez leurs prix et activez/désactivez leur disponibilité en temps réel.
          </p>
        </div>

        {/* Métriques */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="px-4 py-3 rounded-2xl bg-[#fbf9f5] border border-stone-200/80 text-center min-w-25">
            <span className="block text-2xl font-black text-stone-950 font-display">
              {stats.total}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
              Total Plats
            </span>
          </div>
          <div className="px-4 py-3 rounded-2xl bg-emerald-50/50 border border-emerald-200/60 text-center min-w-25">
            <span className="block text-2xl font-black text-emerald-700 font-display">
              {stats.available}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
              En Carte
            </span>
          </div>
          <div className="px-4 py-3 rounded-2xl bg-amber-50/50 border border-amber-200/60 text-center min-w-25">
            <span className="block text-2xl font-black text-amber-700 font-display">
              {stats.unavailable}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
              Épuisés
            </span>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleOpenCreateModal}
            className="px-5 py-3.5 rounded-2xl bg-stone-950 hover:bg-stone-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Ajouter un plat</span>
          </motion.button>
        </div>
      </div>

      {/* Barre de Recherche, Filtre Catégorie & Rafraîchissement */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200/80">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un plat (nom, ingrédient...)"
            className="w-full pl-10 pr-4 py-2 bg-stone-50 text-stone-900 placeholder-stone-400 rounded-xl border border-stone-200 text-xs sm:text-sm font-medium focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Filtre par Catégorie */}
          <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 px-3 py-1.5 rounded-xl w-full md:w-auto">
            <Filter className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-stone-700 outline-none cursor-pointer w-full"
            >
              <option value="all">Toutes les catégories</option>
              {categoriesList.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={fetchData}
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 transition-colors cursor-pointer shrink-0"
            title="Rafraîchir"
          >
            <Loader2 className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Grille des Plats */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-stone-400 bg-white rounded-3xl border border-stone-200/80">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600 mb-3" />
          <span className="text-xs font-semibold">Chargement du menu...</span>
        </div>
      ) : filteredDishes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDishes.map((dish) => (
            <motion.div
              key={dish.id}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className={`bg-white rounded-3xl border overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group ${
                dish.isAvailable ? 'border-stone-200/90' : 'border-stone-200 bg-stone-50/50'
              }`}
            >
              <div>
                {/* Visual Image / Placeholder */}
                <div className="relative h-44 bg-stone-100 w-full overflow-hidden">
                  {dish.imageUrl ? (
                    <img
                      src={dish.imageUrl}
                      alt={dish.name}
                      className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                        !dish.isAvailable ? 'grayscale opacity-75' : ''
                      }`}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-stone-300">
                      <ImageIcon className="w-8 h-8 mb-1" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        Pas d'image
                      </span>
                    </div>
                  )}

                  {/* Badge Disponibilité sur l'image */}
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={() => handleToggleAvailability(dish)}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md backdrop-blur-md flex items-center gap-1.5 cursor-pointer transition-all ${
                        dish.isAvailable
                          ? 'bg-emerald-500/90 text-white hover:bg-emerald-600'
                          : 'bg-stone-900/80 text-amber-400 hover:bg-stone-900'
                      }`}
                    >
                      {dish.isAvailable ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Disponible</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3 text-amber-400" />
                          <span>Épuisé</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Badge Catégorie */}
                  {dish.category && (
                    <div className="absolute bottom-3 left-3">
                      <span className="px-2.5 py-1 rounded-xl bg-stone-950/80 text-stone-200 text-[10px] font-bold backdrop-blur-md flex items-center gap-1">
                        <Tag className="w-3 h-3 text-amber-400" />
                        <span>{dish.category.name}</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Contenu Texte */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h3 className="text-base font-bold text-stone-950 font-display group-hover:text-amber-700 transition-colors line-clamp-1">
                      {dish.name}
                    </h3>
                    <span className="text-sm font-black text-amber-700 font-display shrink-0">
                      {dish.price.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>

                  <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed font-normal min-h-8">
                    {dish.description || 'Aucune description saisie pour ce plat.'}
                  </p>
                </div>
              </div>

              {/* Actions Carte */}
              <div className="p-5 pt-0 flex items-center justify-between border-t border-stone-100 mt-2">
                <button
                  onClick={() => handleToggleAvailability(dish)}
                  className="text-stone-500 hover:text-stone-900 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  {dish.isAvailable ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-stone-400" />
                      <span>Masquer</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5 text-amber-600" />
                      <span>Réactiver</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditModal(dish)}
                    className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Éditer</span>
                  </button>

                  <button
                    onClick={() => setDeletingId(dish.id)}
                    className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* État vide */
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

      {/* ================= MODAL CRÉATION / ÉDITION ================= */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-stone-200 shadow-2xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
                    <UtensilsCrossed className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-stone-950 font-display">
                      {editingDish ? 'Éditer le plat' : 'Nouveau plat'}
                    </h3>
                    <p className="text-[11px] text-stone-500">
                      Ajustez les informations présentées au client.
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      Nom du plat <span className="text-amber-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Poulet Yassa, Alloco Poisson, Mojito..."
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-all font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      Prix (FCFA) <span className="text-amber-600">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      step={50}
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="Ex: 3500"
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-all font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      Catégorie <span className="text-amber-600">*</span>
                    </label>
                    <select
                      required
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-all font-medium cursor-pointer"
                    >
                      <option value="" disabled>
                        Sélectionner...
                      </option>
                      {categoriesList.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    URL de l'image (facultatif)
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Description / Ingrédients
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Description attrayante ou ingrédients principaux..."
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-all font-medium resize-none"
                  />
                </div>

                {/* Option de disponibilité */}
                <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between">
                  <div>
                    <span className="block text-xs font-bold text-stone-900">
                      Disponible à la commande
                    </span>
                    <span className="text-[11px] text-stone-500">
                      Décochez si le plat est temporairement en rupture de stock.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                    className="w-5 h-5 accent-amber-600 rounded cursor-pointer"
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
                        <span>{editingDish ? 'Mettre à jour' : 'Créer le plat'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL SUPPRESSION ================= */}
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
                Supprimer ce plat ?
              </h3>
              <p className="text-xs text-stone-500 mb-6 leading-relaxed">
                Le plat sera définitivement retiré du menu interactif de vos clients.
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
                  onClick={() => handleDeleteDish(deletingId)}
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
