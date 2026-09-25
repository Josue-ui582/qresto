'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, Key, Edit3, Trash2, UserCheck, UserX } from 'lucide-react';
import { TeamMemberData, ROLE_CONFIG } from './types';

interface MemberCardProps {
  member: TeamMemberData;
  onEdit: (member: TeamMemberData) => void;
  onDelete: (id: string) => void;
  onToggleActive: (member: TeamMemberData) => void;
}

export const MemberCard: React.FC<MemberCardProps> = ({
  member,
  onEdit,
  onDelete,
  onToggleActive,
}) => {
  const roleInfo = ROLE_CONFIG[member.role] || ROLE_CONFIG.WAITER;
  const RoleIcon = roleInfo.icon;

  return (
    <motion.div
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

          <button
            onClick={() => onToggleActive(member)}
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

      <div className="flex items-center justify-between pt-1">
        <span className="text-[10px] font-bold text-stone-400">
          {member.isActive ? '● En service' : '○ Inactif'}
        </span>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onEdit(member)}
            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
            title="Modifier les droits"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onDelete(member.id)}
            className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors cursor-pointer"
            title="Retirer le membre"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
