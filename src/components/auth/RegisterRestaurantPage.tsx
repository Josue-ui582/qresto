'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { FaIcon } from '@/components/common/Icon';
import { OwnerSection } from './register/OwnerSection';
import { RestaurantSection } from './register/RestaurantSection';
import { RegisterFormData, UpdateFormFn } from '@/types';

export const RegisterRestaurantPage: React.FC = () => {
  const { registerOwnerAndRestaurant } = useAuth();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1);

  // Un seul objet d'état pour tout le formulaire !
  const [formData, setFormData] = useState<RegisterFormData>({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    restaurantName: '',
    city: 'Cotonou',
    address: '',
    category: 'Cuisine Béninoise & Grillades',
    description: '',
    logoPreview: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80',
    coverPreview: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
  });

  const updateForm: UpdateFormFn = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (step === 1) {
      setStep(2);
      return;
    }

    if (!formData.restaurantName.trim()) {
      setError('Veuillez saisir le nom de votre établissement.');
      return;
    }
    if (!formData.email.trim() || !formData.password.trim()) {
      setError('Veuillez renseigner votre email et mot de passe.');
      return;
    }

    try {
      setIsLoading(true);
      await registerOwnerAndRestaurant(
        {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        },
        {
          name: formData.restaurantName,
          city: formData.city,
          address: formData.address || `${formData.city}, Bénin`,
          category: formData.category,
          description: formData.description || `Bienvenue au restaurant ${formData.restaurantName}`,
          logo: formData.logoPreview,
          coverImage: formData.coverPreview,
        }
      );

      router.push('/dashboard');
    } catch (err) {
      // CORRECTION TYPESCRIPT : Plus de "err: any"
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Une erreur est survenue lors de la création du compte.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-[#eaf1f7] px-4 py-10 sm:px-6"
      style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.9),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(148,163,184,0.18),transparent_60%)]" />
      <div className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-[2rem] bg-white shadow-[0_24px_70px_rgba(15,23,42,0.16)]">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#F59E0B] via-[#F59E0B] to-[#F59E0B] px-6 pb-12 pt-8 text-center sm:px-10">
          <div className="absolute -left-12 bottom-[-3rem] h-36 w-36 rounded-full bg-amber-200/50" />
          <div className="absolute -right-10 bottom-[-4rem] h-40 w-40 rounded-full bg-emerald-300/45" />
          <div className="relative z-10 mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-xl text-stone-900 shadow-lg">
            <FaIcon name="fa-solid fa-store" />
          </div>
          <h1 className="relative z-10 text-center text-2xl font-bold text-white">Digitalisez votre restaurant</h1>
          <p className="relative z-10 mx-auto mt-2 max-w-md text-xs text-white/90 sm:text-sm">
            Créez votre menu digital QR, configurez vos tables et commencez à recevoir des commandes.
          </p>
        </div>

        <div className="-mt-5 rounded-t-[2rem] bg-white px-6 pb-8 pt-7 sm:px-10 sm:pb-10">
        <div className="mb-7 grid grid-cols-2 gap-3" aria-label={`Étape ${step} sur 2`}>
          {[1, 2].map((number) => (
            <div key={number} className={`rounded-xl px-3 py-2 text-center text-xs font-bold ${step === number ? 'bg-stone-950 text-white' : 'bg-stone-100 text-stone-500'}`}>
              {number === 1 ? '1. Responsable & Compte d’accès' : '2. Profil de l’Établissement'}
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
            <FaIcon name="fa-solid fa-triangle-exclamation" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {step === 1 ? (
            <>
              <OwnerSection formData={formData} updateForm={updateForm} />
              <button type="submit" className="w-full rounded-full bg-stone-950 px-5 py-3.5 text-sm font-bold text-white transition-colors hover:bg-stone-800">
                Suivant
              </button>
            </>
          ) : (
            <>
              <RestaurantSection formData={formData} updateForm={updateForm} />
              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <button type="button" onClick={() => setStep(1)} className="w-full rounded-full border border-stone-300 px-5 py-3.5 text-sm font-semibold text-stone-800 transition-colors hover:bg-stone-50 sm:w-auto">
                  Retour
                </button>
                <button type="submit" disabled={isLoading} className="flex w-full items-center justify-center gap-2 rounded-full bg-stone-950 px-5 py-3.5 text-sm font-bold text-white transition-colors hover:bg-stone-800 disabled:opacity-60 sm:flex-1">
                  {isLoading ? (
              <>
                <FaIcon name="fa-solid fa-spinner" className="animate-spin" />
                <span>Création en cours...</span>
              </>
            ) : (
              <>
                <FaIcon name="fa-solid fa-rocket" />
                <span>Créer mon restaurant et ouvrir mon Dashboard</span>
              </>
            )}
                </button>
              </div>
            </>
          )}
        </form>
        <div className="text-center mt-4">
          <p className="text-xs text-muted">
            Vous avez déjà un compte ?{' '}
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="font-bold text-brand hover:underline cursor-pointer"
            >
              Se connecter
            </button>
          </p>
        </div>
        </div>
      </div>
    </div>
  );
};
