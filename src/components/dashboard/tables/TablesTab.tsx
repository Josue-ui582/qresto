'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Loader2 } from 'lucide-react';

import { TableData, TableFormData, TablesTabProps } from './types';
import { NotificationToast } from './NotificationToast';
import { Header } from './Header';
import { SearchBar } from './SearchBar';
import { TableCard } from './TableCard';
import { EmptyState } from './EmptyState';
import { QrModal } from './QrModal';
import { TableFormModal } from './TableFormModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';

export const TablesTab: React.FC<TablesTabProps> = ({
  restaurantId,
  restaurantSlug = 'chez-mama-benin',
  restaurantName = 'Mon Restaurant',
  tables: initialTables = [],
  onRefreshNeeded,
}) => {
  const [tablesList, setTablesList] = useState<TableData[]>(initialTables);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [origin, setOrigin] = useState<string>('https://qresto.africa');

  // Modal Création / Édition
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingTable, setEditingTable] = useState<TableData | null>(null);
  const [formData, setFormData] = useState<TableFormData>({
    number: '',
    capacity: '4',
    name: '',
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Modal QR Code Chevalet
  const [qrModalTable, setQrModalTable] = useState<TableData | null>(null);

  // Modal Confirmation Suppression
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Toast Notification
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  const showNotice = (type: 'success' | 'error', msg: string) => {
    setActionNotice({ type, msg });
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Chargement des données BDD
  const fetchTables = useCallback(async () => {
    try {
      setIsLoading(true);
      const url = restaurantId ? `/api/tables?restaurantId=${restaurantId}` : '/api/tables';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setTablesList(data.tables || []);
      }
    } catch (err) {
      console.error('Erreur chargement tables:', err);
    } finally {
      setIsLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  // Filtrage par recherche
  const filteredTables = useMemo(() => {
    return tablesList.filter((table) => {
      const numStr = table.number.toString();
      const nameMatch = table.name ? table.name.toLowerCase().includes(searchQuery.toLowerCase()) : false;
      return numStr.includes(searchQuery) || nameMatch;
    });
  }, [tablesList, searchQuery]);

  // Statistiques
  const totalCapacity = useMemo(() => {
    return tablesList.reduce((acc, t) => acc + (t.capacity || 0), 0);
  }, [tablesList]);

  // Ouverture Modal Création
  const handleOpenCreateModal = () => {
    setEditingTable(null);
    const maxNum = tablesList.length > 0 
    ? Math.max(...tablesList.map((t) => Number(t.number) || 0)) 
    : 0;
    const nextNumber = maxNum + 1;
    setFormData({
      number: nextNumber.toString(),
      capacity: '4',
      name: '',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  // Ouverture Modal Édition
  const handleOpenEditModal = (table: TableData) => {
    setEditingTable(table);
    setFormData({
      number: table.number.toString(),
      capacity: (table.capacity || 4).toString(),
      name: table.name || '',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  // Soumission Formulaire
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.number || isNaN(Number(formData.number))) {
      setFormError('Le numéro de table est invalide.');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);

      const method = editingTable ? 'PUT' : 'POST';
      const payload = editingTable
        ? { id: editingTable.id, ...formData }
        : { ...formData, restaurantId: restaurantId || '' };

      const res = await fetch('/api/tables', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erreur lors de la sauvegarde.');
      }

      showNotice('success', editingTable ? 'Table mise à jour !' : 'Nouvelle table créée !');
      setIsModalOpen(false);
      fetchTables();
      if (onRefreshNeeded) onRefreshNeeded();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur lors de la sauvegarde.';
      setFormError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Suppression
  const handleDeleteTable = async (id: string) => {
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/tables?id=${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erreur lors de la suppression.');
      }

      showNotice('success', 'Table supprimée avec succès.');
      setDeletingId(null);
      fetchTables();
      if (onRefreshNeeded) onRefreshNeeded();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Impossible de supprimer cette table.';
      showNotice('error', errorMsg);
    } finally {
      setIsDeleting(false);
    }
  };

  // Téléchargement Image QR Code
  const handleDownloadQr = (table: TableData) => {
    const slug = table.restaurant?.slug || restaurantSlug;
    const targetUrl = `${origin}/restaurant/${slug}?table=${table.number}`;
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(targetUrl)}&color=1c1917`;

    const link = document.createElement('a');
    link.href = qrApiUrl;
    link.download = `QR_Code_Table_${table.number}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      <NotificationToast notice={actionNotice} onClose={() => setActionNotice(null)} />

      <Header
        tablesCount={tablesList.length}
        totalCapacity={totalCapacity}
        onOpenCreateModal={handleOpenCreateModal}
      />

      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isLoading={isLoading}
        onRefresh={fetchTables}
      />

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-stone-400 bg-white rounded-3xl border border-stone-200/80">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600 mb-3" />
          <span className="text-xs font-semibold">Chargement des tables...</span>
        </div>
      ) : filteredTables.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredTables.map((table) => (
            <TableCard
              key={table.id}
              table={table}
              restaurantSlug={restaurantSlug}
              onPreviewQr={setQrModalTable}
              onEdit={handleOpenEditModal}
              onDeleteRequest={setDeletingId}
            />
          ))}
        </div>
      ) : (
        <EmptyState searchQuery={searchQuery} onOpenCreateModal={handleOpenCreateModal} />
      )}

      <QrModal
        table={qrModalTable}
        origin={origin}
        restaurantName={restaurantName}
        restaurantSlug={restaurantSlug}
        onClose={() => setQrModalTable(null)}
        onDownloadQr={handleDownloadQr}
      />

      <TableFormModal
        isOpen={isModalOpen}
        editingTable={editingTable}
        formData={formData}
        formError={formError}
        isSubmitting={isSubmitting}
        onFormChange={setFormData}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitForm}
      />

      <DeleteConfirmModal
        deletingId={deletingId}
        isDeleting={isDeleting}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteTable}
      />
    </div>
  );
};
