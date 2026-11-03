export type PlanId = 'STARTER' | 'PRO' | 'ENTERPRISE';
export type PlanLimit = number | null;

export interface PlanCatalogItem {
  id: PlanId;
  name: string;
  popular?: boolean;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  limits: {
    dishes: PlanLimit;
    tables: PlanLimit;
    members: PlanLimit;
  };
  features: string[];
}

export const PLANS_CATALOG: PlanCatalogItem[] = [
  {
    id: 'STARTER',
    name: 'Starter',
    description: 'Les fonctions essentielles pour lancer le menu et la prise de commande.',
    monthlyPrice: 15000,
    yearlyPrice: 144000,
    limits: { dishes: 30, tables: 10, members: 3 },
    features: [
      'Jusqu’à 30 plats',
      'Jusqu’à 10 tables',
      'Jusqu’à 3 membres d’équipe',
      'Menu numérique et QR codes',
      'Gestion des commandes dans le tableau de bord',
    ],
  },
  {
    id: 'PRO',
    name: 'Pro',
    popular: true,
    description: 'Les outils de gestion du menu, des commandes et de l’équipe, sans limite de ressources.',
    monthlyPrice: 35000,
    yearlyPrice: 336000,
    limits: { dishes: null, tables: null, members: null },
    features: [
      'Plats, tables et membres illimités',
      'Menu numérique et QR codes',
      'Suivi des commandes',
      'Tableau de bord et analytics',
      'Gestion des rôles de l’équipe',
    ],
  },
  {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    description: 'Une formule adaptée aux établissements ayant des besoins opérationnels étendus.',
    monthlyPrice: 75000,
    yearlyPrice: 720000,
    limits: { dishes: null, tables: null, members: null },
    features: [
      'Plats, tables et membres illimités',
      'Menu numérique et QR codes',
      'Suivi des commandes',
      'Tableau de bord et analytics',
      'Gestion des rôles de l’équipe',
    ],
  },
];

export const getPlanById = (id: string): PlanCatalogItem | undefined =>
  PLANS_CATALOG.find((plan) => plan.id === id);
