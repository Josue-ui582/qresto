import React from 'react';
import { FaIcon } from '../common/Icon';

interface RestrictedAccessProps {
  onLogin: () => void;
}

export const RestrictedAccess: React.FC<RestrictedAccessProps> = ({ onLogin }) => (
  <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6 text-center">
    <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center text-2xl mb-4">
      <FaIcon name="fa-solid fa-lock" />
    </div>
    <h2 className="text-2xl font-bold text-stone-900 mb-2">Accès Restreint</h2>
    <p className="text-stone-500 text-sm max-w-sm mb-6">
      Vous devez être connecté avec un compte restaurateur pour accéder à ce tableau de bord.
    </p>
    <button
      type="button"
      onClick={onLogin}
      className="px-6 py-3 rounded-full bg-stone-900 text-white font-bold text-sm shadow-md hover:bg-stone-800 transition-all"
    >
      Se connecter
    </button>
  </div>
);
