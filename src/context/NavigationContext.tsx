'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { storage } from '../lib/storage';
import { useToast } from './ToastContext';

export type DashboardTab =
  | 'overview' | 'orders' | 'menu' | 'categories' | 'dishes'
  | 'tables' | 'qrcodes' | 'restaurant' | 'analytics' | 'team'
  | 'subscription' | 'settings';

export type AppView =
  | 'landing' | 'restaurants' | 'restaurant-detail' | 'dish-detail'
  | 'cart' | 'order-tracking' | 'login' | 'register'
  | 'register-restaurant' | 'dashboard' | 'cgu' | 'privacy' | 'contact';

interface NavigationContextType {
  currentView: AppView;
  navigateTo: (view: AppView, params?: Record<string, unknown>) => void;
  viewParams: Record<string, unknown>;
  dashboardTab: DashboardTab;
  setDashboardTab: (tab: DashboardTab) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [viewParams, setViewParams] = useState<Record<string, unknown>>({});
  const [dashboardTab, setDashboardTab] = useState<DashboardTab>('overview');
  const { showToast } = useToast();

  const navigateTo = (view: AppView, params: Record<string, unknown> = {}) => {
    if (view === 'dashboard') {
      const user = storage.getCurrentUser();
      if (!user) {
        showToast('Veuillez vous connecter pour accéder à votre espace restaurant.', 'info');
        setCurrentView('login');
        return;
      }
      if (!user.restaurantId && user.role !== 'SUPER_ADMIN') {
        showToast("Aucun restaurant n'est rattaché à ce compte.", 'error');
        setCurrentView('register-restaurant');
        return;
      }
    }

    setViewParams(params);
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <NavigationContext.Provider value={{ currentView, navigateTo, viewParams, dashboardTab, setDashboardTab }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) throw new Error('useNavigation must be used within a NavigationProvider');
  return context;
};
