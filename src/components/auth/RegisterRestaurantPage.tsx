'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/common/Icon';
import { OwnerSection } from './register/OwnerSection';
import { RestaurantSection } from './register/RestaurantSection';
import { RegisterFormData, UpdateFormFn } from '@/types';

export const RegisterRestaurantPage: React.FC = () => {
  const { registerOwnerAndRestaurant } = useAuth();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [imageFiles, setImageFiles] = useState<{ logo?: File; coverImage?: File }>({});
  const [createdRestaurant, setCreatedRestaurant] = useState<{ id: string } | null>(null);
  const previewUrls = useRef<Partial<Record<'logoPreview' | 'coverPreview', string>>>({});

  useEffect(() => () => {
    Object.values(previewUrls.current).forEach((url) => {
      if (url) URL.revokeObjectURL(url);
    });
  }, []);

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

  const handleImageFileChange = (target: 'logoPreview' | 'coverPreview', file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setError('Chaque image doit faire 5 Mo maximum.');
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Utilisez une image JPEG, PNG ou WebP.');
      return;
    }
    const previousUrl = previewUrls.current[target];
    if (previousUrl) URL.revokeObjectURL(previousUrl);
    const previewUrl = URL.createObjectURL(file);
    previewUrls.current[target] = previewUrl;
    setError(null);
    setImageFiles((current) => ({
      ...current,
      [target === 'logoPreview' ? 'logo' : 'coverImage']: file,
    }));
    updateForm(target, previewUrl);
  };

  const uploadSelectedImages = async () => {
    const uploads: { logo?: string; coverImage?: string } = {};
    for (const [field, file] of Object.entries(imageFiles) as Array<['logo' | 'coverImage', File]>) {
      const uploadData = new FormData();
      uploadData.set('file', file);
      const response = await fetch('/api/uploads', { method: 'POST', body: uploadData });
      const result: { success?: boolean; imageUrl?: string; error?: string } = await response.json();
      if (!response.ok || !result.success || !result.imageUrl) {
        const label = field === 'logo' ? 'le logo' : 'la couverture';
        const message = response.status === 401
          ? 'Votre session a expiré. Reconnectez-vous pour téléverser les images du restaurant.'
          : result.error || `Impossible de téléverser ${label}.`;
        throw new Error(message);
      }
      uploads[field] = result.imageUrl;
    }
    if (Object.keys(uploads).length) {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(uploads),
      });
      const result: { success?: boolean; error?: string } = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Impossible d’enregistrer les images du restaurant.');
      }
    }
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
    if (error) {
      setError(error);
      return;
    }

    try {
      setIsLoading(true);
      if (!createdRestaurant) {
        const registration = await registerOwnerAndRestaurant(
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
            logo: formData.logoPreview.startsWith('blob:') ? undefined : formData.logoPreview,
            coverImage: formData.coverPreview.startsWith('blob:') ? undefined : formData.coverPreview,
          }
        );
        setCreatedRestaurant({ id: registration.restaurant.id });
      }

      await uploadSelectedImages();
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
      className="relative min-h-screen overflow-hidden bg-surface-cool px-4 py-10 sm:px-6"
    >
      <div className="absolute inset-0 auth-page-decoration" />
      <div className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-[2rem] bg-paper-white shadow-auth-card">
        <div className="relative overflow-hidden bg-gradient-to-br from-brand-500 via-brand-500 to-brand-500 px-6 pb-12 pt-8 text-center sm:px-10">
          <div className="absolute -left-12 bottom-[-3rem] h-36 w-36 rounded-full bg-brand-200/50" />
          <div className="absolute -right-10 bottom-[-4rem] h-40 w-40 rounded-full bg-positive-300/45" />
          <div className="relative z-10 mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-paper-white text-xl text-ink-900 shadow-lg">
            <Icon name="store" />
          </div>
          <h1 className="relative z-10 text-center text-2xl font-bold text-paper-white">Digitalisez votre restaurant</h1>
          <p className="relative z-10 mx-auto mt-2 max-w-md text-xs text-paper-white/90 sm:text-sm">
            Créez votre menu digital QR, configurez vos tables et commencez à recevoir des commandes.
          </p>
        </div>

        <div className="-mt-5 rounded-t-[2rem] bg-paper-white px-6 pb-8 pt-7 sm:px-10 sm:pb-10">
        <div className="mb-7 grid grid-cols-2 gap-3" aria-label={`Étape ${step} sur 2`}>
          {[1, 2].map((number) => (
            <div key={number} className={`rounded-xl px-3 py-2 text-center text-xs font-bold ${step === number ? 'bg-ink-950 text-paper-white' : 'bg-ink-100 text-ink-500'}`}>
              {number === 1 ? '1. Responsable & Compte d’accès' : '2. Profil de l’Établissement'}
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-negative-50 border border-negative-200 text-negative-700 text-xs font-semibold flex items-center gap-2">
            <Icon name="triangle-exclamation" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {step === 1 ? (
            <>
              <OwnerSection formData={formData} updateForm={updateForm} />
              <button type="submit" className="w-full rounded-full bg-ink-950 px-5 py-3.5 text-sm font-bold text-paper-white transition-colors hover:bg-ink-800">
                Suivant
              </button>
            </>
          ) : (
            <>
              <RestaurantSection formData={formData} updateForm={updateForm} onImageFileChange={handleImageFileChange} />
              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <button type="button" onClick={() => setStep(1)} className="w-full rounded-full border border-ink-300 px-5 py-3.5 text-sm font-semibold text-ink-800 transition-colors hover:bg-ink-50 sm:w-auto">
                  Retour
                </button>
                <button type="submit" disabled={isLoading} className="flex w-full items-center justify-center gap-2 rounded-full bg-ink-950 px-5 py-3.5 text-sm font-bold text-paper-white transition-colors hover:bg-ink-800 disabled:opacity-60 sm:flex-1">
                  {isLoading ? (
              <>
                <Icon name="spinner" className="animate-spin" />
                <span>Création en cours...</span>
              </>
            ) : (
              <>
                <Icon name="rocket" />
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
