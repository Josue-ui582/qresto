'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation, DashboardTab } from '../../context/NavigationContext';
import { useRouter } from 'next/navigation';
import { useToast } from '../../context/ToastContext';
import { storage } from '../../lib/storage';

import { RestrictedAccess } from './RestrictedAccess';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardTopbar } from './DashboardTopbar';
import { OverviewTab } from './OverviewTab';
import { OrdersTab } from './OrdersTab';
import { RestaurantInfoTab } from './RestaurantInfoTab';
import { Dish, OrderStatus, RestaurantTable } from '@/types';
import { TeamTab } from './team/TeamTab';
import { AnalyticsTab } from './analytics/AnalyticsTab';
import { CategoriesTab } from './categories/CategoriesTab';
import { DishesTab } from './dishes/DishesTab';
import { QrCodesTab } from './qr-codes/QrCodesTab';
import { SettingsTab } from './settings/SettingsTab';
import { SubscriptionTab } from './subscription/SubscriptionTab';
import { TablesTab } from './tables/TablesTab';

export const RestaurantDashboard: React.FC = () => {
  const { currentUser, currentRestaurant, isLoading, logout } = useAuth();
  const { dashboardTab, setDashboardTab } = useNavigation();
  const [orderss, setOrders] = useState<any[]>([]);
  const { showToast } = useToast();

  // Navigation & UI state
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [restaurantDropdownOpen, setRestaurantDropdownOpen] = useState(false);
  const [demoModeWithData, setDemoModeWithData] = useState<boolean>(false);
  const [topSearch, setTopSearch] = useState('');

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [activeQrTable, setActiveQrTable] = useState<RestaurantTable | null>(null);

  const router = useRouter();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-stone-600">Chargement de votre espace...</p>
      </div>
    );
  }

  if (!currentUser || !currentRestaurant) {
    return <RestrictedAccess onLogin={() => router.push('/login')} />;
  }

  const restaurantId = currentRestaurant.id;
  const allRestaurants = storage.getRestaurants();
  const rawOrders = storage.getOrders(restaurantId);
  const rawDishes = storage.getDishes(restaurantId);
  const rawCategories = storage.getCategories(restaurantId);
  const rawTables = storage.getTables(restaurantId);

  const orders = demoModeWithData ? rawOrders : [];
  const dishes = rawDishes;
  const categories = rawCategories;
  const tables = rawTables;

  const totalRevenue = orders
    .filter((o) => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + o.total, 0);
  const totalOrdersCount = orders.length;
  const averageOrderValue = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;
  const totalClientsCount = orders.length > 0 ? new Set(orders.map((o) => o.customerPhone || o.customerName)).size : 0;
  const pendingOrdersCount = orders.filter(
    (o) => o.status === 'NEW' || o.status === 'CONFIRMED' || o.status === 'PREPARING'
  ).length;

  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: 'fa-solid fa-table-cells-large' },
    { id: 'orders', label: 'Commandes', icon: 'fa-solid fa-receipt', badge: pendingOrdersCount },
    { id: 'categories', label: 'Catégories', icon: 'fa-solid fa-tags' },
    { id: 'dishes', label: 'Plats', icon: 'fa-solid fa-utensils' },
    { id: 'tables', label: 'Tables', icon: 'fa-solid fa-border-all' },
    { id: 'qrcodes', label: 'QR Codes', icon: 'fa-solid fa-qrcode' },
    { id: 'restaurant', label: 'Restaurant', icon: 'fa-solid fa-store' },
    { id: 'analytics', label: 'Analytics', icon: 'fa-solid fa-chart-simple' },
    { id: 'team', label: 'Équipe', icon: 'fa-solid fa-user-group' },
    { id: 'subscription', label: 'Abonnement', icon: 'fa-solid fa-credit-card' },
    { id: 'settings', label: 'Paramètres', icon: 'fa-solid fa-gear' },
  ];

  const advanceOrderStatus = async (orderId: string, nextStatus: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.ok) {
        // Met à jour le state React local pour faire bouger la carte en direct
        setOrders((prevOrders) =>
          prevOrders.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
        );
      }
    } catch (err) {
      console.error('Erreur lors du changement de statut:', err);
    }
  };

  const handleSelectRestaurant = (selectedId: string) => {
    storage.setCurrentUser({
      ...currentUser,
      restaurantId: selectedId,
    });
    setRestaurantDropdownOpen(false);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row text-stone-900 font-sans">
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

      <div className="flex-1 flex flex-col min-w-0 bg-stone-50/50">
        <DashboardTopbar
          topSearch={topSearch}
          setTopSearch={setTopSearch}
          demoModeWithData={demoModeWithData}
          toggleDemoMode={() => {
            setDemoModeWithData(!demoModeWithData);
            showToast(
              !demoModeWithData ? 'Mode simulation activé !' : 'Mode restaurant initial activé.',
              'info'
            );
          }}
          currentRestaurant={currentRestaurant}
          allRestaurants={allRestaurants}
          dropdownOpen={restaurantDropdownOpen}
          setDropdownOpen={setRestaurantDropdownOpen}
          onSelectRestaurant={handleSelectRestaurant}
          onViewMenu={() => {
            setRestaurantDropdownOpen(false);
            router.push(`/restaurant/${currentRestaurant.slug}`);
          }}
          pendingOrdersCount={pendingOrdersCount}
          onNotificationClick={() => setDashboardTab('orders')}
        />

        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {dashboardTab === 'overview' && (
            <OverviewTab
              restaurantName={currentRestaurant.name}
              totalRevenue={totalRevenue}
              totalOrdersCount={totalOrdersCount}
              averageOrderValue={averageOrderValue}
              totalClientsCount={totalClientsCount}
              demoModeWithData={demoModeWithData}
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
              tables={tables as any}
            />
          )}

          {dashboardTab === 'qrcodes' && (
            <QrCodesTab tables={tables as any} onOpenQr={(t: any) => setActiveQrTable(t)} />
          )}

          {dashboardTab === 'restaurant' && (
            <RestaurantInfoTab restaurant={currentRestaurant} />
          )}

          {dashboardTab === 'analytics' && (
            <AnalyticsTab
              stats={{
                totalRevenue,
                totalOrders: totalOrdersCount,
                averageOrderValue,
                activeTablesCount: tables.length,
                ordersByStatus: [
                  { status: 'Nouveau', count: orders.filter((o) => o.status === 'NEW').length },
                  { status: 'Confirmé', count: orders.filter((o) => o.status === 'CONFIRMED').length },
                  { status: 'En préparation', count: orders.filter((o) => o.status === 'PREPARING').length },
                  { status: 'Prêt', count: orders.filter((o) => o.status === 'READY').length },
                  { status: 'Annulé', count: orders.filter((o) => o.status === 'CANCELLED').length },
                ],
                topItems: dishes.slice(0, 5).map((dish) => {
                  const totalQty = orders.reduce((acc, order) => {
                    const item = order.items?.find((i) => i.dishId === dish.id);
                    return acc + (item?.quantity || 0);
                  }, 0);

                  return {
                    id: dish.id,
                    name: dish.name,
                    category: dish.categoryId || 'Général',
                    quantity: totalQty,
                    revenue: totalQty * (dish.price || 0),
                  };
                }),
              }}
            />
          )}

          {dashboardTab === 'team' && (
            <TeamTab members={(currentRestaurant as any)?.team || []} />
          )}

          {dashboardTab === 'subscription' && (
            <SubscriptionTab plan={(currentRestaurant as any)?.plan} />
          )}

          {dashboardTab === 'settings' && (
            <SettingsTab onOpenSettings={() => { /* noop */ }} />
          )}
        </main>
      </div>
    </div>
  );
};
