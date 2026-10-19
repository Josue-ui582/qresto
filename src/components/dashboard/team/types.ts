import React from 'react';
import { Shield, ChefHat, Utensils, Receipt, Truck } from 'lucide-react';

export type TeamRole = 'MANAGER' | 'CHEF' | 'WAITER' | 'CASHIER' | 'DELIVERY';

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

export interface TeamMemberFormData {
  name: string;
  email: string;
  phone: string;
  role: TeamRole;
  pinCode: string;
  isActive: boolean;
}

export const ROLE_CONFIG: Record<
  TeamRole,
  { label: string; badgeBg: string; badgeText: string; icon: React.ElementType }
> = {
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
  DELIVERY: {
    label: 'Livraison',
    badgeBg: 'bg-sky-50 border-sky-200',
    badgeText: 'text-sky-800',
    icon: Truck,
  },
};

export interface MemberModalProps {
  isOpen: boolean;
  editingMember: TeamMemberData | null;
  formData: TeamMemberFormData;
  formError: string | null;
  isSubmitting: boolean;
  onClose: () => void;
  onChange: (data: TeamMemberFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
}
