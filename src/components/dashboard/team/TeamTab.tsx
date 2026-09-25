'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { TeamMemberData, TeamRole } from './types';
import { ToastNotice } from './ToastNotice';
import { TeamHeader } from './TeamHeader';
import { TeamFilters } from './TeamFilters';
import { MemberGrid } from './MemberGrid';
import { MemberModal } from './MemberModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface TeamTabProps {
  restaurantId?: string;
  members?: TeamMemberData[];
  onRefreshNeeded?: () => void;
}

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

  // Toast Notice
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const showNotice = (type: 'success' | 'error', msg: string) => {
    setActionNotice({ type, msg });
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Chargement
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

  // Filtrage & Stats
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

  const activeCount = useMemo(() => teamList.filter((m) => m.isActive).length, [teamList]);

  // Handlers
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

  const handleDeleteMember = async () => {
    if (!deletingId) return;

    try {
      setIsDeleting(true);
      const res = await fetch(`/api/team?id=${deletingId}`, {
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
      <ToastNotice notice={actionNotice} onClose={() => setActionNotice(null)} />

      <TeamHeader
        totalCount={teamList.length}
        activeCount={activeCount}
        onAddMember={handleOpenCreateModal}
      />

      <TeamFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
      />

      <MemberGrid
        members={filteredMembers}
        isLoading={isLoading}
        isFiltered={searchQuery.length > 0 || roleFilter !== 'ALL'}
        onEdit={handleOpenEditModal}
        onDelete={(id) => setDeletingId(id)}
        onToggleActive={handleToggleActive}
        onAddMember={handleOpenCreateModal}
      />

      <MemberModal
        isOpen={isModalOpen}
        editingMember={editingMember}
        formData={formData}
        formError={formError}
        isSubmitting={isSubmitting}
        onClose={() => setIsModalOpen(false)}
        onChange={setFormData}
        onSubmit={handleSubmitForm}
      />

      <DeleteConfirmModal
        isOpen={Boolean(deletingId)}
        isDeleting={isDeleting}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteMember}
      />
    </div>
  );
};
