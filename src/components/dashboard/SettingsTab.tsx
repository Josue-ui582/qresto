'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Store,
  Clock,
  QrCode,
  Bell,
  Shield,
  Save,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Wifi,
  Phone,
  MapPin,
  Coins,
  Lock,
  X,
  Volume2,
  VolumeX,
  Mail,
  Percent,
  RefreshCw,
  Building2,
  Check,
} from 'lucide-react';

export type SettingsSection = 'general' | 'opening' | 'service' | 'notifications' | 'security';

export interface DaySchedule {
  open: string;
  close: string;
  active: boolean;
}

export interface OpeningHoursMap {
  [key: string]: DaySchedule;
}

export interface RestaurantSettingsData {
  id?: string;
  restaurantId?: string;
  name: string;
  phone: string;
  address: string;
  currency: string;
  description: string;
  enableQrOrders: boolean;
  enableSoundAlerts: boolean;
  notificationEmail: string;
  notificationPhone?: string;
  serviceFeePercent: number;
  wifiName?: string;
  wifiPassword?: string;
  openingHours?: string | OpeningHoursMap;
}

interface SettingsTabProps {
  restaurantId?: string;
  initialSettings?: RestaurantSettingsData;
  onOpenSettings?: () => void;
  onSavedSuccess?: () => void;
}

const DEFAULT_HOURS: OpeningHoursMap = {
  monday: { open: '11:00', close: '23:00', active: true },
  tuesday: { open: '11:00', close: '23:00', active: true },
  wednesday: { open: '11:00', close: '23:00', active: true },
  thursday: { open: '11:00', close: '23:00', active: true },
  friday: { open: '11:00', close: '00:00', active: true },
  saturday: { open: '11:00', close: '00:00', active: true },
  sunday: { open: '12:00', close: '22:00', active: false },
};

const DAY_LABELS: Record<string, string> = {
  monday: 'Lundi',
  tuesday: 'Mardi',
  wednesday: 'Mercredi',
  thursday: 'Jeudi',
  friday: 'Vendredi',
  saturday: 'Samedi',
  sunday: 'Dimanche',
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

  // Form State
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
    setNotice({ type, msg });
    setTimeout(() => setNotice(null), 4000);
  };

  // Chargement des données
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

  useEffect(() => {
    if (initialSettings) {
      populateForm(initialSettings);
    } else {
      fetchSettings();
    }
  }, [restaurantId, initialSettings]);

  // Enregistrement des modifications
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
    } catch (err: any) {
      showNotice('error', err.message || 'Impossible d’enregistrer.');
    } finally {
      setIsSaving(false);
    }
  };

  // Mise à jour simplifiée des inputs text / boolean
  const handleChange = (field: keyof RestaurantSettingsData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Mise à jour de la grille des horaires
  const handleScheduleChange = (day: string, field: keyof DaySchedule, value: any) => {
    setOpeningHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const navItems: { id: SettingsSection; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'general', label: 'Etablissement', icon: Store },
    { id: 'opening', label: 'Horaires', icon: Clock },
    { id: 'service', label: 'Service & QR', icon: QrCode },
    { id: 'notifications', label: 'Alertes & Son', icon: Bell },
    { id: 'security', label: 'Sécurité & Accès', icon: Shield },
  ];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {notice && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-2xl flex items-center justify-between border text-xs sm:text-sm font-bold shadow-lg ${
              notice.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : 'bg-rose-50 text-rose-900 border-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {notice.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              )}
              <span>{notice.msg}</span>
            </div>
            <button
              onClick={() => setNotice(null)}
              className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-amber-700 mb-1">
            <Building2 className="w-4 h-4 text-amber-600" />
            <span>Configuration globale</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-950 font-display">
            Paramètres du Restaurant
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 font-normal">
            Gérez la fiche de l'établissement, le fonctionnement des commandes et la sécurité.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={fetchSettings}
            disabled={isLoading || isSaving}
            className="p-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors cursor-pointer"
            title="Rafraîchir les données"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-600' : ''}`} />
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-lg disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Enregistrement...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Enregistrer</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Container with Sidebar Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Navigation Onglets */}
        <div className="lg:col-span-3 bg-white p-3 rounded-3xl border border-stone-200/80 shadow-xs space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-stone-950 text-amber-400 shadow-sm'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-stone-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Panel */}
        <div className="lg:col-span-9">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-stone-400 bg-white rounded-3xl border border-stone-200/80">
              <Loader2 className="w-8 h-8 animate-spin text-amber-600 mb-3" />
              <span className="text-xs font-semibold">Chargement des paramètres...</span>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-6">
              {/* SECTION 1: GENERAL */}
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <div className="border-b border-stone-100 pb-4">
                    <h3 className="text-lg font-bold text-stone-950 font-display">
                      Informations Générales
                    </h3>
                    <p className="text-xs text-stone-500">
                      Coordonnées publiques affichées sur les menus QR et reçus.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">
                        Nom du Restaurant
                      </label>
                      <div className="relative">
                        <Store className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleChange('name', e.target.value)}
                          placeholder="Ex: Le Mamba Gourmand"
                          className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-semibold text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">
                        Téléphone Officiel
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                        <input
                          type="text"
                          value={formData.phone}
                          onChange={(e) => handleChange('phone', e.target.value)}
                          placeholder="+221 77 000 00 00"
                          className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-semibold text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">
                        Adresse Physique
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                        <input
                          type="text"
                          value={formData.address}
                          onChange={(e) => handleChange('address', e.target.value)}
                          placeholder="Ex: Rue des Almadies, Dakar"
                          className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-semibold text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">
                        Devise d'Affichage
                      </label>
                      <div className="relative">
                        <Coins className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                        <select
                          value={formData.currency}
                          onChange={(e) => handleChange('currency', e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-semibold text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all cursor-pointer"
                        >
                          <option value="FCFA">FCFA (CFA)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="USD">USD ($)</option>
                          <option value="MAD">MAD (Dh)</option>
                        </select>
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">
                        Slogan / Description courte
                      </label>
                      <textarea
                        rows={3}
                        value={formData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        placeholder="Présentez brièvement votre établissement aux clients..."
                        className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-semibold text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 2: HORAIRES */}
              {activeTab === 'opening' && (
                <div className="space-y-6">
                  <div className="border-b border-stone-100 pb-4">
                    <h3 className="text-lg font-bold text-stone-950 font-display">
                      Horaires d'Ouverture
                    </h3>
                    <p className="text-xs text-stone-500">
                      Définissez les créneaux pendant lesquels les clients peuvent commander sur place.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {Object.keys(DAY_LABELS).map((dayKey) => {
                      const daySchedule = openingHours[dayKey] || {
                        open: '10:00',
                        close: '22:00',
                        active: true,
                      };

                      return (
                        <div
                          key={dayKey}
                          className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                            daySchedule.active
                              ? 'bg-stone-50/50 border-stone-200'
                              : 'bg-stone-100/40 border-stone-100 opacity-60'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={daySchedule.active}
                              onChange={(e) =>
                                handleScheduleChange(dayKey, 'active', e.target.checked)
                              }
                              className="w-4 h-4 rounded-md accent-amber-500 cursor-pointer"
                            />
                            <span className="text-xs font-bold text-stone-900 min-w-[90px]">
                              {DAY_LABELS[dayKey]}
                            </span>
                          </div>

                          {daySchedule.active ? (
                            <div className="flex items-center gap-2 self-start sm:self-auto">
                              <input
                                type="time"
                                value={daySchedule.open}
                                onChange={(e) =>
                                  handleScheduleChange(dayKey, 'open', e.target.value)
                                }
                                className="px-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-900 focus:outline-hidden"
                              />
                              <span className="text-xs text-stone-400 font-bold">à</span>
                              <input
                                type="time"
                                value={daySchedule.close}
                                onChange={(e) =>
                                  handleScheduleChange(dayKey, 'close', e.target.value)
                                }
                                className="px-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-900 focus:outline-hidden"
                              />
                            </div>
                          ) : (
                            <span className="text-xs text-stone-400 italic font-semibold">
                              Fermé ce jour
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SECTION 3: SERVICE & QR */}
              {activeTab === 'service' && (
                <div className="space-y-6">
                  <div className="border-b border-stone-100 pb-4">
                    <h3 className="text-lg font-bold text-stone-950 font-display">
                      Service en Salle & QR Code
                    </h3>
                    <p className="text-xs text-stone-500">
                      Ajustez les modalités de prise de commande à table et les services additionnels.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Toggle Commandes QR */}
                    <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50/50 flex items-center justify-between gap-4">
                      <div>
                        <div className="text-xs font-bold text-stone-950">
                          Autoriser les commandes directes via QR Code
                        </div>
                        <div className="text-[11px] text-stone-500 mt-0.5">
                          Les clients scannent la table et envoient leur commande directement en cuisine.
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          handleChange('enableQrOrders', !formData.enableQrOrders)
                        }
                        className={`w-12 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                          formData.enableQrOrders ? 'bg-amber-500' : 'bg-stone-300'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 bg-white rounded-full transition-transform ${
                            formData.enableQrOrders ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Taxe / Service */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">
                        Frais de service / Taxe (%)
                      </label>
                      <div className="relative">
                        <Percent className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                        <input
                          type="number"
                          min={0}
                          max={30}
                          value={formData.serviceFeePercent}
                          onChange={(e) =>
                            handleChange('serviceFeePercent', parseFloat(e.target.value) || 0)
                          }
                          className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-semibold text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                        />
                      </div>
                    </div>

                    {/* Réseau Wi-Fi Client */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1.5">
                          Nom du Wi-Fi Client (SSID)
                        </label>
                        <div className="relative">
                          <Wifi className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                          <input
                            type="text"
                            value={formData.wifiName}
                            onChange={(e) => handleChange('wifiName', e.target.value)}
                            placeholder="Ex: Resto_Guest_WiFi"
                            className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-semibold text-stone-900 focus:outline-hidden"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1.5">
                          Mot de passe Wi-Fi Client
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                          <input
                            type="text"
                            value={formData.wifiPassword}
                            onChange={(e) => handleChange('wifiPassword', e.target.value)}
                            placeholder="Mot de passe"
                            className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-semibold text-stone-900 focus:outline-hidden"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 4: NOTIFICATIONS */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div className="border-b border-stone-100 pb-4">
                    <h3 className="text-lg font-bold text-stone-950 font-display">
                      Alertes & Notifications Sonores
                    </h3>
                    <p className="text-xs text-stone-500">
                      Soyez immédiatement informé des nouvelles commandes entrantes.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Alerte sonore */}
                    <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50/50 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
                          {formData.enableSoundAlerts ? (
                            <Volume2 className="w-5 h-5" />
                          ) : (
                            <VolumeX className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-stone-950">
                            Signal sonore à chaque nouvelle commande
                          </div>
                          <div className="text-[11px] text-stone-500">
                            Joue un son d'alerte fort sur la caisse / écran de cuisine.
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          handleChange('enableSoundAlerts', !formData.enableSoundAlerts)
                        }
                        className={`w-12 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                          formData.enableSoundAlerts ? 'bg-amber-500' : 'bg-stone-300'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 bg-white rounded-full transition-transform ${
                            formData.enableSoundAlerts ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Email de réception */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">
                        Email de réception des récapitulatifs & alertes
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                        <input
                          type="email"
                          value={formData.notificationEmail}
                          onChange={(e) => handleChange('notificationEmail', e.target.value)}
                          placeholder="gerant@restaurant.com"
                          className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-semibold text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 5: SECURITE */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div className="border-b border-stone-100 pb-4">
                    <h3 className="text-lg font-bold text-stone-950 font-display">
                      Sécurité & Accès
                    </h3>
                    <p className="text-xs text-stone-500">
                      Protégez le compte administrateur du restaurant.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-start gap-3">
                    <Shield className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold block mb-0.5">Accès Administrateur Protégé</strong>
                      Pour modifier le mot de passe principal ou réinitialiser les identifiants de
                      votre équipe, utilisez le sous-menu de gestion des rôles.
                    </div>
                  </div>

                  {onOpenSettings && (
                    <button
                      onClick={onOpenSettings}
                      className="px-4 py-3 rounded-2xl bg-stone-950 hover:bg-stone-800 text-amber-400 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Ouvrir les options avancées de sécurité</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
