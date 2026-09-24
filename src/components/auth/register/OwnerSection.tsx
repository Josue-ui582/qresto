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
      <span>1. Responsable & Compte d'accès</span>
    </h3>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="form-label">Prénom *</label>
        <input type="text" required placeholder="Ex: Reine" value={formData.firstName}
          onChange={(e) => updateForm('firstName', e.target.value)}
          className="input-field" />
      </div>
      <div>
        <label className="form-label">Nom *</label>
        <input type="text" required placeholder="Ex: Dossou" value={formData.lastName}
          onChange={(e) => updateForm('lastName', e.target.value)}
          className="input-field" />
      </div>
      <div>
        <label className="form-label">Email professionnel *</label>
        <input type="email" required placeholder="Ex: contact@chezmama.bj" value={formData.email}
          onChange={(e) => updateForm('email', e.target.value)}
          className="input-field" />
      </div>
      <div>
        <label className="form-label">Téléphone de contact *</label>
        <input type="tel" required placeholder="Ex: +229 97 00 11 22" value={formData.phone}
          onChange={(e) => updateForm('phone', e.target.value)}
          className="input-field" />
      </div>
      <div className="sm:col-span-2">
        <label className="form-label">Mot de passe secret *</label>
        <input type="password" required placeholder="Minimum 6 caractères" value={formData.password}
          onChange={(e) => updateForm('password', e.target.value)}
          className="input-field" />
      </div>
    </div>
  </div>
);
