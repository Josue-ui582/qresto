'use client';

import React, { useEffect } from 'react';
import { useNavigation } from '@/context/NavigationContext';
import { useAuth } from '@/context/AuthContext';

// Composants communs
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { Toast } from '@/components/common/Toast';

// Pages
import { LandingPage } from '@/components/pages/LandingPage';
import { CguPage, PrivacyPage, ContactPage } from '@/components/pages/StaticPages';
import { RestaurantDashboard } from '@/components/dashboard/RestaurantDashboard';
import { RestaurantsPage } from '@/components/customer/restaurant/RestaurantsPage';
import { RestaurantDetailPage } from '@/components/customer/restaurant/RestaurantDetailPage';
import { CartPage } from '@/components/customer/cart/CartPage';
import { OrderTrackingPage } from '@/components/customer/order/OrderTrackingPage';
import { LoginPage } from '@/components/auth/LoginPage';
import { RegisterRestaurantPage } from '@/components/auth/RegisterRestaurantPage';

export default function HomePage() {
  const { currentView, navigateTo } = useNavigation();
  const { currentUser } = useAuth(); // Conservé si vous l'utilisez plus tard

  // Remonter en haut de page à chaque changement de vue
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

  // Gestion des liens avec Hash (#) de l'ancienne version
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#menu-')) {
        const full = hash.replace('#menu-', '');
        const [slugPart, queryPart] = full.split('?');
        const urlParams = new URLSearchParams(queryPart || '');
        const table = urlParams.get('table') || undefined;
        navigateTo('restaurant-detail', { slug: slugPart, table });
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [navigateTo]);

  // Rendu de la vue courante
  const renderContent = () => {
    switch (currentView) {
      case 'landing':
        return <LandingPage />;
      case 'restaurants':
        return <RestaurantsPage />;
      case 'restaurant-detail':
        return <RestaurantDetailPage />;
      case 'cart':
        return <CartPage />;
      case 'order-tracking':
        return <OrderTrackingPage />;
      case 'login':
        return <LoginPage />;
      case 'register-restaurant':
        return <RegisterRestaurantPage />;
      case 'dashboard':
        return <RestaurantDashboard />;
      case 'cgu':
        return <CguPage />;
      case 'privacy':
        return <PrivacyPage />;
      case 'contact':
        return <ContactPage />;
      default:
        return <LandingPage />;
    }
  };

  const isDashboard = currentView === 'dashboard';

  return (
    <div className="min-h-screen flex flex-col font-sans bg-stone-50 text-stone-900 selection:bg-amber-500 selection:text-white">
      {!isDashboard && <Navbar />}
      <main className="flex-1">{renderContent()}</main>
      {!isDashboard && <Footer />}
      <Toast />
    </div>
  );
}
