import { PrismaClient } from '../generated/prisma/client';

const prisma = new PrismaClient();

const testimonials = [
  {
    id: 'testi_1',
    name: 'Reine Dossou',
    role: 'Fondatrice & Cheffe',
    restaurantName: 'Chez Mama Bénin (Cotonou, Haie Vive)',
    city: 'Cotonou, Bénin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    rating: 5,
    text: 'Depuis que nous utilisons QResto, les commandes à table sont 3 fois plus fluides aux heures de pointe. Les clients scannent le QR code posé sur leur table avec leur smartphone sans rien installer, choisissent leur plat et nous recevons la commande directement en cuisine. Le suivi en direct évite toute attente inutile !',
    order: 0,
  },
  {
    id: 'testi_2',
    name: 'Patrick Ahouandjinou',
    role: 'Gérant Propriétaire',
    restaurantName: 'Le Jardin Fidjrossè',
    city: 'Cotonou, Bénin',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    rating: 5,
    text: 'La digitalisation de notre menu a tout changé. Nous pouvons mettre à jour le prix du poisson du jour ou marquer un plat en rupture en 2 secondes depuis notre téléphone. Nos clients adorent la clarté des photos et la visualisation 3D des plats ! L’abonnement à 8 000 FCFA est rentabilisé dès le premier week-end.',
    order: 1,
  },
  {
    id: 'testi_3',
    name: 'Kofi Mensah & Famille',
    role: 'Client Gourmet régulier',
    city: 'Cotonou, Bénin',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    rating: 5,
    text: 'Ce que j’apprécie le plus sur QResto, c’est qu’on a pas besoin de créer de compte ni de télécharger une application lourde. On cherche ce qu’on veut manger, on passe commande, et le code de suivi nous permet de savoir précisément quand le plat est prêt ! C’est moderne, rapide et fiable.',
    order: 2,
  },
  {
    id: 'testi_4',
    name: 'Bernadette Kpadonou',
    role: 'Restauratrice & Traiteur',
    restaurantName: 'Saveurs de Porto-Novo',
    city: 'Porto-Novo, Bénin',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    rating: 5,
    text: 'L’intégration de MTN Mobile Money et Moov Money est parfaitement adaptée à nos réalités au Bénin. On a généré nos QR codes pour nos tables, on les a imprimés et plastifiés. La plateforme est ultra simple même pour notre personnel de salle.',
    order: 3,
  },
];

const faqItems = [
  {
    id: 'faq_1',
    category: 'client',
    question: 'Les clients doivent-ils créer un compte ou télécharger une application pour commander ?',
    answer: 'Non, absolument pas ! Les clients scannent simplement le QR code de la table avec l’appareil photo de leur téléphone ou accèdent au lien du restaurant. Ils consultent le menu interactif, ajoutent leurs plats au panier et valident leur commande en quelques secondes. Ils reçoivent immédiatement un code de suivi pour suivre l’avancement.',
    order: 0,
  },
  {
    id: 'faq_2',
    category: 'restaurant',
    question: 'Comment fonctionnent les QR codes sur les tables du restaurant ?',
    answer: 'Depuis votre Dashboard QResto, vous créez vos tables (Table 1, Table 2, VIP, etc.). En un clic, QResto génère un QR code unique pour chaque table avec l’adresse directe de votre menu. Vous pouvez télécharger le QR code en haute définition, l’imprimer ou le plastifier sur vos tables ou chevalets.',
    order: 1,
  },
  {
    id: 'faq_3',
    category: 'paiement',
    question: 'Quels sont les tarifs d’abonnement pour les restaurants partenaires ?',
    answer: 'QResto propose une tarification en FCFA : le Plan Starter à 5 000 FCFA/mois et le Plan Pro à 8 000 FCFA/mois. Les tarifs et fonctionnalités actuellement disponibles sont à confirmer.',
    order: 2,
  },
  {
    id: 'faq_4',
    category: 'paiement',
    question: 'Quels sont les modes de paiement acceptés pour les commandes ?',
    answer: 'Les commandes peuvent être enregistrées avec les modes de paiement configurés dans le parcours de commande. Les paiements en ligne ne sont pas intégrés actuellement.',
    order: 3,
  },
  {
    id: 'faq_5',
    category: 'restaurant',
    question: 'Comment mes données sont-elles protégées par rapport aux autres restaurants ?',
    answer: 'Les espaces de gestion des restaurants sont isolés par restaurant. Les données visibles publiquement se limitent aux informations du menu et de l’établissement.',
    order: 4,
  },
  {
    id: 'faq_6',
    category: 'restaurant',
    question: 'Puis-je modifier mes prix, ajouter des photos ou masquer un plat en rupture ?',
    answer: 'Oui, depuis le tableau de bord restaurant, les plats peuvent être gérés et leur disponibilité modifiée.',
    order: 5,
  },
];

async function main() {
  for (const testimonial of testimonials) {
    await prisma.testimonial.upsert({
      where: { id: testimonial.id },
      update: testimonial,
      create: testimonial,
    });
  }

  for (const item of faqItems) {
    await prisma.fAQItem.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    });
  }
}

main()
  .catch((error: unknown) => {
    console.error('Erreur lors du seed des contenus de landing :', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
