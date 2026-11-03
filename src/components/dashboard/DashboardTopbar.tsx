import React, { useCallback, useEffect, useState } from 'react';
import { Icon } from '../common/Icon';
import { Restaurant } from '../../types';

interface DashboardTopbarProps {
  topSearch: string;
  setTopSearch: (val: string) => void;
  currentRestaurant: Restaurant;
  dropdownOpen: boolean;
  setDropdownOpen: (open: boolean) => void;
  onViewMenu: () => void;
  restaurantId: string;
  notificationRefreshToken: number;
}

interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  type: string | null;
  isRead: boolean;
  createdAt: string;
}

export const DashboardTopbar: React.FC<DashboardTopbarProps> = ({
  topSearch,
  setTopSearch,
  currentRestaurant,
  dropdownOpen,
  setDropdownOpen,
  onViewMenu,
  restaurantId,
  notificationRefreshToken,
}) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<DashboardNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [notificationsError, setNotificationsError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    const response = await fetch('/api/notifications', { cache: 'no-store' });
    const result: {
      success: boolean;
      data?: DashboardNotification[];
      unreadCount?: number;
      error?: string;
    } = await response.json();
    if (!response.ok || !result.success || !result.data) {
      throw new Error(result.error || 'Impossible de charger les notifications.');
    }
    return { notifications: result.data, unreadCount: result.unreadCount ?? 0 };
  }, []);

  useEffect(() => {
    let active = true;
    void fetchNotifications()
      .then((result) => {
        if (!active) return;
        setNotifications(result.notifications);
        setUnreadCount(result.unreadCount);
        setNotificationsError(null);
      })
      .catch((error: unknown) => {
        if (!active) return;
        console.error('Erreur de chargement des notifications du dashboard.', error);
        setNotificationsError(
          error instanceof Error ? error.message : 'Impossible de charger les notifications.'
        );
      })
      .finally(() => {
        if (active) setNotificationsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [fetchNotifications, notificationRefreshToken, restaurantId]);

  const toggleNotificationRead = async (notification: DashboardNotification) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: notification.id, isRead: !notification.isRead }),
      });
      const result: { success: boolean; error?: string } = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Impossible de modifier la notification.');
      }
      setNotifications((current) => current.map((item) => (
        item.id === notification.id ? { ...item, isRead: !item.isRead } : item
      )));
      setUnreadCount((current) => current + (notification.isRead ? 1 : -1));
      setNotificationsError(null);
    } catch (error: unknown) {
      console.error('Erreur lors de la modification d’une notification.', error);
      setNotificationsError(
        error instanceof Error ? error.message : 'Impossible de modifier la notification.'
      );
    }
  };

  return (
    <header className="h-16 bg-surface border-b border-soft px-4 sm:px-8 flex items-center justify-between gap-4 sticky top-0 z-20">
      <div className="relative flex-1 max-w-sm">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-400">
          <Icon name="magnifying-glass" className="text-xs" />
        </div>
        <input
          type="text"
          value={topSearch}
          onChange={(e) => setTopSearch(e.target.value)}
          placeholder="Rechercher..."
          className="w-full pl-9 pr-4 py-2 bg-ink-100/80 hover:bg-ink-100 focus:bg-paper-white text-xs sm:text-sm text-ink-900 rounded-full border border-ink-200/60 focus:border-ink-400 outline-hidden transition-all placeholder:text-ink-400"
        />
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-paper-white border border-ink-200 hover:border-ink-300 text-ink-900 text-xs sm:text-sm font-semibold transition-all shadow-2xs"
          >
            <Icon name="store" className="text-ink-500 text-xs" />
            <span className="max-w-35 truncate">{currentRestaurant.name}</span>
            <Icon name="chevron-down" className="text-[0.625rem] text-ink-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-paper-white rounded-2xl shadow-xl border border-ink-200 py-2 z-50 animate-fade-in-up">
              <div className="px-3 py-1 text-[0.6875rem] font-bold text-ink-400 uppercase tracking-wider">
                Établissement connecté
              </div>
              <div className="border-t border-ink-100 mt-1 pt-1">
                <button
                  type="button"
                  onClick={onViewMenu}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-ink-800 hover:bg-ink-50 flex items-center gap-2"
                >
                  <Icon name="eye" className="text-ink-400" />
                  <span>Voir le menu client</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setNotificationsOpen((open) => !open)}
            className="relative p-2 text-ink-600 hover:text-ink-900 transition-colors"
            title="Notifications"
            aria-label={`Notifications, ${unreadCount} non lue(s)`}
            aria-expanded={notificationsOpen}
          >
            <Icon name="bell" className="text-base" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-4 h-4 px-1 bg-brand-500 text-paper-white text-[0.625rem] font-extrabold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div
              role="region"
              aria-label="Centre de notifications"
              className="absolute right-0 mt-2 w-[min(22rem,calc(100vw-2rem))] bg-paper-white rounded-2xl shadow-xl border border-ink-200 z-50 overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-ink-100">
                <h2 className="text-sm font-bold text-ink-900">Notifications</h2>
                <button
                  type="button"
                  onClick={() => setNotificationsOpen(false)}
                  className="text-xs font-semibold text-ink-500 hover:text-ink-900"
                >
                  Fermer
                </button>
              </div>
              <div className="max-h-96 overflow-y-auto p-3 space-y-2">
                {notificationsError && (
                  <p role="alert" className="text-xs text-negative-700 bg-negative-50 rounded-xl p-3">
                    {notificationsError}
                  </p>
                )}
                {notificationsLoading ? (
                  <p className="text-xs text-ink-500 p-3">Chargement des notifications...</p>
                ) : notifications.length === 0 ? (
                  <p className="text-xs text-ink-500 p-3">Aucune notification.</p>
                ) : notifications.map((notification) => (
                  <article
                    key={notification.id}
                    className={`rounded-xl border p-3 ${
                      notification.isRead
                        ? 'border-ink-100 bg-paper-white'
                        : 'border-brand-200 bg-brand-50/70'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-xs font-bold text-ink-900">{notification.title}</h3>
                        <p className="mt-1 text-xs text-ink-600">{notification.message}</p>
                        <time className="block mt-2 text-[0.625rem] text-ink-400">
                          {new Date(notification.createdAt).toLocaleString('fr-FR')}
                        </time>
                      </div>
                      <button
                        type="button"
                        onClick={() => void toggleNotificationRead(notification)}
                        className="shrink-0 text-[0.625rem] font-bold text-brand-800 hover:text-brand-950"
                      >
                        {notification.isRead ? 'Non lue' : 'Marquer comme lue'}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="w-8 h-8 rounded-full bg-ink-900 text-paper-white text-xs font-bold flex items-center justify-center select-none">
          M
        </div>
      </div>
    </header>
  );
};
