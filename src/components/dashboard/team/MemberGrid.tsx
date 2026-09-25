'use client';

import React from 'react';
import { Loader2, Users, UserPlus } from 'lucide-react';
import { TeamMemberData } from './types';
import { MemberCard } from './MemberCard';

interface MemberGridProps {
  members: TeamMemberData[];
  isLoading: boolean;
  isFiltered: boolean;
  onEdit: (member: TeamMemberData) => void;
  onDelete: (id: string) => void;
  onToggleActive: (member: TeamMemberData) => void;
  onAddMember: () => void;
}

export const MemberGrid: React.FC<MemberGridProps> = ({
  members,
  isLoading,
  isFiltered,
  onEdit,
  onDelete,
  onToggleActive,
  onAddMember,
}) => {
  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-stone-400 bg-white rounded-3xl border border-stone-200/80">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600 mb-3" />
        <span className="text-xs font-semibold">Chargement des membres de l'équipe...</span>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/80 max-w-lg mx-auto my-8">
        <div className="w-14 h-14 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto mb-4">
          <Users className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-stone-900 font-display">
          {isFiltered ? 'Aucun membre trouvé' : 'Aucun membre dans l’équipe'}
        </h3>
        <p className="text-xs text-stone-500 mt-1 mb-6 leading-relaxed font-normal">
          {isFiltered
            ? 'Essayez de modifier vos critères de recherche.'
            : 'Ajoutez des gérants, serveurs ou cuisiniers pour sécuriser l’accès à votre tableau de bord.'}
        </p>

        {!isFiltered && (
          <button
            onClick={onAddMember}
            className="px-5 py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs inline-flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Ajouter un membre</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {members.map((member) => (
        <MemberCard
          key={member.id}
          member={member}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleActive={onToggleActive}
        />
      ))}
    </div>
  );
};
