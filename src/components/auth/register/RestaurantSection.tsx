import React from 'react';
import { FaIcon } from '@/components/common/Icon';
import { RegisterFormData, UpdateFormFn } from '@/types';

interface Props {
  formData: RegisterFormData;
  updateForm: UpdateFormFn;
}

export const RestaurantSection: React.FC<Props> = ({ formData, updateForm }) => {
  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>, target: 'logoPreview' | 'coverPreview') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        updateForm(target, result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <h3 className="section-title">
        <FaIcon name="fa-solid fa-utensils" />
        <span>2. Profil de l'Établissement</span>
      </h3>
      <div className="space-y-4">
        <div>
          <label className="form-label">Nom du restaurant *</label>
          <input type="text" required placeholder="Ex: Chez Mama Cotonou" value={formData.restaurantName}
            onChange={(e) => updateForm('restaurantName', e.target.value)}
            className="input-field" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Ville au Bénin *</label>
            <select value={formData.city} onChange={(e) => updateForm('city', e.target.value)}
              className="input-field">
              <option value="Cotonou">Cotonou</option>
              <option value="Porto-Novo">Porto-Novo</option>
              <option value="Abomey-Calavi">Abomey-Calavi</option>
              <option value="Parakou">Parakou</option>
              <option value="Ouidah">Ouidah</option>
            </select>
          </div>
          <div>
            <label className="form-label">Catégorie culinaire *</label>
            <select value={formData.category} onChange={(e) => updateForm('category', e.target.value)}
              className="input-field">
              <option value="Cuisine Béninoise & Grillades">Cuisine Béninoise & Grillades</option>
              <option value="Poissons & Grillades Marines">Poissons & Grillades Marines</option>
              <option value="Burgers & Street Food Africaine">Burgers & Street Food Africaine</option>
              <option value="Lounge, Cocktails & Tapas">Lounge, Cocktails & Tapas</option>
              <option value="Pâtisserie & Salon de thé">Pâtisserie & Salon de thé</option>
            </select>
          </div>
        </div>
        <div>
          <label className="form-label">Adresse ou Quartier *</label>
          <input type="text" required placeholder="Ex: Haie Vive, Rue 340" value={formData.address}
            onChange={(e) => updateForm('address', e.target.value)}
            className="input-field" />
        </div>
        <div>
          <label className="form-label">Courte description</label>
          <textarea rows={2} placeholder="Vos spécialités phares, ambiance..." value={formData.description}
            onChange={(e) => updateForm('description', e.target.value)}
            className="input-field" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-3 bg-surface-alt rounded-2xl border border-soft">
            <label className="form-label">Logo du restaurant</label>
            <div className="flex items-center gap-3">
              <img src={formData.logoPreview} alt="Logo" className="w-14 h-14 rounded-xl object-cover border border-soft" />
              <div>
                <input type="file" accept="image/*" onChange={(e) => handleImageFile(e, 'logoPreview')}
                  className="text-xs text-muted file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary-soft file:text-brand hover:file:bg-amber-200" />
              </div>
            </div>
          </div>
          <div className="p-3 bg-surface-alt rounded-2xl border border-soft">
            <label className="form-label">Image de couverture / Bannière</label>
            <div className="flex items-center gap-3">
              <img src={formData.coverPreview} alt="Couverture" className="w-14 h-14 rounded-xl object-cover border border-soft" />
              <div>
                <input type="file" accept="image/*" onChange={(e) => handleImageFile(e, 'coverPreview')}
                  className="text-xs text-muted file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary-soft file:text-brand hover:file:bg-amber-200" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
