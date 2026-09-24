'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { FaIcon } from '@/components/common/Icon';
import { OwnerSection } from './register/OwnerSection';
import { RestaurantSection } from './register/RestaurantSection';
import { PlanSection } from './register/PlanSection';
import { MomoSection } from './register/MomoSection';
import { RegisterFormData, UpdateFormFn } from '@/types';

export const RegisterRestaurantPage: React.FC = () => {
  const { registerOwnerAndRestaurant } = useAuth();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Un seul objet d'état pour tout le formulaire !
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
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
    plan: 'PRO_8000',
    momoProvider: 'MTN',
    momoNumber: '',
  });

  const updateForm: UpdateFormFn = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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
          firstName: formData.firstName,
          lastName: formData.lastName,
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
          momoProvider: formData.momoProvider,
          momoNumber: formData.momoNumber || formData.phone,
          subscriptionPlan: formData.plan,
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
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      <div className="card p-6 sm:p-10">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-brand text-text-inverse flex items-center justify-center text-xl mx-auto mb-3 shadow-lg shadow-amber-500/20">
            <FaIcon name="fa-solid fa-store" />
          </div>
          <h1 className="heading-lg text-center">Digitalisez votre restaurant</h1>
          <p className="text-xs sm:text-sm text-muted mt-2 max-w-md mx-auto">
            Créez votre menu digital QR, configurez vos tables et commencez à recevoir des commandes.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
            <FaIcon name="fa-solid fa-triangle-exclamation" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <OwnerSection formData={formData} updateForm={updateForm} />
          <RestaurantSection formData={formData} updateForm={updateForm} />
          <PlanSection formData={formData} updateForm={updateForm} />
          <MomoSection formData={formData} updateForm={updateForm} />

          <button type="submit" disabled={isLoading} className="btn-primary w-full">
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
        </form>
      </div>
    </div>
  );
};
