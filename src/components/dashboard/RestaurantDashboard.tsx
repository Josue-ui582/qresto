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
import { Dish, OrderStatus, RestaurantTable } from '@/types';

export const RestaurantDashboard: React.FC = () => {
  const { currentUser, currentRestaurant, logout } = useAuth();
  const { dashboardTab, setDashboardTab } = useNavigation();
  const { showToast } = useToast();

  // Navigation & UI state
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [restaurantDropdownOpen, setRestaurantDropdownOpen] = useState(false);
  const [demoModeWithData, setDemoModeWithData] = useState<boolean>(false);
  const [topSearch, setTopSearch] = useState('');

  // Form Modals State
  const [dishModalOpen, setDishModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [dishName, setDishName] = useState('');
  const [dishDesc, setDishDesc] = useState('');
  const [dishPrice, setDishPrice] = useState<number>(3500);
  const [dishCategoryId, setDishCategoryId] = useState<string>('');
  const [dishPrepTime, setDishPrepTime] = useState<number>(20);
  const [dishImage, setDishImage] = useState<string>('/src/assets/images/poulet_braise_1790196218496.jpg');
  const [dishHas3D, setDishHas3D] = useState<boolean>(false);
  const [dish3DType, setDish3DType] = useState<string>('poulet_braise');

  const [tableModalOpen, setTableModalOpen] = useState(false);
  const [tableNumberInput, setTableNumberInput] = useState<string>('');
  const [tableNameInput, setTableNameInput] = useState<string>('');
  const [tableCapacityInput, setTableCapacityInput] = useState<number>(4);

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categoryNameInput, setCategoryNameInput] = useState<string>('');

  const [activeQrTable, setActiveQrTable] = useState<RestaurantTable | null>(null);

  const router = useRouter();

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

  const advanceOrderStatus = (orderId: string, nextStatus: OrderStatus) => {
    storage.updateOrderStatus(orderId, nextStatus);
    showToast(`Commande passée en "${nextStatus}"`, 'success');
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
        dashboardTab={dashboardTab}
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
        </main>
      </div>
    </div>
  );
};
