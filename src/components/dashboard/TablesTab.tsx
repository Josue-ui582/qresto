'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  QrCode,
  Plus,
  Search,
  Edit3,
  Trash2,
  Printer,
  Loader2,
  X,
  Check,
  AlertTriangle,
  Users,
  LayoutGrid,
  Smartphone,
  ExternalLink,
  Download,
} from 'lucide-react';

export interface TableData {
  id: string;
  number: number;
  capacity?: number;
  name?: string | null;
  restaurantId: string;
  restaurant?: {
    id: string;
    name: string;
    slug: string;
  };
}

interface TablesTabProps {
  restaurantId?: string;
  restaurantSlug?: string;
  restaurantName?: string;
  tables?: TableData[];
  onRefreshNeeded?: () => void;
}

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
  const [formData, setFormData] = useState({
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
  const fetchTables = async () => {
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
  };

  useEffect(() => {
    fetchTables();
  }, [restaurantId]);

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
    const nextNumber = tablesList.length > 0 ? Math.max(...tablesList.map((t) => t.number)) + 1 : 1;
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
    } catch (err: any) {
      setFormError(err.message || 'Erreur lors de la sauvegarde.');
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
    } catch (err: any) {
      showNotice('error', err.message || 'Impossible de supprimer cette table.');
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
            <LayoutGrid className="w-4 h-4 text-amber-600" />
            <span>Plan de Salle & QR Codes</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-950 font-display">
            Gestion des Tables
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 font-normal">
            Générez et imprimez les QR codes uniques pour chaque table afin de fluidifier les prises de commandes.
          </p>
        </div>

        {/* Métriques & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="px-4 py-3 rounded-2xl bg-[#fbf9f5] border border-stone-200/80 text-center min-w-27.5">
            <span className="block text-2xl font-black text-stone-950 font-display">
              {tablesList.length}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
              Tables
            </span>
          </div>
          <div className="px-4 py-3 rounded-2xl bg-[#fbf9f5] border border-stone-200/80 text-center min-w-27.5">
            <span className="block text-2xl font-black text-amber-600 font-display">
              {totalCapacity}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
              Couverts Total
            </span>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleOpenCreateModal}
            className="px-5 py-3.5 rounded-2xl bg-stone-950 hover:bg-stone-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Ajouter une table</span>
          </motion.button>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200/80">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par numéro ou nom de table (ex: 4, VIP, Terrasse)..."
            className="w-full pl-10 pr-4 py-2 bg-stone-50 text-stone-900 placeholder-stone-400 rounded-xl border border-stone-200 text-xs sm:text-sm font-medium focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
          />
        </div>
        <button
          onClick={fetchTables}
          disabled={isLoading}
          className="p-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 transition-colors cursor-pointer shrink-0"
          title="Rafraîchir"
        >
          <Loader2 className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-600' : ''}`} />
        </button>
      </div>

      {/* Grille des Tables */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-stone-400 bg-white rounded-3xl border border-stone-200/80">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600 mb-3" />
          <span className="text-xs font-semibold">Chargement des tables...</span>
        </div>
      ) : filteredTables.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredTables.map((table) => {
            const slug = table.restaurant?.slug || restaurantSlug;
            const targetPath = `/restaurant/${slug}?table=${table.number}`;

            return (
              <motion.div
                key={table.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500 text-stone-950 font-black text-lg flex items-center justify-center shadow-md shadow-amber-500/20 font-display">
                        #{table.number}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-stone-950 font-display leading-tight">
                          {table.name || `Table #${table.number}`}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium mt-0.5">
                          <Users className="w-3.5 h-3.5 text-stone-400" />
                          <span>{table.capacity || 4} places</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bouton Aperçu QR */}
                  <button
                    onClick={() => setQrModalTable(table)}
                    className="w-full py-3 px-4 rounded-2xl bg-stone-50 hover:bg-amber-50 border border-stone-200/80 hover:border-amber-200 text-stone-800 hover:text-amber-900 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer mb-4 group/btn"
                  >
                    <QrCode className="w-4 h-4 text-amber-600 group-hover/btn:scale-110 transition-transform" />
                    <span>Aprecevoir le Chevalet QR</span>
                  </button>
                </div>

                {/* Actions au bas de la carte */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                  <a
                    href={targetPath}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-bold text-stone-400 hover:text-amber-600 flex items-center gap-1 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Tester lien</span>
                  </a>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditModal(table)}
                      className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
                      title="Modifier"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setDeletingId(table.id)}
                      className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors cursor-pointer"
                      title="Supprimer"
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
            <QrCode className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-stone-900 font-display">
            {searchQuery ? 'Aucune table trouvée' : 'Aucune table configurée'}
          </h3>
          <p className="text-xs text-stone-500 mt-1 mb-6 leading-relaxed font-normal">
            {searchQuery
              ? `Aucune table ne correspond à "${searchQuery}".`
              : 'Créez votre première table pour imprimer son QR Code et permettre à vos clients de commander.'}
          </p>

          {!searchQuery && (
            <button
              onClick={handleOpenCreateModal}
              className="px-5 py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs inline-flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Créer la Table #1</span>
            </button>
          )}
        </div>
      )}

      {/* ================= MODAL APERÇU / IMPRESSION QR CODE ================= */}
      <AnimatePresence>
        {qrModalTable && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl max-w-sm w-full p-6 text-center border border-stone-200 shadow-2xl relative"
            >
              <button
                onClick={() => setQrModalTable(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-stone-950 font-black text-lg mx-auto flex items-center justify-center mb-3">
                Q
              </div>
              <h4 className="text-base font-extrabold text-stone-950 leading-tight">
                {qrModalTable.restaurant?.name || restaurantName}
              </h4>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Scannez pour commander sans attente
              </p>

              {/* QR Image */}
              <div className="my-5 p-4 bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200 inline-block shadow-inner">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                    `${origin}/restaurant/${qrModalTable.restaurant?.slug || restaurantSlug                     }?table=${qrModalTable.number}`
                  )}&color=1c1917`}
                  alt={`QR Table ${qrModalTable.number}`}
                  className="w-44 h-44 mx-auto rounded-lg"
                />
              </div>

              {/* Badge Table */}
              <div className="inline-block px-4 py-1.5 rounded-full bg-stone-900 text-white font-black text-xs uppercase tracking-wider mb-2">
                Table #{qrModalTable.number} {qrModalTable.name ? `· ${qrModalTable.name}` : ''}
              </div>

              <div className="text-[10px] text-stone-400 font-medium mb-6">
                Compatible iPhone & Android · 100% sans application
              </div>

              {/* Actions Impression / Téléchargement */}
              <div className="flex items-center justify-center gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-amber-400" />
                  <span>Imprimer</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadQr(qrModalTable)}
                  className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-stone-600" />
                  <span>Image PNG</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-stone-950 font-display">
                      {editingTable ? 'Éditer la table' : 'Nouvelle table'}
                    </h3>
                    <p className="text-[11px] text-stone-500">
                      Définissez le numéro et la capacité d'accueil.
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      Numéro de table <span className="text-amber-600">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={formData.number}
                      onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                      placeholder="Ex: 1"
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-all font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      Capacité (Couverts)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                      placeholder="Ex: 4"
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Nom / Emplacement (facultatif)
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Terrasse, Saloon VIP, Table 4 B"
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-all font-medium"
                  />
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
                        <span>{editingTable ? 'Mettre à jour' : 'Créer la table'}</span>
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
                Supprimer cette table ?
              </h3>
              <p className="text-xs text-stone-500 mb-6 leading-relaxed">
                Le QR Code associé ne permettra plus d'injecter automatiquement le numéro de table.
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
                  onClick={() => handleDeleteTable(deletingId)}
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
