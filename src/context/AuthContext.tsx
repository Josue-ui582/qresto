'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Restaurant, RegisterOwnerDTO, RegisterRestaurantDTO } from '../types';
import { useToast } from './ToastContext';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  currentUser: User | null;
  currentRestaurant: Restaurant | null;
  isLoading: boolean; // Utile pour savoir si la session est en cours de vérification
  login: (email: string, password?: string) => Promise<User>;
  registerOwnerAndRestaurant: (
    ownerData: RegisterOwnerDTO,
    restaurantData: RegisterRestaurantDTO
  ) => Promise<{ user: User; restaurant: Restaurant }>;
  logout: () => Promise<void>;
  reloadRestaurantData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRestaurant, setCurrentRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { showToast } = useToast();
  const router = useRouter();

  // 1. Charger la session actuelle au démarrage de l'application
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setCurrentUser(data.user || null);
          setCurrentRestaurant(data.restaurant || null);
        } else {
          setCurrentUser(null);
          setCurrentRestaurant(null);
        }
      } catch (error) {
        console.error('Erreur de vérification de session:', error);
        setCurrentUser(null);
        setCurrentRestaurant(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // 2. Connexion via API
  const login = async (email: string, password?: string): Promise<User> => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.error || 'Identifiants invalides.';
      showToast(errorMsg, 'error');
      throw new Error(errorMsg);
    }

    setCurrentUser(data.user);
    setCurrentRestaurant(data.restaurant || null);
    showToast(`Bienvenue ${data.user.firstName} !`, 'success');
    return data.user;
  };

  // 3. Inscription Utilisateur + Restaurant via API
  const registerOwnerAndRestaurant = async (
    ownerData: RegisterOwnerDTO,
    restaurantData: RegisterRestaurantDTO
  ) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        owner: ownerData,
        restaurant: restaurantData,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.error || 'Erreur lors de la création du compte.';
      showToast(errorMsg, 'error');
      throw new Error(errorMsg);
    }

    // Mise à jour de l'état global
    setCurrentUser(data.user);
    setCurrentRestaurant(data.restaurant);

    showToast(`Votre restaurant ${data.restaurant.name} a été créé avec succès !`, 'success');
    return { user: data.user, restaurant: data.restaurant };
  };

  // 4. Déconnexion via API
  const logout = async () => {
    try {
      // On retire le finally pour s'assurer que l'UI ne se vide que si la requête part bien
      await fetch('/api/auth/logout', { method: 'POST' });

      setCurrentUser(null);
      setCurrentRestaurant(null);
      showToast('Vous êtes déconnecté.', 'info');

      // Remplacement de router.push par un rechargement complet de l'URL
      // Cela détruit tout le cache React/Next.js côté client
      window.location.href = '/login';

    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      showToast('Erreur lors de la déconnexion.', 'error');
    }
  };

  // 5. Recharger les données du restaurant à jour
  const reloadRestaurantData = async () => {
    try {
      const response = await fetch('/api/restaurant/me');
      if (response.ok) {
        const data = await response.json();
        setCurrentRestaurant(data.restaurant);
      }
    } catch (error) {
      console.error('Erreur lors du rechargement des données du restaurant:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRestaurant,
        isLoading,
        login,
        registerOwnerAndRestaurant,
        logout,
        reloadRestaurantData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
