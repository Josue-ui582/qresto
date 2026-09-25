'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import {
  SettingsSection,
  DaySchedule,
  OpeningHoursMap,
  RestaurantSettingsData,
  SettingsTabProps,
} from './types';
import { Header } from './Header';
import { SidebarNav } from './SidebarNav';
import { NotificationToast } from './NotificationToast';
import { GeneralSection } from './sections/GeneralSection';
import { OpeningHoursSection } from './sections/OpeningHoursSection';
import { ServiceSection } from './sections/ServiceSection';
import { NotificationsSection } from './sections/NotificationsSection';
import { SecuritySection } from './sections/SecuritySection';

const DEFAULT_HOURS: OpeningHoursMap = {
  monday: { open: '11:00', close: '23:00', active: true },
  tuesday: { open: '11:00', close: '23:00', active: true },
  wednesday: { open: '11:00', close: '23:00', active: true },
  thursday: { open: '11:00', close: '23:00', active: true },
  friday: { open: '11:00', close: '00:00', active: true },
  saturday: { open: '11:00', close: '00:00', active: true },
  sunday: { open: '12:00', close: '22:00', active: false },
};

export const SettingsTab: React.FC<SettingsTabProps> = ({
  restaurantId = 'default-resto',
  initialSettings,
  onOpenSettings,
  onSavedSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsSection>('general');
  const [isLoading, setIsLoading] = useState<boolean>(!initialSettings);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [formData, setFormData] = useState<RestaurantSettingsData>({
    name: '',
    phone: '',
    address: '',
    currency: 'FCFA',
    description: '',
    enableQrOrders: true,
    enableSoundAlerts: true,
    notificationEmail: '',
    serviceFeePercent: 0,
    wifiName: '',
    wifiPassword: '',
  });

  const [openingHours, setOpeningHours] = useState<OpeningHoursMap>(DEFAULT_HOURS);

  const showNotice = (type: 'success' | 'error', msg: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setNotice({ type, msg });
    timerRef.current = setTimeout(() => setNotice(null), 4000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const populateForm = (data: RestaurantSettingsData) => {
    setFormData({
      name: data.name || '',
      phone: data.phone || '',
      address: data.address || '',
      currency: data.currency || 'FCFA',
      description: data.description || '',
      enableQrOrders: data.enableQrOrders ?? true,
      enableSoundAlerts: data.enableSoundAlerts ?? true,
      notificationEmail: data.notificationEmail || '',
      notificationPhone: data.notificationPhone || '',
      serviceFeePercent: data.serviceFeePercent || 0,
      wifiName: data.wifiName || '',
      wifiPassword: data.wifiPassword || '',
    });

    if (data.openingHours) {
      try {
        const parsed =
          typeof data.openingHours === 'string'
            ? JSON.parse(data.openingHours)
            : data.openingHours;
        setOpeningHours({ ...DEFAULT_HOURS, ...parsed });
      } catch (e) {
        setOpeningHours(DEFAULT_HOURS);
      }
    }
  };

  const fetchSettings = async () => {
    if (!restaurantId) return;
    try {
      setIsLoading(true);
      const res = await fetch(`/api/restaurant/settings?restaurantId=${restaurantId}`);
      const data = await res.json();

      if (data.success && data.settings) {
        populateForm(data.settings);
      }
    } catch (err) {
      console.error('Erreur chargement paramètres:', err);
      showNotice('error', 'Erreur lors du chargement des données.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialSettings) {
      populateForm(initialSettings);
    } else {
      fetchSettings();
    }
  }, [restaurantId, initialSettings]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const payload = {
        restaurantId,
        ...formData,
        openingHours,
      };

      const res = await fetch('/api/restaurant/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erreur lors de la sauvegarde.');
      }

      showNotice('success', 'Paramètres enregistrés avec succès !');
      if (onSavedSuccess) onSavedSuccess();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Impossible d’enregistrer.';
      showNotice('error', errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = <K extends keyof RestaurantSettingsData>(
    field: K,
    value: RestaurantSettingsData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleScheduleChange = <K extends keyof DaySchedule>(
    day: string,
    field: K,
    value: DaySchedule[K]
  ) => {
    setOpeningHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  return (
    <div className="space-y-6">
      <NotificationToast notice={notice} onClose={() => setNotice(null)} />

      <Header
        isLoading={isLoading}
        isSaving={isSaving}
        onRefresh={fetchSettings}
        onSave={handleSave}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <SidebarNav activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="lg:col-span-9">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-stone-400 bg-white rounded-3xl border border-stone-200/80">
              <Loader2 className="w-8 h-8 animate-spin text-amber-600 mb-3" />
              <span className="text-xs font-semibold">Chargement des paramètres...</span>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-6">
              {activeTab === 'general' && (
                <GeneralSection formData={formData} onChange={handleChange} />
              )}
              {activeTab === 'opening' && (
                <OpeningHoursSection openingHours={openingHours} onChange={handleScheduleChange} />
              )}
              {activeTab === 'service' && (
                <ServiceSection formData={formData} onChange={handleChange} />
              )}
              {activeTab === 'notifications' && (
                <NotificationsSection formData={formData} onChange={handleChange} />
              )}
              {activeTab === 'security' && (
                <SecuritySection onOpenSettings={onOpenSettings} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
