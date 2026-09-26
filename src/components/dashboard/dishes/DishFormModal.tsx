'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UtensilsCrossed, 
  X, 
  AlertTriangle, 
  Loader2, 
  Check, 
  Upload, 
  Link as LinkIcon, 
  Image as ImageIcon 
} from 'lucide-react';
import { DishData, DishFormData, CategoryOption } from './types';

interface DishFormModalProps {
  isOpen: boolean;
  editingDish: DishData | null;
  formData: DishFormData;
  categoriesList: CategoryOption[];
  onChangeFormData: (updated: DishFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  isSubmitting: boolean;
  formError: string | null;
}

export const DishFormModal: React.FC<DishFormModalProps> = ({
  isOpen,
  editingDish,
  formData,
  categoriesList,
  onChangeFormData,
  onSubmit,
  onClose,
  isSubmitting,
  formError,
}) => {
  // 'upload' par défaut si base64/upload, 'url' si c'est une adresse HTTP
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Détecter automatiquement le mode selon l'image existante à l'ouverture (ex: édition)
  useEffect(() => {
    if (formData.imageUrl?.startsWith('http://') || formData.imageUrl?.startsWith('https://')) {
      setImageMode('url');
    } else {
      setImageMode('upload');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Traitement du fichier uploadé (Conversion Data URL Base64)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      alert('Seuls les formats JPG, JPEG et PNG sont autorisés.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('La taille de l\'image ne doit pas dépasser 5 Mo.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      onChangeFormData({ ...formData, imageUrl: base64String });
    };
    reader.readAsDataURL(file);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-stone-200 shadow-2xl relative overflow-hidden"
        >
          {/* Entête Modal */}
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
              onClick={onClose}
              type="button"
              className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Affichage des Erreurs */}
          {formError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            {/* Nom, Prix, Catégorie */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Nom du plat <span className="text-amber-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => onChangeFormData({ ...formData, name: e.target.value })}
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
                  onChange={(e) => onChangeFormData({ ...formData, price: e.target.value })}
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
                  onChange={(e) => onChangeFormData({ ...formData, categoryId: e.target.value })}
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

            {/* Section Sélection/Upload Image */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-stone-700">
                  Image du plat <span className="text-amber-600">*</span>
                </label>
                {/* Sélecteur de Mode (Onglets) */}
                <div className="flex bg-stone-100 p-0.5 rounded-lg border border-stone-200">
                  <button
                    type="button"
                    onClick={() => {
                      setImageMode('upload');
                      onChangeFormData({ ...formData, imageUrl: '' });
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                      imageMode === 'upload'
                        ? 'bg-white text-stone-900 shadow-xs'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    <Upload className="w-3 h-3" />
                    Fichier
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setImageMode('url');
                      onChangeFormData({ ...formData, imageUrl: '' });
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                      imageMode === 'url'
                        ? 'bg-white text-stone-900 shadow-xs'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    <LinkIcon className="w-3 h-3" />
                    Lien Web
                  </button>
                </div>
              </div>

              {/* Mode 1: Upload de fichier */}
              {imageMode === 'upload' ? (
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full p-4 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                      formData.imageUrl
                        ? 'border-amber-500 bg-amber-500/5'
                        : 'border-stone-200 bg-stone-50 hover:bg-stone-100/80 hover:border-amber-400'
                    }`}
                  >
                    {formData.imageUrl ? (
                      <div className="flex items-center gap-3 w-full">
                        <img
                          src={formData.imageUrl}
                          alt="Aperçu"
                          className="w-14 h-14 rounded-xl object-cover border border-stone-200 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-stone-900 truncate">
                            Image téléchargée
                          </p>
                          <p className="text-[11px] text-amber-700 font-medium">
                            Cliquer pour changer d'image
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-1">
                        <div className="w-9 h-9 rounded-full bg-white border border-stone-200 flex items-center justify-center mx-auto mb-1.5 text-stone-500 shadow-xs">
                          <Upload className="w-4 h-4 text-amber-600" />
                        </div>
                        <p className="text-xs font-bold text-stone-800">
                          Téléverser une image
                        </p>
                        <p className="text-[10px] text-stone-400">
                          Formats : PNG, JPG, JPEG (Max 5Mo)
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Mode 2: Saisie par URL */
                <div className="space-y-2">
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => onChangeFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-all font-medium"
                  />
                  {formData.imageUrl && (
                    <div className="flex items-center gap-3 p-2 bg-stone-50 border border-stone-200 rounded-xl">
                      <img
                        src={formData.imageUrl}
                        alt="Aperçu"
                        className="w-12 h-12 rounded-lg object-cover shrink-0"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <span className="text-[11px] text-stone-500 truncate">
                        Aperçu de l'image
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Description / Ingrédients
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => onChangeFormData({ ...formData, description: e.target.value })}
                placeholder="Description attrayante ou ingrédients principaux..."
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-all font-medium resize-none"
              />
            </div>

            {/* Disponibilité */}
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
                onChange={(e) => onChangeFormData({ ...formData, isAvailable: e.target.checked })}
                className="w-5 h-5 accent-amber-600 rounded cursor-pointer"
              />
            </div>

            {/* Boutons d'action */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-stone-100">
              <button
                type="button"
                onClick={onClose}
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
    </AnimatePresence>
  );
};
