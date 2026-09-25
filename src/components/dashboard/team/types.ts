import React from 'react';
import { Crown, Shield, ChefHat, Utensils, Receipt } from 'lucide-react';

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

export const ROLE_CONFIG: Record<
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

export interface MemberModalProps {
  isOpen: boolean;
  editingMember: TeamMemberData | null;
  formData: {
    name: string;
    email: string;
    phone: string;
    role: TeamRole;
    pinCode: string;
    isActive: boolean;
  };
  formError: string | null;
  isSubmitting: boolean;
  onClose: () => void;
  onChange: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
}
