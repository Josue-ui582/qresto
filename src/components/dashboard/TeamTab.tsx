'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  UserPlus,
  Shield,
  ChefHat,
  Utensils,
  Receipt,
  Search,
  Edit3,
  Trash2,
  Check,
  X,
  AlertTriangle,
  Loader2,
  Phone,
  Mail,
  Key,
  Crown,
  UserCheck,
  UserX,
  BadgeCheck,
} from 'lucide-react';

export type TeamRole = 'OWNER' | 'MANAGER' | 'CHEF' | 'WAITER' | 'CASHIER';

export interface TeamMemberData {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: TeamRole;
  pinCode?: string | null;
  isActive: boolean;
  restaurantId: string;
  createdAt?: string | Date;
}

interface TeamTabProps {
  restaurantId?: string;
  members?: TeamMemberData[];
  onRefreshNeeded?: () => void;
}

const ROLE_CONFIG: Record<
  TeamRole,
  { label: string; badgeBg: string; badgeText: string; icon: React.ElementType }
> = {
  OWNER: {
    label: 'Propriétaire',
    badgeBg: 'bg-amber-500/10 border-amber-300',
    badgeText: 'text-amber-900',
    icon: Crown,
  },
  MANAGER: {
    label: 'Gérant / Manager',
    badgeBg: 'bg-indigo-50 border-indigo-200',
    badgeText: 'text-indigo-800',
    icon: Shield,
  },
  CHEF: {
    label: 'Chef Cuisinier',
    badgeBg: 'bg-orange-50 border-orange-200',
    badgeText: 'text-orange-800',
    icon: ChefHat,
  },
  WAITER: {
    label: 'Serveur / Salle',
    badgeBg: 'bg-emerald-50 border-emerald-200',
    badgeText: 'text-emerald-800',
    icon: Utensils,
  },
  CASHIER: {
    label: 'Caissier',
    badgeBg: 'bg-purple-50 border-purple-200',
    badgeText: 'text-purple-800',
    icon: Receipt,
  },
};

export const TeamTab: React.FC<TeamTabProps> = ({
  restaurantId,
  members: initialMembers,
  onRefreshNeeded,
}) => {
  const [teamList, setTeamList] = useState<TeamMemberData[]>(initialMembers || []);
  const [isLoading, setIsLoading] = useState<boolean>(!initialMembers);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingMember, setEditingMember] = useState<TeamMemberData | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'WAITER' as TeamRole,
    pinCode: '',
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Modal Suppression
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Toast
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const showNotice = (type: 'success' | 'error', msg: string) => {
    setActionNotice({ type, msg });
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Chargement BDD
  const fetchTeam = async () => {
    try {
      setIsLoading(true);
      const url = restaurantId ? `/api/team?restaurantId=${restaurantId}` : '/api/team';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setTeamList(data.members || []);
      }
    } catch (err) {
      console.error('Erreur chargement équipe:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!initialMembers) {
      fetchTeam();
    } else {
      setTeamList(initialMembers);
    }
  }, [restaurantId, initialMembers]);

  // Filtrage
  const filteredMembers = useMemo(() => {
    return teamList.filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.phone && m.phone.includes(searchQuery));

      const matchesRole = roleFilter === 'ALL' || m.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [teamList, searchQuery, roleFilter]);

  // Statistiques
  const activeCount = useMemo(() => teamList.filter((m) => m.isActive).length, [teamList]);

  // Création
  const handleOpenCreateModal = () => {
    setEditingMember(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'WAITER',
      pinCode: '',
      isActive: true,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  // Édition
  const handleOpenEditModal = (member: TeamMemberData) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone || '',
      role: member.role,
      pinCode: member.pinCode || '',
      isActive: member.isActive,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  // Soumission
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim()) {
      setFormError('Le nom et l’email sont requis.');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);

      const method = editingMember ? 'PUT' : 'POST';
      const payload = editingMember
        ? { id: editingMember.id, ...formData }
        : { ...formData, restaurantId: restaurantId || '' };

      const res = await fetch('/api/team', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erreur lors de la sauvegarde.');
      }

      showNotice('success', editingMember ? 'Membre mis à jour !' : 'Nouveau membre ajouté !');
      setIsModalOpen(false);
      fetchTeam();
      if (onRefreshNeeded) onRefreshNeeded();
    } catch (err: any) {
      setFormError(err.message || 'Erreur lors de la sauvegarde.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Suppression
  const handleDeleteMember = async (id: string) => {
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/team?id=${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erreur lors de la suppression.');
      }

      showNotice('success', 'Membre retiré de l’équipe.');
      setDeletingId(null);
      fetchTeam();
      if (onRefreshNeeded) onRefreshNeeded();
    } catch (err: any) {
      showNotice('error', err.message || 'Impossible de retirer ce membre.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Basculer l'état Actif / Inactif
  const handleToggleActive = async (member: TeamMemberData) => {
    try {
      const res = await fetch('/api/team', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: member.id,
          isActive: !member.isActive,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showNotice(
          'success',
          !member.isActive ? 'Accès membre réactivé' : 'Accès membre suspendu'
        );
        fetchTeam();
      }
    } catch (err) {
      console.error('Erreur bascule statut:', err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      <AnimatePresence>
        {actionNotice && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-2xl flex items-center justify-between border text-xs sm:text-sm font-bold shadow-lg ${
              actionNotice.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : 'bg-rose-50 text-rose-900 border-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {actionNotice.type === 'success' ? (
                <Check className="w-5 h-5 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              )}
              <span>{actionNotice.msg}</span>
            </div>
            <button
              onClick={() => setActionNotice(null)}
              className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header & Statistiques */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-amber-700 mb-1">
            <Users className="w-4 h-4 text-amber-600" />
            <span>Personnel & Rôles</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-950 font-display">
            Gestion de l'Équipe
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 font-normal">
            Attribuez les permissions, définissez les codes PIN de caisse et gérez vos collaborateurs.
          </p>
        </div>

        {/* Métriques & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="px-4 py-3 rounded-2xl bg-[#fbf9f5] border border-stone-200/80 text-center min-w-27.5">
            <span className="block text-2xl font-black text-stone-950 font-display">
              {teamList.length}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
              Membres Total
            </span>
          </div>
          <div className="px-4 py-3 rounded-2xl bg-[#fbf9f5] border border-stone-200/80 text-center min-w-27.5">
            <span className="block text-2xl font-black text-emerald-600 font-display">
              {activeCount}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
              Actifs
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleOpenCreateModal}
            className="px-5 py-3.5 rounded-2xl bg-stone-950 hover:bg-stone-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer shrink-0"
          >
            <UserPlus className="w-4 h-4 text-amber-400" />
            <span>Ajouter un membre</span>
          </motion.button>
        </div>
      </div>

      {/* Barre de filtre et recherche */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200/80">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par nom, email ou téléphone..."
            className="w-full pl-10 pr-4 py-2 bg-stone-50 text-stone-900 placeholder-stone-400 rounded-xl border border-stone-200 text-xs sm:text-sm font-medium focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
          />
        </div>

        {/* Filtre par rôle */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: 'Tous' },
            { id: 'MANAGER', label: 'Gérants' },
            { id: 'CHEF', label: 'Cuisine' },
            { id: 'WAITER', label: 'Serveurs' },
            { id: 'CASHIER', label: 'Caissiers' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setRoleFilter(item.id)}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                roleFilter === item.id
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grille des Membres */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-stone-400 bg-white rounded-3xl border border-stone-200/80">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600 mb-3" />
          <span className="text-xs font-semibold">Chargement des membres de l'équipe...</span>
        </div>
      ) : filteredMembers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => {
            const roleInfo = ROLE_CONFIG[member.role] || ROLE_CONFIG.WAITER;
            const RoleIcon = roleInfo.icon;

            return (
              <motion.div
                key={member.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className={`bg-white rounded-3xl p-6 border transition-all flex flex-col justify-between relative shadow-xs hover:shadow-md ${
                  member.isActive
                    ? 'border-stone-200/90'
                    : 'border-stone-200/50 bg-stone-50/50 opacity-75'
                }`}
              >
                <div>
                  {/* Header Carte : Avatar & Badge */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-stone-900 text-amber-400 font-black text-lg flex items-center justify-center font-display shadow-xs shrink-0">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-stone-950 font-display leading-tight">
                          {member.name}
                        </h3>
                        <div
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg border text-[11px] font-bold mt-1 ${roleInfo.badgeBg} ${roleInfo.badgeText}`}
                        >
                          <RoleIcon className="w-3 h-3" />
                          <span>{roleInfo.label}</span>
                        </div>
                      </div>
                    </div>

                    {/* Switch On/Off */}
                    <button
                      onClick={() => handleToggleActive(member)}
                      className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                        member.isActive
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-stone-100 text-stone-400 border-stone-200 hover:bg-stone-200'
                      }`}
                      title={member.isActive ? 'Accès Actif (Cliquer pour désactiver)' : 'Inactif'}
                    >
                      {member.isActive ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Coordonnées */}
                  <div className="space-y-2 py-3 border-y border-stone-100 my-4 text-xs text-stone-600 font-medium">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="truncate">{member.email}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>{member.phone || 'Non renseigné'}</span>
                    </div>

                    {member.pinCode && (
                      <div className="flex items-center gap-2 text-amber-800 font-bold">
                        <Key className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Code PIN Caisse : ••••</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pied de Carte & Actions */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] font-bold text-stone-400">
                    {member.isActive ? '● En service' : '○ Inactif'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditModal(member)}
                      className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
                      title="Modifier les droits"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setDeletingId(member.id)}
                      className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors cursor-pointer"
                      title="Retirer le membre"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* État vide */
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/80 max-w-lg mx-auto my-8">
          <div className="w-14 h-14 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-stone-900 font-display">
            {searchQuery || roleFilter !== 'ALL'
              ? 'Aucun membre trouvé'
              : 'Aucun membre dans l’équipe'}
          </h3>
          <p className="text-xs text-stone-500 mt-1 mb-6 leading-relaxed font-normal">
            {searchQuery || roleFilter !== 'ALL'
              ? 'Essayez de modifier vos critères de recherche.'
              : 'Ajoutez des gérants, serveurs ou cuisiniers pour sécuriser l’accès à votre tableau de bord.'}
          </p>

          {!searchQuery && roleFilter === 'ALL' && (
            <button
              onClick={handleOpenCreateModal}
              className="px-5 py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs inline-flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Ajouter un membre</span>
            </button>
          )}
        </div>
      )}

      {/* ================= MODAL CRÉATION / ÉDITION ================= */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 border border-stone-200 shadow-2xl relative"
            >
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-stone-950 font-display">
                      {editingMember ? 'Modifier le membre' : 'Nouveau membre'}
                    </h3>
                    <p className="text-[11px] text-stone-500">
                      Renseignez les coordonnées et attribuez le rôle.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {formError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmitForm} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Nom & Prénom <span className="text-amber-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Jean Koffi"
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-all font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      Adresse Email <span className="text-amber-600">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="jean@exemple.com"
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-all font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+229 97 00 00 00"
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      Rôle & Permissions
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value as TeamRole })
                      }
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-all font-bold"
                    >
                      <option value="WAITER">Serveur / Salle</option>
                      <option value="CHEF">Cuisinier</option>
                      <option value="CASHIER">Caissier</option>
                      <option value="MANAGER">Gérant / Manager</option>
                      <option value="OWNER">Propriétaire</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      Code PIN Caisse (4 chiffres)
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      value={formData.pinCode}
                      onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                      placeholder="Ex: 1234"
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-stone-950 hover:bg-stone-800 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                        <span>Enregistrement...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 text-amber-400" />
                        <span>{editingMember ? 'Mettre à jour' : 'Ajouter le membre'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL SUPPRESSION ================= */}
      <AnimatePresence>
        {deletingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-sm w-full p-6 text-center border border-stone-200 shadow-2xl"
            >
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-stone-950 font-display mb-1">
                Retirer ce membre ?
              </h3>
              <p className="text-xs text-stone-500 mb-6 leading-relaxed">
                Cette personne n'aura plus accès à votre espace restaurant.
              </p>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setDeletingId(null)}
                  disabled={isDeleting}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 text-xs font-bold transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleDeleteMember(deletingId)}
                  disabled={isDeleting}
                  className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  <span>Confirmer</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
