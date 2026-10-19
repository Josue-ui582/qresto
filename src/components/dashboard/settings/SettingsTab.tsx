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

const isOpeningHoursMap = (value: unknown): value is OpeningHoursMap => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;

  return Object.entries(value).every(
    ([day, schedule]) =>
      day in DEFAULT_HOURS &&
      schedule !== null &&
      typeof schedule === 'object' &&
      !Array.isArray(schedule) &&
      'open' in schedule &&
      typeof schedule.open === 'string' &&
      'close' in schedule &&
      typeof schedule.close === 'string' &&
      'active' in schedule &&
      typeof schedule.active === 'boolean'
  );
};

const parseOpeningHours = (value: string | OpeningHoursMap): OpeningHoursMap => {
  if (typeof value !== 'string') {
    return { ...DEFAULT_HOURS, ...value };
  }

  try {
    const parsed: unknown = JSON.parse(value);
    if (isOpeningHoursMap(parsed)) {
      return { ...DEFAULT_HOURS, ...parsed };
    }
  } catch {
    // Older restaurant records store a single text range instead of per-day JSON.
  }

  const range = value.match(
    /(\d{1,2})(?:h|:)(\d{0,2})\s*(?:-|–|à)\s*(\d{1,2})(?:h|:)(\d{0,2})/i
  );
  if (!range) {
    throw new Error('Format des horaires non reconnu.');
  }

  const formatTime = (hour: string, minute: string) =>
    `${hour.padStart(2, '0')}:${(minute || '00').padStart(2, '0')}`;
  const open = formatTime(range[1], range[2]);
  const close = formatTime(range[3], range[4]);
  const dayNames: Record<string, string[]> = {
    monday: ['lundi', 'monday'],
    tuesday: ['mardi', 'tuesday'],
    wednesday: ['mercredi', 'wednesday'],
    thursday: ['jeudi', 'thursday'],
    friday: ['vendredi', 'friday'],
    saturday: ['samedi', 'saturday'],
    sunday: ['dimanche', 'sunday'],
  };
  const explicitDays = Object.entries(dayNames)
    .filter(([, names]) => names.some((name) => value.toLowerCase().includes(name)))
    .map(([day]) => day);
  const appliesEveryDay =
    /7\s*j\s*\/\s*7|tous les jours|every day/i.test(value) || explicitDays.length === 0;

  return Object.fromEntries(
    Object.keys(DEFAULT_HOURS).map((day) => [
      day,
      {
        open,
        close,
        active: appliesEveryDay || explicitDays.includes(day),
      },
    ])
  );
};

export const SettingsTab: React.FC<SettingsTabProps> = ({
  restaurantId,
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
  const [savedSnapshot, setSavedSnapshot] = useState<string | null>(null);
  const isDirty =
    savedSnapshot !== null && savedSnapshot !== JSON.stringify([formData, openingHours]);

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
    const nextFormData: RestaurantSettingsData = {
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
    };

    const nextOpeningHours = data.openingHours
      ? parseOpeningHours(data.openingHours)
      : DEFAULT_HOURS;

    setFormData(nextFormData);
    setOpeningHours(nextOpeningHours);
    setSavedSnapshot(JSON.stringify([nextFormData, nextOpeningHours]));
  };

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      if (!restaurantId) {
        throw new Error('Identifiant du restaurant introuvable.');
      }

      const res = await fetch(`/api/settings?restaurantId=${encodeURIComponent(restaurantId)}`, {
        cache: 'no-store',
      });
      const data = await res.json();

      if (!res.ok || !data.success || !data.settings) {
        throw new Error(data.error || 'Impossible de récupérer les paramètres du restaurant.');
      }

      try {
        populateForm(data.settings);
      } catch {
        throw new Error('Les horaires enregistrés du restaurant sont invalides.');
      }
    } catch (err: unknown) {
      console.error('Erreur chargement paramètres:', err);
      showNotice(
        'error',
        err instanceof Error ? err.message : 'Erreur lors du chargement des données.'
      );
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

      const invalidSchedule = Object.entries(openingHours).find(
        ([, schedule]) =>
          schedule.active &&
          (!/^([01]\d|2[0-3]):[0-5]\d$/.test(schedule.open) ||
            !/^([01]\d|2[0-3]):[0-5]\d$/.test(schedule.close) ||
            schedule.open === schedule.close)
      );
      if (invalidSchedule) {
        throw new Error(`Vérifiez les heures d’ouverture et de fermeture du ${invalidSchedule[0]}.`);
      }

      if (!restaurantId) {
        throw new Error('Identifiant du restaurant introuvable.');
      }

      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erreur lors de la sauvegarde.');
      }

      if (data.settings) {
        populateForm(data.settings);
      } else {
        setSavedSnapshot(JSON.stringify([formData, openingHours]));
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
        isDirty={isDirty}
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
