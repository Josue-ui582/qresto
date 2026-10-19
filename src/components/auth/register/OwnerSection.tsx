import React from 'react';
import { FaIcon } from '@/components/common/Icon';
import { RegisterFormData, UpdateFormFn } from '@/types';

interface Props {
  formData: RegisterFormData;
  updateForm: UpdateFormFn;
}

export const OwnerSection: React.FC<Props> = ({ formData, updateForm }) => (
  <div>
    <h3 className="section-title">
      <FaIcon name="fa-solid fa-user" />
      <span>1. Responsable & Compte d&apos;accès</span>
    </h3>

    <div className="grid grid-cols-1 gap-4">
      <div>
        <label className="form-label">Nom complet *</label>
        <input type="text" required autoComplete="name" placeholder="Ex: Reine Dossou" value={formData.fullName}
          onChange={(e) => updateForm('fullName', e.target.value)}
          className="input-field rounded-full border-0 bg-stone-100" />
      </div>
      <div>
        <label className="form-label">Email professionnel *</label>
        <input type="email" required placeholder="Ex: contact@chezmama.bj" value={formData.email}
          onChange={(e) => updateForm('email', e.target.value)}
          className="input-field rounded-full border-0 bg-stone-100" />
      </div>
      <div>
        <label className="form-label">Téléphone de contact *</label>
        <input type="tel" required placeholder="Ex: +229 97 00 11 22" value={formData.phone}
          onChange={(e) => updateForm('phone', e.target.value)}
          className="input-field rounded-full border-0 bg-stone-100" />
      </div>
      <div>
        <label className="form-label">Mot de passe secret *</label>
        <input type="password" required minLength={6} autoComplete="new-password" placeholder="Minimum 6 caractères" value={formData.password}
          onChange={(e) => updateForm('password', e.target.value)}
          className="input-field rounded-full border-0 bg-stone-100" />
      </div>
    </div>
  </div>
);
