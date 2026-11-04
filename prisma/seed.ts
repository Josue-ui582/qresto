import bcrypt from 'bcryptjs';
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

async function seedDemoRestaurant() {
  if (process.env.APP_ENV !== 'staging') return;

  const demoPassword = process.env.DEMO_OWNER_PASSWORD;
  if (!demoPassword) {
    throw new Error('DEMO_OWNER_PASSWORD est requis pour créer le compte restaurateur de démonstration.');
  }

  const email = process.env.DEMO_OWNER_EMAIL || 'demo@qresto.example';
  const password = await bcrypt.hash(demoPassword, 10);
  const now = new Date();
  const subscriptionEnd = new Date('2099-12-31T23:59:59.999Z');
  const openingHours = JSON.stringify({
    monday: { open: '11:00', close: '22:00', active: true },
    tuesday: { open: '11:00', close: '22:00', active: true },
    wednesday: { open: '11:00', close: '22:00', active: true },
    thursday: { open: '11:00', close: '22:00', active: true },
    friday: { open: '11:00', close: '23:00', active: true },
    saturday: { open: '11:00', close: '23:00', active: true },
    sunday: { open: '12:00', close: '21:00', active: true },
  });

  await prisma.$transaction(async (transaction) => {
    const owner = await transaction.user.upsert({
      where: { email },
      update: {
        firstName: 'Aïcha',
        lastName: 'Demo',
        phone: '0000000000',
        password,
        role: 'RESTAURANT_OWNER',
      },
      create: {
        id: 'demo_owner',
        email,
        firstName: 'Aïcha',
        lastName: 'Demo',
        phone: '0000000000',
        password,
        role: 'RESTAURANT_OWNER',
      },
    });

    const restaurant = await transaction.restaurant.upsert({
      where: { slug: 'le-maquis-du-baobab-demo' },
      update: {
        name: 'Le Maquis du Baobab',
        description: 'Cuisine béninoise généreuse, grillades et spécialités maison au cœur de Cotonou.',
        address: 'Quartier Haie Vive, Cotonou',
        city: 'Cotonou',
        phone: null,
        email,
        ownerId: owner.id,
        openingHours,
        isOpen: true,
        currency: 'FCFA',
        deliveryFee: 1000,
        minOrder: 3000,
        rating: 4.7,
        reviewCount: 3,
        category: 'Restaurant',
        cuisineType: 'Béninoise',
        subscriptionPlan: 'PRO_8000',
      },
      create: {
        id: 'demo_restaurant',
        name: 'Le Maquis du Baobab',
        slug: 'le-maquis-du-baobab-demo',
        description: 'Cuisine béninoise généreuse, grillades et spécialités maison au cœur de Cotonou.',
        address: 'Quartier Haie Vive, Cotonou',
        city: 'Cotonou',
        email,
        ownerId: owner.id,
        openingHours,
        isOpen: true,
        currency: 'FCFA',
        deliveryFee: 1000,
        minOrder: 3000,
        rating: 4.7,
        reviewCount: 3,
        category: 'Restaurant',
        cuisineType: 'Béninoise',
        subscriptionPlan: 'PRO_8000',
      },
    });

    await transaction.subscription.upsert({
      where: { restaurantId: restaurant.id },
      update: {
        planId: 'PRO',
        status: 'ACTIVE',
        endDate: subscriptionEnd,
        autoRenew: false,
      },
      create: {
        restaurantId: restaurant.id,
        planId: 'PRO',
        status: 'ACTIVE',
        billingCycle: 'MONTHLY',
        endDate: subscriptionEnd,
        autoRenew: false,
      },
    });

    const categoryData = [
      { id: 'demo_category_entrees', name: 'À partager', description: 'Entrées et petites faims', order: 0 },
      { id: 'demo_category_plats', name: 'Nos spécialités', description: 'Les incontournables de la maison', order: 1 },
      { id: 'demo_category_boissons', name: 'Boissons', description: 'Fraîcheur et boissons locales', order: 2 },
    ];
    for (const category of categoryData) {
      await transaction.category.upsert({
        where: { id: category.id },
        update: { ...category, restaurantId: restaurant.id, active: true },
        create: { ...category, restaurantId: restaurant.id, active: true },
      });
    }

    const dishData = [
      {
        id: 'demo_dish_akara',
        slug: 'akara-maison',
        name: 'Akara maison',
        description: 'Beignets de niébé croustillants, servis avec une sauce tomate relevée.',
        price: 1800,
        image: '/images/akara_streetfood_1790196240482.jpg',
        categoryId: 'demo_category_entrees',
        isPopular: true,
        preparationTimeMin: 12,
      },
      {
        id: 'demo_dish_poulet',
        slug: 'poulet-braise-baobab',
        name: 'Poulet braisé du Baobab',
        description: 'Demi-poulet mariné, braisé au feu de bois, avec alloco et salade.',
        price: 6500,
        image: '/images/poulet_braise_1790196218496.jpg',
        categoryId: 'demo_category_plats',
        isPopular: true,
        isChefSpecial: true,
        preparationTimeMin: 30,
      },
      {
        id: 'demo_dish_amiwo',
        slug: 'amiwo-poisson-grille',
        name: 'Amiwo & poisson grillé',
        description: 'Pâte rouge de maïs accompagnée de poisson frais grillé et crudités.',
        price: 5500,
        image: '/images/wagashi_amiwo_1790196228866.jpg',
        categoryId: 'demo_category_plats',
        isSpecialty: true,
        preparationTimeMin: 28,
      },
      {
        id: 'demo_dish_bissap',
        slug: 'bissap-frais',
        name: 'Bissap frais',
        description: 'Infusion d’hibiscus maison, fraîche et légèrement parfumée à la menthe.',
        price: 1000,
        categoryId: 'demo_category_boissons',
        image: null,
        preparationTimeMin: 2,
      },
    ];
    for (const dish of dishData) {
      await transaction.dish.upsert({
        where: { restaurantId_slug: { restaurantId: restaurant.id, slug: dish.slug } },
        update: { ...dish, restaurantId: restaurant.id, isAvailable: true },
        create: { ...dish, restaurantId: restaurant.id, isAvailable: true },
      });
    }

    const tableData = [
      { id: 'demo_table_01', number: '1', name: 'Terrasse 1', capacity: 4 },
      { id: 'demo_table_02', number: '2', name: 'Terrasse 2', capacity: 2 },
      { id: 'demo_table_03', number: '3', name: 'Salle principale', capacity: 4 },
      { id: 'demo_table_vip', number: 'VIP', name: 'Salon privé', capacity: 8 },
    ];
    for (const table of tableData) {
      await transaction.restaurantTable.upsert({
        where: { id: table.id },
        update: { ...table, restaurantId: restaurant.id, active: true },
        create: { ...table, restaurantId: restaurant.id, active: true },
      });
    }

    const orders = [
      { trackingCode: 'QR-ABCD2345', status: 'NEW' as const, type: 'DINE_IN' as const, tableNumber: '1', customerName: 'Client Démo 1', item: dishData[1], quantity: 1, ageHours: 0 },
      { trackingCode: 'QR-EFGH6789', status: 'PREPARING' as const, type: 'DINE_IN' as const, tableNumber: '2', customerName: 'Client Démo 2', item: dishData[2], quantity: 1, ageHours: 1 },
      { trackingCode: 'QR-JKLM2346', status: 'DELIVERED' as const, type: 'PICKUP' as const, tableNumber: null, customerName: 'Client Démo 3', item: dishData[1], quantity: 1, ageHours: 24 },
      { trackingCode: 'QR-PQRS7892', status: 'CANCELLED' as const, type: 'DELIVERY' as const, tableNumber: null, customerName: 'Client Démo 4', item: dishData[0], quantity: 2, ageHours: 36 },
      { trackingCode: 'QR-TUVW3456', status: 'DELIVERED' as const, type: 'PICKUP' as const, tableNumber: null, customerName: 'Client Démo 5', item: dishData[2], quantity: 1, ageHours: 48 },
      { trackingCode: 'QR-XYZB6789', status: 'DELIVERED' as const, type: 'DELIVERY' as const, tableNumber: null, customerName: 'Client Démo 6', item: dishData[0], quantity: 2, ageHours: 60 },
    ];
    const demoOrders: Array<{ id: string }> = [];
    for (const [index, orderData] of orders.entries()) {
      const createdAt = new Date(now.getTime() - orderData.ageHours * 60 * 60 * 1000);
      const total = orderData.item.price * orderData.quantity +
        (orderData.type === 'DELIVERY' ? 1000 : 0);
      const order = await transaction.order.upsert({
        where: { trackingCode: orderData.trackingCode },
        update: {
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
          restaurantPhone: null,
          type: orderData.type,
          tableNumber: orderData.tableNumber,
          subtotal: orderData.item.price * orderData.quantity,
          deliveryFee: orderData.type === 'DELIVERY' ? 1000 : 0,
          total,
          status: orderData.status,
          customerName: orderData.customerName,
          customerPhone: '0000000000',
          customerWhatsapp: null,
          whatsappConsent: false,
          customerAddress: orderData.type === 'DELIVERY' ? 'Adresse fictive de démonstration' : null,
          customerNotes: null,
          paymentMethod: 'CASH_ON_DELIVERY',
          paymentStatus: 'PENDING',
        },
        create: {
          trackingCode: orderData.trackingCode,
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
          type: orderData.type,
          tableNumber: orderData.tableNumber,
          subtotal: orderData.item.price * orderData.quantity,
          deliveryFee: orderData.type === 'DELIVERY' ? 1000 : 0,
          total,
          status: orderData.status,
          customerName: orderData.customerName,
          customerPhone: '0000000000',
          customerAddress: orderData.type === 'DELIVERY' ? 'Adresse fictive de démonstration' : null,
          paymentMethod: 'CASH_ON_DELIVERY',
          paymentStatus: 'PENDING',
          createdAt,
        },
      });
      demoOrders.push(order);

      await transaction.orderItem.upsert({
        where: { id: `demo_order_item_${index + 1}` },
        update: {
          orderId: order.id,
          dishId: orderData.item.id,
          name: orderData.item.name,
          price: orderData.item.price,
          quantity: orderData.quantity,
          image: orderData.item.image ?? null,
        },
        create: {
          id: `demo_order_item_${index + 1}`,
          orderId: order.id,
          dishId: orderData.item.id,
          name: orderData.item.name,
          price: orderData.item.price,
          quantity: orderData.quantity,
          image: orderData.item.image ?? null,
        },
      });

      await transaction.orderStatusHistory.upsert({
        where: { id: `demo_order_history_${index + 1}` },
        update: {
          orderId: order.id,
          status: orderData.status,
          comment: `Commande de démonstration — ${orderData.status.toLowerCase()}.`,
          timestamp: createdAt,
        },
        create: {
          id: `demo_order_history_${index + 1}`,
          orderId: order.id,
          status: orderData.status,
          comment: `Commande de démonstration — ${orderData.status.toLowerCase()}.`,
          timestamp: createdAt,
        },
      });

      const simulatedNotifications = [
        {
          id: `demo_notification_whatsapp_${index + 1}`,
          title: 'WhatsApp simulé',
          message: `Confirmation simulée enregistrée pour la commande ${order.trackingCode}. Aucun message n’a été envoyé.`,
          type: 'SIMULATED_WHATSAPP',
        },
        {
          id: `demo_notification_payment_${index + 1}`,
          title: 'Paiement simulé',
          message: `Paiement CASH_ON_DELIVERY simulé pour la commande ${order.trackingCode} (en attente). Aucun débit n’a été effectué.`,
          type: 'SIMULATED_PAYMENT',
        },
      ];
      for (const notification of simulatedNotifications) {
        await transaction.notification.upsert({
          where: { id: notification.id },
          update: {
            ...notification,
            restaurantId: restaurant.id,
            isRead: true,
          },
          create: {
            ...notification,
            restaurantId: restaurant.id,
            isRead: true,
          },
        });
      }
    }

    const reviews = [
      { id: 'demo_review_01', order: demoOrders[2], customerName: 'Client Démo 3', rating: 5, comment: 'Poulet savoureux et service très chaleureux.' },
      { id: 'demo_review_02', order: demoOrders[4], customerName: 'Client Démo 5', rating: 5, comment: 'Très belle découverte des spécialités locales.' },
      { id: 'demo_review_03', order: demoOrders[5], customerName: 'Client Démo 6', rating: 4, comment: 'Bon repas, portions généreuses.' },
    ];
    for (const review of reviews) {
      await transaction.review.upsert({
        where: { id: review.id },
        update: {
          orderId: review.order.id,
          restaurantId: restaurant.id,
          customerName: review.customerName,
          rating: review.rating,
          comment: review.comment,
          isApproved: true,
          isVisible: true,
        },
        create: {
          id: review.id,
          orderId: review.order.id,
          restaurantId: restaurant.id,
          customerName: review.customerName,
          rating: review.rating,
          comment: review.comment,
          isApproved: true,
          isVisible: true,
        },
      });
    }
  });
}

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

  await seedDemoRestaurant();
}

main()
  .catch(() => {
    console.error('Erreur lors du seed des contenus de landing et du restaurant de démonstration.');
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
