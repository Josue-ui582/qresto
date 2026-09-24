'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Restaurant, RegisterOwnerDTO, RegisterRestaurantDTO } from '../types';
import { storage } from '../lib/storage';
import { useToast } from './ToastContext';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  currentUser: User | null;
  currentRestaurant: Restaurant | null;
  login: (email: string, password?: string) => Promise<User>;
  registerOwnerAndRestaurant: (ownerData: RegisterOwnerDTO, restaurantData: RegisterRestaurantDTO) => Promise<{ user: User; restaurant: Restaurant }>;
  logout: () => void;
  reloadRestaurantData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRestaurant, setCurrentRestaurant] = useState<Restaurant | null>(null);
  
  const { showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const user = storage.getCurrentUser();
    setCurrentUser(user);
    if (user?.restaurantId) {
      setCurrentRestaurant(storage.getRestaurantById(user.restaurantId) || null);
    }
  }, []);

  const login = async (email: string, password?: string): Promise<User> => {
    const user = storage.loginUser(email, password);
    setCurrentUser(user);
    if (user.restaurantId) {
      setCurrentRestaurant(storage.getRestaurantById(user.restaurantId) || null);
    }
    showToast(`Bienvenue ${user.firstName} !`, 'success');
    return user;
  };

  const registerOwnerAndRestaurant = async (ownerData: RegisterOwnerDTO, restaurantData: RegisterRestaurantDTO) => {
    const slug = restaurantData.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    
    // Simplifié ici pour l'exemple : copiez la logique exacte de création depuis votre fichier original
    const newRestaurant = storage.createRestaurant({
       name: restaurantData.name, 
       slug: slug || `restaurant-${Date.now()}`,
       ownerId: 'temp',
       // ... autres champs
    } as any);

    const newUser = storage.registerUser({
      ...ownerData,
      role: 'RESTAURANT_OWNER',
      restaurantId: newRestaurant.id,
    } as any);

    storage.updateRestaurant(newRestaurant.id, { ownerId: newUser.id });
    newRestaurant.ownerId = newUser.id;

    setCurrentUser(newUser);
    setCurrentRestaurant(newRestaurant);
    showToast(`Votre restaurant ${newRestaurant.name} est créé.`, 'success');
    return { user: newUser, restaurant: newRestaurant };
  };

  const logout = () => {
    storage.logout();
    setCurrentUser(null);
    setCurrentRestaurant(null);
    showToast('Vous êtes déconnecté.', 'info');
    router.push('/');
  };

  const reloadRestaurantData = () => {
    if (currentUser?.restaurantId) {
      setCurrentRestaurant(storage.getRestaurantById(currentUser.restaurantId) || null);
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, currentRestaurant, login, registerOwnerAndRestaurant, logout, reloadRestaurantData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
