'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation, DashboardTab } from '../../context/NavigationContext';
import { useRouter } from 'next/navigation';
import { useToast } from '../../context/ToastContext';

import { RestrictedAccess } from './RestrictedAccess';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardMobileNav } from './DashboardMobileNav';
import { DashboardTopbar } from './DashboardTopbar';
import { OverviewTab } from './OverviewTab';
import { OrdersTab } from '@/components/dashboard/orders/OrdersTab';
import { Category, Dish, Order, OrderStatus, RestaurantTable } from '@/types';
import { TeamTab } from './team/TeamTab';
import { AnalyticsTab } from './analytics/AnalyticsTab';
import { CategoriesTab } from './categories/CategoriesTab';
import { DishesTab } from './dishes/DishesTab';
import { QrCodesTab } from './qr-codes/QrCodesTab';
import { SettingsTab } from './settings/SettingsTab';
import { SubscriptionTab } from './subscription/SubscriptionTab';
import { TablesTab } from './tables/TablesTab';
import { CouponsTab } from './coupons/CouponsTab';
import { ReviewsTab } from './reviews/ReviewsTab';
import { InventoryTab } from './inventory/InventoryTab';

export const RestaurantDashboard: React.FC = () => {
  const { currentUser, currentRestaurant, isLoading, logout } = useAuth();
  const { dashboardTab, setDashboardTab } = useNavigation();
  const { showToast } = useToast();
  const router = useRouter();

  // Navigation & UI state
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [restaurantDropdownOpen, setRestaurantDropdownOpen] = useState(false);
  const [topSearch, setTopSearch] = useState('');

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  const [orders, setOrders] = useState<Order[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [notificationRefreshToken, setNotificationRefreshToken] = useState(0);

  useEffect(() => {
    if (!currentRestaurant?.id) return;

    const fetchOrders = async (notifyOnError = false) => {
      try {
        const response = await fetch('/api/orders');
        const data: { success: boolean; data?: Order[]; error?: string } = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Erreur lors du chargement des commandes.');
        }
        if (data.data) {
          setOrders(data.data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des commandes :', error);
        if (notifyOnError) {
          showToast('Impossible de charger les commandes.', 'error');
        }
      }
    };

    void fetchOrders(true);

    const eventSource = new EventSource(
      `/api/events/restaurants/${encodeURIComponent(currentRestaurant.id)}`
    );
    let fallbackInterval: ReturnType<typeof setInterval> | null = null;
    const stopFallback = () => {
      if (fallbackInterval) clearInterval(fallbackInterval);
      fallbackInterval = null;
    };
    const startFallback = () => {
      if (!fallbackInterval) {
        fallbackInterval = setInterval(() => {
          void fetchOrders();
          setNotificationRefreshToken((token) => token + 1);
        }, 10000);
      }
    };

    eventSource.onopen = stopFallback;
    eventSource.onerror = startFallback;
    eventSource.onmessage = (event) => {
      try {
        const payload: { type?: string } = JSON.parse(event.data);
        if (payload.type?.startsWith('order.')) void fetchOrders();
        if (
          payload.type?.startsWith('order.') ||
          payload.type === 'review.created' ||
          payload.type?.startsWith('notification.')
        ) {
          setNotificationRefreshToken((token) => token + 1);
        }
      } catch (error: unknown) {
        console.error('Événement temps réel invalide reçu pour le dashboard.', error);
      }
    };

    return () => {
      eventSource.close();
      stopFallback();
    };
  }, [currentRestaurant?.id, showToast]);

  useEffect(() => {
    if (!currentRestaurant?.id) return;

    let isCurrent = true;
    const fetchRestaurantData = async () => {
      try {
        const shouldLoadMenu = ['categories', 'dishes'].includes(dashboardTab);
        const shouldLoadTables = ['tables', 'qrcodes'].includes(dashboardTab);

        if (shouldLoadMenu) {
          const [dishesResponse, categoriesResponse] = await Promise.all([
            fetch('/api/dishes'),
            fetch('/api/categories'),
          ]);
          const [dishesData, categoriesData]: [
            { success: boolean; dishes?: Dish[]; error?: string },
            { success: boolean; categories?: Category[]; error?: string },
          ] = await Promise.all([dishesResponse.json(), categoriesResponse.json()]);

          if (
            !dishesResponse.ok || !dishesData.success ||
            !categoriesResponse.ok || !categoriesData.success
          ) {
            throw new Error(
              dishesData.error ||
              categoriesData.error ||
              'Erreur lors du chargement du menu.'
            );
          }
          if (isCurrent) {
            setDishes(dishesData.dishes ?? []);
            setCategories(categoriesData.categories ?? []);
          }
        }

        if (shouldLoadTables) {
          const tablesResponse = await fetch('/api/tables');
          const tablesData: {
            success: boolean;
            tables?: RestaurantTable[];
            error?: string;
          } = await tablesResponse.json();
          if (!tablesResponse.ok || !tablesData.success) {
            throw new Error(tablesData.error || 'Erreur lors du chargement des tables.');
          }
          if (isCurrent) {
            setTables(tablesData.tables ?? []);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données du restaurant :', error);
        if (isCurrent) {
          showToast(
            error instanceof Error ? error.message : 'Impossible de charger les données du restaurant.',
            'error'
          );
        }
      }
    };

    void fetchRestaurantData();
    return () => {
      isCurrent = false;
    };
  }, [currentRestaurant?.id, dashboardTab, showToast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-ink-50 flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-ink-600">Chargement de votre espace...</p>
      </div>
    );
  }

  if (!currentUser || !currentRestaurant) {
    return <RestrictedAccess onLogin={() => router.push('/login')} />;
  }

  const restaurantId = currentRestaurant.id;

  const totalRevenue = orders
    .filter((o) => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + (o.total || 0), 0);
  const totalOrdersCount = orders.length;
  const averageOrderValue = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;
  const totalClientsCount = orders.length > 0 ? new Set(orders.map((o) => o.customerPhone || o.customerName)).size : 0;
  
  const pendingOrdersCount = orders.filter(
    (o) => o.status === 'NEW' || o.status === 'CONFIRMED' || o.status === 'PREPARING'
  ).length;

  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: 'table-cells-large' },
    { id: 'orders', label: 'Commandes', icon: 'receipt', badge: pendingOrdersCount },
    { id: 'categories', label: 'Catégories', icon: 'tags' },
    { id: 'dishes', label: 'Plats', icon: 'utensils' },
    { id: 'tables', label: 'Tables', icon: 'border-all' },
    { id: 'qrcodes', label: 'QR Codes', icon: 'qrcode' },
    { id: 'analytics', label: 'Analytics', icon: 'chart-simple' },
    { id: 'team', label: 'Équipe', icon: 'user-group' },
    { id: 'coupons', label: 'Promotions', icon: 'ticket' },
    { id: 'reviews', label: 'Avis clients', icon: 'star' },
    { id: 'inventory', label: 'Stock', icon: 'boxes-stacked' },
    { id: 'subscription', label: 'Abonnement', icon: 'credit-card' },
    { id: 'settings', label: 'Paramètres', icon: 'gear' },
  ];

  const advanceOrderStatus = async (orderId: string, nextStatus: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data: { error?: string } = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Impossible de modifier le statut de la commande.');
      }
      setOrders((prevOrders) =>
        prevOrders.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
      );
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      showToast('Impossible de modifier le statut de la commande.', 'error');
    }
  };

  return (
    <div
      className="min-h-screen bg-paper-white flex flex-col lg:flex-row text-ink-900"
    >
      <DashboardSidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        dashboardTab={dashboardTab as DashboardTab}
        setDashboardTab={setDashboardTab}
        navItems={navItems}
        restaurantName={currentRestaurant.name}
        userEmail={currentUser.email}
        onLogout={logout}
        onNavigateHome={() => router.push('/')}
      />

      <div className="flex-1 flex flex-col min-w-0 bg-ink-50/50">
        <DashboardTopbar
          topSearch={topSearch}
          setTopSearch={setTopSearch}
          currentRestaurant={currentRestaurant}
          dropdownOpen={restaurantDropdownOpen}
          setDropdownOpen={setRestaurantDropdownOpen}
          onViewMenu={() => {
            setRestaurantDropdownOpen(false);
            router.push(`/restaurant/${currentRestaurant.slug}`);
          }}
          restaurantId={restaurantId}
          notificationRefreshToken={notificationRefreshToken}
        />

        <main className="flex-1 p-4 pb-24 sm:p-8 sm:pb-24 lg:pb-8">
          {dashboardTab === 'overview' && (
            <OverviewTab
              restaurantName={currentRestaurant.name}
              totalRevenue={totalRevenue}
              totalOrdersCount={totalOrdersCount}
              averageOrderValue={averageOrderValue}
              totalClientsCount={totalClientsCount}
              orders={orders}
            />
          )}

          {dashboardTab === 'orders' && (
            <OrdersTab
              restaurantName={currentRestaurant.name}
              orders={orders}
              onAdvanceOrderStatus={advanceOrderStatus}
            />
          )}

          {restaurantId && dashboardTab === 'categories' && (
            <CategoriesTab restaurantId={restaurantId} categories={categories} onOpenCategoryModal={() => setCategoryModalOpen(true)} />
          )}

          {restaurantId && dashboardTab === 'dishes' && (
            <DishesTab dishes={dishes} categories={categories} restaurantId={restaurantId} />
          )}

          {dashboardTab === 'tables' && (
            <TablesTab
              restaurantId={restaurantId}
              restaurantSlug={currentRestaurant.slug}
              restaurantName={currentRestaurant.name}
              tables={tables}
            />
          )}

          {dashboardTab === 'qrcodes' && (
            <QrCodesTab
              tables={tables}
              restaurantSlug={currentRestaurant.slug}
              restaurantName={currentRestaurant.name}
            />
          )}

          {dashboardTab === 'analytics' && (
            <AnalyticsTab
              restaurantId={restaurantId}
              currencySymbol={currentRestaurant.currency}
            />
          )}

          {dashboardTab === 'team' && (
            <TeamTab restaurantId={restaurantId} />
          )}

          {dashboardTab === 'coupons' && (
            <CouponsTab restaurantId={restaurantId} currency={currentRestaurant.currency || 'FCFA'} />
          )}

          {dashboardTab === 'reviews' && (
            <ReviewsTab restaurantId={restaurantId} />
          )}

          {dashboardTab === 'inventory' && (
            <InventoryTab restaurantId={restaurantId} />
          )}

          {dashboardTab === 'subscription' && (
            <SubscriptionTab
              restaurantId={restaurantId}
            />
          )}

          {dashboardTab === 'settings' && (
            <SettingsTab
              restaurantId={restaurantId}
              onOpenSettings={() => { /* noop */ }}
            />
          )}
        </main>
      </div>
      <DashboardMobileNav
        dashboardTab={dashboardTab as DashboardTab}
        setDashboardTab={setDashboardTab}
        navItems={navItems}
      />
    </div>
  );
};
