import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Icon } from '@/components/common/Icon';
import { RegisterFormData, UpdateFormFn } from '@/types';

interface Props {
  formData: RegisterFormData;
  updateForm: UpdateFormFn;
}

export const OwnerSection: React.FC<Props> = ({ formData, updateForm }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
    <h3 className="section-title">
      <Icon name="user" />
      <span>1. Responsable & Compte d&apos;accès</span>
    </h3>

    <div className="grid grid-cols-1 gap-4">
      <div>
        <label className="form-label">Nom complet *</label>
        <input type="text" required autoComplete="name" placeholder="Ex: Reine Dossou" value={formData.fullName}
          onChange={(e) => updateForm('fullName', e.target.value)}
          className="input-field rounded-full border-0 bg-ink-100" />
      </div>
      <div>
        <label className="form-label">Email professionnel *</label>
        <input type="email" required placeholder="Ex: contact@chezmama.bj" value={formData.email}
          onChange={(e) => updateForm('email', e.target.value)}
          className="input-field rounded-full border-0 bg-ink-100" />
      </div>
      <div>
        <label className="form-label">Téléphone de contact *</label>
        <input type="tel" required placeholder="Ex: +229 97 00 11 22" value={formData.phone}
          onChange={(e) => updateForm('phone', e.target.value)}
          className="input-field rounded-full border-0 bg-ink-100" />
      </div>
      <div>
        <label className="form-label">Mot de passe *</label>
        <div className="relative">
          <input type={showPassword ? 'text' : 'password'} required minLength={6} autoComplete="new-password" placeholder="Minimum 6 caractères" value={formData.password}
            onChange={(e) => updateForm('password', e.target.value)}
            className="input-field auth-input-trailing-action rounded-full border-0 bg-ink-100" />
          <button type="button" onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            aria-pressed={showPassword}
            className="absolute inset-y-0 right-0 px-3.5 flex items-center text-ink-500 hover:text-ink-900 focus-visible:outline-2 focus-visible:outline-brand-600 cursor-pointer">
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  </div>
  );
};
