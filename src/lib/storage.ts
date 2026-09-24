import {
  Restaurant,
  Dish,
  Category,
  RestaurantTable,
  Order,
  User,
  OrderStatus,
  Testimonial,
  FAQItem,
} from '../types';

const STORAGE_KEYS = {
  RESTAURANTS: 'qresto_restaurants_v2',
  CATEGORIES: 'qresto_categories_v2',
  DISHES: 'qresto_dishes_v2',
  TABLES: 'qresto_tables_v2',
  ORDERS: 'qresto_orders_v2',
  USERS: 'qresto_users_v2',
  CURRENT_USER: 'qresto_current_user_v2',
};

// Seed Data for Benin & West African Restaurants
const INITIAL_USERS: User[] = [
  {
    id: 'user_delice',
    email: 'delice@qresto.africa',
    password: 'password123',
    firstName: 'Delice',
    lastName: 'SPEED',
    phone: '+229 97 00 00 99',
    role: 'RESTAURANT_OWNER',
    restaurantId: 'rest_delice',
    createdAt: '2026-03-01T10:00:00.000Z',
  },
  {
    id: 'user_mama',
    email: 'owner@chezmama.bj',
    password: 'password123',
    firstName: 'Reine',
    lastName: 'Dossou',
    phone: '+229 97 00 11 22',
    role: 'RESTAURANT_OWNER',
    restaurantId: 'rest_mama',
    createdAt: '2026-01-10T10:00:00.000Z',
  },
  {
    id: 'user_jardin',
    email: 'contact@jardin-fidjrosse.bj',
    password: 'password123',
    firstName: 'Patrick',
    lastName: 'Ahouandjinou',
    phone: '+229 95 33 44 55',
    role: 'RESTAURANT_OWNER',
    restaurantId: 'rest_jardin',
    createdAt: '2026-02-01T12:00:00.000Z',
  },
  {
    id: 'user_admin',
    email: 'admin@qresto.africa',
    password: 'admin123',
    firstName: 'Super',
    lastName: 'Admin',
    phone: '+229 90 00 00 00',
    role: 'SUPER_ADMIN',
    createdAt: '2026-01-01T08:00:00.000Z',
  },
];

const INITIAL_RESTAURANTS: Restaurant[] = [
  {
    id: 'rest_delice',
    name: 'Delice SPEED',
    slug: 'delice-speed',
    description: 'Restauration rapide & délices gourmands au Bénin. Burgers gourmets, poulet croustillant et spécialités express.',
    address: 'Carrefour Sainte Rita, Cotonou',
    city: 'Cotonou',
    phone: '+229 97 00 00 99',
    email: 'contact@delicespeed.bj',
    logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80',
    coverImage: '/src/assets/images/resto_ambiance_1790196207320.jpg',
    openingHours: '10h00 - 23h00 (7j/7)',
    isOpen: true,
    currency: 'FCFA',
    deliveryFee: 1000,
    minOrder: 2000,
    rating: 4.9,
    reviewCount: 128,
    category: 'Fast Food & Grillades',
    ownerId: 'user_delice',
    subscriptionPlan: 'FREE',
    subscriptionExpiresAt: '2026-12-31T23:59:59.000Z',
    settings: {
      soundNotifications: true,
      emailNotifications: true,
      acceptDelivery: true,
      acceptDineIn: true,
      acceptPickup: true,
      tableOrderDirect: true,
      autoConfirmOrders: false,
      momoNumber: '+229 97 00 00 99',
      momoProvider: 'MTN',
    },
    createdAt: '2026-03-01T10:00:00.000Z',
  },
  {
    id: 'rest_mama',
    name: 'Chez Mama Bénin',
    slug: 'chez-mama-benin',
    description: 'Le temple de la cuisine authentique béninoise à Cotonou. Igname pilée, Amiwo traditionnel, sauces locales et viandes braisées au feu de bois.',
    address: 'Rue 340, Quartier Haie Vive',
    city: 'Cotonou',
    phone: '+229 97 00 11 22',
    email: 'contact@chezmama.bj',
    logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80',
    coverImage: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
    openingHours: '11h30 - 23h00 (Tous les jours)',
    isOpen: true,
    currency: 'FCFA',
    deliveryFee: 1000,
    minOrder: 2500,
    rating: 4.9,
    reviewCount: 342,
    category: 'Cuisine Béninoise & Grillades',
    ownerId: 'user_mama',
    subscriptionPlan: 'PRO_8000',
    subscriptionExpiresAt: '2026-12-31T23:59:59.000Z',
    settings: {
      soundNotifications: true,
      emailNotifications: true,
      acceptDelivery: true,
      acceptDineIn: true,
      acceptPickup: true,
      tableOrderDirect: true,
      autoConfirmOrders: false,
      momoNumber: '+229 97 00 11 22',
      momoProvider: 'MTN',
    },
    createdAt: '2026-01-10T10:00:00.000Z',
  },
  {
    id: 'rest_jardin',
    name: 'Le Jardin Fidjrossè',
    slug: 'le-jardin-fidjrosse',
    description: 'Face à la brise marine de Fidjrossè Plage, profitez de nos poissons braisés entiers, capitaines frais, langoustines et cocktails artisanaux.',
    address: 'Boulevard de la Marina, Plage de Fidjrossè',
    city: 'Cotonou',
    phone: '+229 95 33 44 55',
    email: 'info@jardin-fidjrosse.bj',
    logo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=300&q=80',
    coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    openingHours: '12h00 - 01h00',
    isOpen: true,
    currency: 'FCFA',
    deliveryFee: 1200,
    minOrder: 3000,
    rating: 4.8,
    reviewCount: 218,
    category: 'Poissons & Grillades Marines',
    ownerId: 'user_jardin',
    subscriptionPlan: 'STARTER_5000',
    subscriptionExpiresAt: '2026-11-30T23:59:59.000Z',
    settings: {
      soundNotifications: true,
      emailNotifications: false,
      acceptDelivery: true,
      acceptDineIn: true,
      acceptPickup: true,
      tableOrderDirect: true,
      autoConfirmOrders: true,
      momoNumber: '+229 95 33 44 55',
      momoProvider: 'MOOV',
    },
    createdAt: '2026-02-01T12:00:00.000Z',
  },
  {
    id: 'rest_afroburger',
    name: 'AfroBurger Lounge',
    slug: 'afroburger-lounge',
    description: 'Street-food premium revisitée : burgers gastronomiques aux sauces kinkeliba, frites croustillantes d\'igname et jus naturels pressés à froid.',
    address: 'Avenue Jean-Paul II, Cadjèhoun',
    city: 'Cotonou',
    phone: '+229 96 88 99 00',
    email: 'hello@afroburger.bj',
    logo: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80',
    coverImage: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80',
    openingHours: '11h00 - 23h30',
    isOpen: true,
    currency: 'FCFA',
    deliveryFee: 800,
    minOrder: 2000,
    rating: 4.7,
    reviewCount: 185,
    category: 'Burgers & Street Food Africaine',
    ownerId: 'user_mama',
    subscriptionPlan: 'PRO_8000',
    settings: {
      soundNotifications: true,
      emailNotifications: true,
      acceptDelivery: true,
      acceptDineIn: true,
      acceptPickup: true,
      tableOrderDirect: true,
      autoConfirmOrders: false,
    },
    createdAt: '2026-02-15T14:00:00.000Z',
  },
  {
    id: 'rest_oueme',
    name: 'Saveurs de l\'Ouémé',
    slug: 'saveurs-oueme',
    description: 'Les délices de la capitale historique Porto-Novo : poissons séchés à la braise, kpanman croustillant, sauces traditionnelles et boissons locales.',
    address: 'Carrefour Cinquantenaire, Ouando',
    city: 'Porto-Novo',
    phone: '+229 94 12 34 56',
    email: 'contact@saveursoueme.bj',
    logo: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=300&q=80',
    coverImage: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80',
    openingHours: '10h00 - 22h00',
    isOpen: true,
    currency: 'FCFA',
    deliveryFee: 700,
    minOrder: 2000,
    rating: 4.9,
    reviewCount: 97,
    category: 'Tradition Béninoise & Terroir',
    ownerId: 'user_jardin',
    subscriptionPlan: 'FREE',
    settings: {
      soundNotifications: true,
      emailNotifications: false,
      acceptDelivery: true,
      acceptDineIn: true,
      acceptPickup: true,
      tableOrderDirect: true,
      autoConfirmOrders: false,
    },
    createdAt: '2026-03-01T09:00:00.000Z',
  },
];

const INITIAL_CATEGORIES: Category[] = [
  // Chez Mama categories
  { id: 'cat_mama_1', restaurantId: 'rest_mama', name: 'Plats Traditionnels', order: 1, icon: 'bowl-rice', active: true },
  { id: 'cat_mama_2', restaurantId: 'rest_mama', name: 'Grillades au Feu de Bois', order: 2, icon: 'fire-flame-curved', active: true },
  { id: 'cat_mama_3', restaurantId: 'rest_mama', name: 'Accompagnements & Alloco', order: 3, icon: 'utensils', active: true },
  { id: 'cat_mama_4', restaurantId: 'rest_mama', name: 'Boissons Locales & Jus Frais', order: 4, icon: 'glass-water', active: true },

  // Le Jardin categories
  { id: 'cat_jardin_1', restaurantId: 'rest_jardin', name: 'Poissons & Crustacés', order: 1, icon: 'fish', active: true },
  { id: 'cat_jardin_2', restaurantId: 'rest_jardin', name: 'Brochettes & Viandes', order: 2, icon: 'drumstick-bite', active: true },
  { id: 'cat_jardin_3', restaurantId: 'rest_jardin', name: 'Cocktails Tropicaux', order: 3, icon: 'martini-glass-citrus', active: true },

  // AfroBurger categories
  { id: 'cat_burger_1', restaurantId: 'rest_afroburger', name: 'Burgers Signature', order: 1, icon: 'burger', active: true },
  { id: 'cat_burger_2', restaurantId: 'rest_afroburger', name: 'Frites & Sides', order: 2, icon: 'cookie', active: true },
  { id: 'cat_burger_3', restaurantId: 'rest_afroburger', name: 'Boissons & Shakes', order: 3, icon: 'mug-hot', active: true },
];

const INITIAL_DISHES: Dish[] = [
  // Chez Mama dishes
  {
    id: 'dish_mama_1',
    restaurantId: 'rest_mama',
    categoryId: 'cat_mama_1',
    name: 'Igname Pilée royale (Télibo / Agoun) & Sauce Gombo',
    slug: 'igname-pilee-royale-sauce-gombo',
    description: 'Igname blanche pilée à la commande selon la tradition, accompagnée de notre sauce gombo fraîche cuisinée au poisson fumé et crabes de mer.',
    price: 3500,
    originalPrice: 4000,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    preparationTimeMin: 20,
    allergens: ['Poissons', 'Crustacés'],
    isPopular: true,
    isChefSpecial: true,
    has3DModel: true,
    model3DType: 'igname_pile',
    createdAt: '2026-01-10T10:00:00.000Z',
  },
  {
    id: 'dish_mama_2',
    restaurantId: 'rest_mama',
    categoryId: 'cat_mama_2',
    name: 'Poulet Bicyclette Braisé Fermier',
    slug: 'poulet-bicyclette-braise-fermier',
    description: 'Poulet local béninois mariné aux épices du terroir (gingembre, ail, poivre noir de Penja), grillé lentement à la braise de charbon de bois.',
    price: 4500,
    originalPrice: 5000,
    image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    preparationTimeMin: 25,
    allergens: [],
    isPopular: true,
    has3DModel: true,
    model3DType: 'poulet_braise',
    createdAt: '2026-01-10T10:00:00.000Z',
  },
  {
    id: 'dish_mama_3',
    restaurantId: 'rest_mama',
    categoryId: 'cat_mama_1',
    name: 'Amiwo rouge au Poulet doré & Piment vert',
    slug: 'amiwo-rouge-au-poulet-dore',
    description: 'Pâte de maïs rouge raffinée cuite dans un bouillon de poulet assaisonné, servie avec cuisse de poulet dorée et piment vert écrasé.',
    price: 3000,
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    preparationTimeMin: 15,
    allergens: [],
    isPopular: true,
    has3DModel: false,
    createdAt: '2026-01-10T10:00:00.000Z',
  },
  {
    id: 'dish_mama_4',
    restaurantId: 'rest_mama',
    categoryId: 'cat_mama_3',
    name: 'Alloco doré croustillant au piment doux',
    slug: 'alloco-dore-croustillant',
    description: 'Bananes plantains mûres frites à point, dorées et fondantes, servies avec notre concassé de tomates et oignons frits.',
    price: 1500,
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    preparationTimeMin: 10,
    allergens: [],
    has3DModel: true,
    model3DType: 'alloco',
    createdAt: '2026-01-10T10:00:00.000Z',
  },
  {
    id: 'dish_mama_5',
    restaurantId: 'rest_mama',
    categoryId: 'cat_mama_4',
    name: 'Bissap Rouge infusé à la Menthe & Gingembre (1L)',
    slug: 'bissap-rouge-menthe-gingembre',
    description: 'Infusion fraîche de fleurs d\'hibiscus sauvage du Bénin, relevée d\'une touche de gingembre frais et de menthe de notre potager.',
    price: 1200,
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    preparationTimeMin: 5,
    allergens: [],
    has3DModel: false,
    createdAt: '2026-01-10T10:00:00.000Z',
  },

  // Le Jardin dishes
  {
    id: 'dish_jardin_1',
    restaurantId: 'rest_jardin',
    categoryId: 'cat_jardin_1',
    name: 'Capitaine Braisé entier de l\'Océan (1.2 kg)',
    slug: 'capitaine-braise-entier-ocean',
    description: 'Pêché le matin même au large de Cotonou, mariné aux herbes côtières, cuit à la braise et servi avec alloco, attiéké et sauce moyo.',
    price: 8500,
    originalPrice: 9500,
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    preparationTimeMin: 35,
    allergens: ['Poissons'],
    isPopular: true,
    isChefSpecial: true,
    has3DModel: true,
    model3DType: 'poisson_grille',
    createdAt: '2026-02-01T12:00:00.000Z',
  },
  {
    id: 'dish_jardin_2',
    restaurantId: 'rest_jardin',
    categoryId: 'cat_jardin_2',
    name: 'Brochettes Géantes de Bœuf Suya (4 pièces)',
    slug: 'brochettes-geantes-boeuf-suya',
    description: 'Fines lamelles de bœuf tendre enrobées d\'épices yaji / kankan traditionnelles, oignons rouges émincés et piment séché.',
    price: 3500,
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    preparationTimeMin: 15,
    allergens: ['Arachides'],
    isPopular: true,
    has3DModel: false,
    createdAt: '2026-02-01T12:00:00.000Z',
  },

  // AfroBurger dishes
  {
    id: 'dish_burger_1',
    restaurantId: 'rest_afroburger',
    categoryId: 'cat_burger_1',
    name: 'Le Dahomey Double Beef & Fromage Peulh',
    slug: 'le-dahomey-double-beef-fromage-peulh',
    description: 'Double steak de bœuf haché maison, fromage peulh (wagashi) grillé fondant, confit d\'oignons au miel de Savè, sauce burger maison.',
    price: 4500,
    originalPrice: 5000,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    preparationTimeMin: 15,
    allergens: ['Lactose', 'Gluten'],
    isPopular: true,
    isChefSpecial: true,
    has3DModel: true,
    model3DType: 'burger',
    createdAt: '2026-02-15T14:00:00.000Z',
  },
];

const INITIAL_TABLES: RestaurantTable[] = [
  // Chez Mama Tables
  { id: 'tab_mama_1', restaurantId: 'rest_mama', number: 1, name: 'Table VIP Terrasse', capacity: 4, active: true, createdAt: '2026-01-10T10:00:00.000Z' },
  { id: 'tab_mama_2', restaurantId: 'rest_mama', number: 2, name: 'Table Jardin 2', capacity: 2, active: true, createdAt: '2026-01-10T10:00:00.000Z' },
  { id: 'tab_mama_3', restaurantId: 'rest_mama', number: 3, name: 'Table Famille 3', capacity: 6, active: true, createdAt: '2026-01-10T10:00:00.000Z' },
  { id: 'tab_mama_4', restaurantId: 'rest_mama', number: 4, name: 'Table Pergola 4', capacity: 4, active: true, createdAt: '2026-01-10T10:00:00.000Z' },
  { id: 'tab_mama_5', restaurantId: 'rest_mama', number: 5, name: 'Table Intérieure 5', capacity: 2, active: true, createdAt: '2026-01-10T10:00:00.000Z' },

  // Le Jardin Tables
  { id: 'tab_jardin_1', restaurantId: 'rest_jardin', number: 1, name: 'Table Vue Mer 1', capacity: 4, active: true, createdAt: '2026-02-01T12:00:00.000Z' },
  { id: 'tab_jardin_2', restaurantId: 'rest_jardin', number: 2, name: 'Table Paillote 2', capacity: 6, active: true, createdAt: '2026-02-01T12:00:00.000Z' },
  { id: 'tab_jardin_3', restaurantId: 'rest_jardin', number: 3, name: 'Table Lounge 3', capacity: 2, active: true, createdAt: '2026-02-01T12:00:00.000Z' },
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord_101',
    trackingCode: 'QR-7842',
    restaurantId: 'rest_mama',
    restaurantName: 'Chez Mama Bénin',
    restaurantPhone: '+229 97 00 11 22',
    type: 'DINE_IN',
    tableNumber: 4,
    items: [
      {
        dishId: 'dish_mama_1',
        name: 'Igname Pilée royale & Sauce Gombo',
        price: 3500,
        quantity: 2,
        notes: 'Piment bien relevé SVP',
      },
      {
        dishId: 'dish_mama_5',
        name: 'Bissap Rouge infusé à la Menthe (1L)',
        price: 1200,
        quantity: 1,
      },
    ],
    subtotal: 8200,
    deliveryFee: 0,
    total: 8200,
    status: 'PREPARING',
    customerName: 'Kofi Mensah',
    customerPhone: '+229 97 45 67 89',
    paymentMethod: 'MTN_MOMO',
    paymentStatus: 'PAID',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    statusHistory: [
      { status: 'NEW', timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), note: 'Commande reçue depuis la Table 4' },
      { status: 'CONFIRMED', timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(), note: 'Confirmée par la cuisine' },
      { status: 'PREPARING', timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), note: 'En cours de préparation au feu' },
    ],
  },
  {
    id: 'ord_102',
    trackingCode: 'QR-9310',
    restaurantId: 'rest_mama',
    restaurantName: 'Chez Mama Bénin',
    restaurantPhone: '+229 97 00 11 22',
    type: 'DELIVERY',
    items: [
      {
        dishId: 'dish_mama_2',
        name: 'Poulet Bicyclette Braisé Fermier',
        price: 4500,
        quantity: 1,
      },
      {
        dishId: 'dish_mama_4',
        name: 'Alloco doré croustillant',
        price: 1500,
        quantity: 1,
      },
    ],
    subtotal: 6000,
    deliveryFee: 1000,
    total: 7000,
    status: 'READY',
    customerName: 'Amina Alao',
    customerPhone: '+229 96 11 22 33',
    customerAddress: 'Cotonou, Haie Vive, Rue derrière ambassade de France',
    customerNotes: 'Sonner au portail marron',
    paymentMethod: 'CASH_ON_DELIVERY',
    paymentStatus: 'PENDING',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    statusHistory: [
      { status: 'NEW', timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
      { status: 'CONFIRMED', timestamp: new Date(Date.now() - 28 * 60 * 1000).toISOString() },
      { status: 'PREPARING', timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString() },
      { status: 'READY', timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(), note: 'Plat emballé et prêt à être remis au livreur' },
    ],
  },
  {
    id: 'ord_103',
    trackingCode: 'QR-2405',
    restaurantId: 'rest_jardin',
    restaurantName: 'Le Jardin Fidjrossè',
    restaurantPhone: '+229 95 33 44 55',
    type: 'DINE_IN',
    tableNumber: 1,
    items: [
      {
        dishId: 'dish_jardin_1',
        name: 'Capitaine Braisé entier de l\'Océan',
        price: 8500,
        quantity: 1,
      },
    ],
    subtotal: 8500,
    deliveryFee: 0,
    total: 8500,
    status: 'NEW',
    customerName: 'Édouard Houndété',
    customerPhone: '+229 94 88 77 66',
    paymentMethod: 'MOOV_MONEY',
    paymentStatus: 'PAID',
    createdAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    statusHistory: [
      { status: 'NEW', timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString(), note: 'Nouvelle commande Table 1' },
    ],
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 'testi_1',
    name: 'Reine Dossou',
    role: 'Fondatrice & Cheffe',
    restaurantName: 'Chez Mama Bénin (Cotonou, Haie Vive)',
    city: 'Cotonou, Bénin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    rating: 5,
    text: 'Depuis que nous utilisons QResto, les commandes à table sont 3 fois plus fluides aux heures de pointe. Les clients scannent le QR code posé sur leur table avec leur smartphone sans rien installer, choisissent leur plat et nous recevons la commande directement en cuisine. Le suivi en direct évite toute attente inutile !',
  },
  {
    id: 'testi_2',
    name: 'Patrick Ahouandjinou',
    role: 'Gérant Propriétaire',
    restaurantName: 'Le Jardin Fidjrossè',
    city: 'Cotonou, Bénin',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    rating: 5,
    text: 'La digitalisation de notre menu a tout changé. Nous pouvons mettre à jour le prix du poisson du jour ou marquer un plat en rupture en 2 secondes depuis notre téléphone. Nos clients adorent la clarté des photos et la visualisation 3D des plats ! L\'abonnement à 8 000 FCFA est rentabilisé dès le premier week-end.',
  },
  {
    id: 'testi_3',
    name: 'Kofi Mensah & Famille',
    role: 'Client Gourmet régulier',
    city: 'Cotonou, Bénin',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    rating: 5,
    text: 'Ce que j\'apprécie le plus sur QResto, c\'est qu\'on a pas besoin de créer de compte ni de télécharger une application lourde. On cherche ce qu\'on veut manger, on passe commande, et le code de suivi nous permet de savoir précisément quand le plat est prêt ! C\'est moderne, rapide et fiable.',
  },
  {
    id: 'testi_4',
    name: 'Bernadette Kpadonou',
    role: 'Restauratrice & Traiteur',
    restaurantName: 'Saveurs de Porto-Novo',
    city: 'Porto-Novo, Bénin',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    rating: 5,
    text: 'L\'intégration de MTN Mobile Money et Moov Money est parfaitement adaptée à nos réalités au Bénin. On a généré nos QR codes pour nos tables, on les a imprimés et plastifiés. La plateforme est ultra simple même pour notre personnel de salle.',
  },
];

export const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'faq_1',
    category: 'client',
    question: 'Les clients doivent-ils créer un compte ou télécharger une application pour commander ?',
    answer: 'Non, absolument pas ! Les clients scannent simplement le QR code de la table avec l\'appareil photo de leur téléphone ou accèdent au lien du restaurant. Ils consultent le menu interactif, ajoutent leurs plats au panier et valident leur commande en quelques secondes. Ils reçoivent immédiatement un code de suivi (ex: QR-7842) pour suivre l\'avancement en direct.',
  },
  {
    id: 'faq_2',
    category: 'restaurant',
    question: 'Comment fonctionnent les QR codes sur les tables du restaurant ?',
    answer: 'Depuis votre Dashboard QResto, vous créez vos tables (Table 1, Table 2, VIP, etc.). En un clic, QResto génère un QR code unique pour chaque table avec l\'adresse directe de votre menu. Vous pouvez télécharger le QR code en haute définition, l\'imprimer ou le plastifier sur vos tables ou chevalets.',
  },
  {
    id: 'faq_3',
    category: 'paiement',
    question: 'Quels sont les tarifs d\'abonnement pour les restaurants partenaires ?',
    answer: 'QResto propose une tarification claire et accessible en FCFA : le Plan Starter à 5 000 FCFA/mois (idéal pour digitaliser son menu et gérer jusqu\'à 15 tables) et le Plan Pro à 8 000 FCFA/mois (menus illimités, QR codes illimités, analytics poussés, modélisation 3D des plats et support prioritaire WhatsApp 7j/7).',
  },
  {
    id: 'faq_4',
    category: 'paiement',
    question: 'Quels sont les modes de paiement acceptés pour les commandes ?',
    answer: 'QResto intègre les paiements préférés au Bénin et en Afrique de l\'Ouest : MTN Mobile Money (MoMo), Moov Money, Paiement à la livraison (espèces à la réception ou à table), ainsi que les cartes bancaires Visa / Mastercard via passerelle sécurisée.',
  },
  {
    id: 'faq_5',
    category: 'restaurant',
    question: 'Comment mes données sont-elles protégées par rapport aux autres restaurants ?',
    answer: 'QResto intègre une isolation stricte multi-tenant. Chaque restaurant possède son espace privé et étanche. Aucun autre établissement ne peut voir vos commandes, vos chiffres d\'affaires, vos tables ou vos coordonnées clients. Votre compte est 100% sécurisé et accessible uniquement par vos identifiants.',
  },
  {
    id: 'faq_6',
    category: 'restaurant',
    question: 'Puis-je modifier mes prix, ajouter des photos ou masquer un plat en rupture ?',
    answer: 'Oui, instantanément ! Depuis votre tableau de bord restaurant sur smartphone ou ordinateur, vous pouvez ajouter une photo depuis votre galerie, ajuster un prix, modifier les ingrédients ou basculer un plat en "Indisponible" en un clic. Votre menu digital se met à jour immédiatement.',
  },
];

// In-Memory & LocalStorage Storage Implementation
class QRestoStorage {
  private memoryStore: Map<string, string> = new Map();

  private get<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') {
      const item = this.memoryStore.get(key);
      return item ? JSON.parse(item) : defaultValue;
    }
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private set<T>(key: string, value: T): void {
    if (typeof window === 'undefined') {
      this.memoryStore.set(key, JSON.stringify(value));
      return;
    }
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage error:', e);
    }
  }

  // Initialization
  public init(): void {
    if (typeof window === 'undefined') {
      if (!this.memoryStore.has(STORAGE_KEYS.RESTAURANTS)) {
        this.memoryStore.set(STORAGE_KEYS.RESTAURANTS, JSON.stringify(INITIAL_RESTAURANTS));
      }
      if (!this.memoryStore.has(STORAGE_KEYS.USERS)) {
        this.memoryStore.set(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
      }
      if (!this.memoryStore.has(STORAGE_KEYS.CATEGORIES)) {
        this.memoryStore.set(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
      }
      if (!this.memoryStore.has(STORAGE_KEYS.DISHES)) {
        this.memoryStore.set(STORAGE_KEYS.DISHES, JSON.stringify(INITIAL_DISHES));
      }
      if (!this.memoryStore.has(STORAGE_KEYS.TABLES)) {
        this.memoryStore.set(STORAGE_KEYS.TABLES, JSON.stringify(INITIAL_TABLES));
      }
      if (!this.memoryStore.has(STORAGE_KEYS.ORDERS)) {
        this.memoryStore.set(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
      }
      return;
    }

    try {
      if (!localStorage.getItem(STORAGE_KEYS.RESTAURANTS)) {
        this.set(STORAGE_KEYS.RESTAURANTS, INITIAL_RESTAURANTS);
      }
      if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
        this.set(STORAGE_KEYS.USERS, INITIAL_USERS);
      }
      if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
        this.set(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
      }
      if (!localStorage.getItem(STORAGE_KEYS.DISHES)) {
        this.set(STORAGE_KEYS.DISHES, INITIAL_DISHES);
      }
      if (!localStorage.getItem(STORAGE_KEYS.TABLES)) {
        this.set(STORAGE_KEYS.TABLES, INITIAL_TABLES);
      }
      if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
        this.set(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
      }
    } catch (e) {
      console.warn('Storage init error:', e);
    }
  }

  // RESTAURANTS
  public getRestaurants(): Restaurant[] {
    return this.get<Restaurant[]>(STORAGE_KEYS.RESTAURANTS, INITIAL_RESTAURANTS);
  }

  public getRestaurantById(id: string): Restaurant | undefined {
    return this.getRestaurants().find((r) => r.id === id);
  }

  public getRestaurantBySlug(slug: string): Restaurant | undefined {
    return this.getRestaurants().find((r) => r.slug === slug);
  }

  public createRestaurant(restaurantData: Omit<Restaurant, 'id' | 'createdAt'>): Restaurant {
    const restaurants = this.getRestaurants();
    const newRestaurant: Restaurant = {
      ...restaurantData,
      id: `rest_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    restaurants.unshift(newRestaurant);
    this.set(STORAGE_KEYS.RESTAURANTS, restaurants);
    return newRestaurant;
  }

  public updateRestaurant(id: string, updates: Partial<Restaurant>): Restaurant | null {
    const restaurants = this.getRestaurants();
    const index = restaurants.findIndex((r) => r.id === id);
    if (index === -1) return null;

    restaurants[index] = { ...restaurants[index], ...updates };
    this.set(STORAGE_KEYS.RESTAURANTS, restaurants);
    return restaurants[index];
  }

  // MULTI-TENANT ISOLATION CHECK
  public canAccessRestaurant(user: User | null, restaurantId: string): boolean {
    if (!user) return false;
    if (user.role === 'SUPER_ADMIN') return true;
    return user.restaurantId === restaurantId;
  }

  // CATEGORIES
  public getCategories(restaurantId?: string): Category[] {
    const categories = this.get<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    if (restaurantId) {
      return categories.filter((c) => c.restaurantId === restaurantId).sort((a, b) => a.order - b.order);
    }
    return categories;
  }

  public createCategory(data: Omit<Category, 'id'>): Category {
    const categories = this.get<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    const newCat: Category = {
      ...data,
      id: `cat_${Date.now()}`,
    };
    categories.push(newCat);
    this.set(STORAGE_KEYS.CATEGORIES, categories);
    return newCat;
  }

  public updateCategory(id: string, updates: Partial<Category>): Category | null {
    const categories = this.get<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    const index = categories.findIndex((c) => c.id === id);
    if (index === -1) return null;
    categories[index] = { ...categories[index], ...updates };
    this.set(STORAGE_KEYS.CATEGORIES, categories);
    return categories[index];
  }

  public deleteCategory(id: string): boolean {
    const categories = this.get<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    const filtered = categories.filter((c) => c.id !== id);
    this.set(STORAGE_KEYS.CATEGORIES, filtered);
    return true;
  }

  // DISHES
  public getDishes(restaurantId?: string): Dish[] {
    const dishes = this.get<Dish[]>(STORAGE_KEYS.DISHES, INITIAL_DISHES);
    if (restaurantId) {
      return dishes.filter((d) => d.restaurantId === restaurantId);
    }
    return dishes;
  }

  public getDishById(id: string): Dish | undefined {
    return this.getDishes().find((d) => d.id === id);
  }

  public getDishBySlug(restaurantId: string, slug: string): Dish | undefined {
    return this.getDishes(restaurantId).find((d) => d.slug === slug);
  }

  public createDish(data: Omit<Dish, 'id' | 'createdAt'>): Dish {
    const dishes = this.get<Dish[]>(STORAGE_KEYS.DISHES, INITIAL_DISHES);
    const newDish: Dish = {
      ...data,
      id: `dish_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    dishes.unshift(newDish);
    this.set(STORAGE_KEYS.DISHES, dishes);
    return newDish;
  }

  public updateDish(id: string, updates: Partial<Dish>): Dish | null {
    const dishes = this.get<Dish[]>(STORAGE_KEYS.DISHES, INITIAL_DISHES);
    const index = dishes.findIndex((d) => d.id === id);
    if (index === -1) return null;
    dishes[index] = { ...dishes[index], ...updates };
    this.set(STORAGE_KEYS.DISHES, dishes);
    return dishes[index];
  }

  public deleteDish(id: string): boolean {
    const dishes = this.get<Dish[]>(STORAGE_KEYS.DISHES, INITIAL_DISHES);
    const filtered = dishes.filter((d) => d.id !== id);
    this.set(STORAGE_KEYS.DISHES, filtered);
    return true;
  }

  // TABLES
  public getTables(restaurantId?: string): RestaurantTable[] {
    const tables = this.get<RestaurantTable[]>(STORAGE_KEYS.TABLES, INITIAL_TABLES);
    if (restaurantId) {
      return tables.filter((t) => t.restaurantId === restaurantId);
    }
    return tables;
  }

  public createTable(data: Omit<RestaurantTable, 'id' | 'createdAt'>): RestaurantTable {
    const tables = this.get<RestaurantTable[]>(STORAGE_KEYS.TABLES, INITIAL_TABLES);
    const newTable: RestaurantTable = {
      ...data,
      id: `tab_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    tables.push(newTable);
    this.set(STORAGE_KEYS.TABLES, tables);
    return newTable;
  }

  public deleteTable(id: string): boolean {
    const tables = this.get<RestaurantTable[]>(STORAGE_KEYS.TABLES, INITIAL_TABLES);
    const filtered = tables.filter((t) => t.id !== id);
    this.set(STORAGE_KEYS.TABLES, filtered);
    return true;
  }

  // ORDERS
  public getOrders(restaurantId?: string): Order[] {
    const orders = this.get<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    if (restaurantId) {
      return orders.filter((o) => o.restaurantId === restaurantId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getOrderByTrackingCode(code: string): Order | undefined {
    const clean = code.trim().toUpperCase();
    return this.getOrders().find(
      (o) => o.trackingCode.toUpperCase() === clean || o.id === code.trim()
    );
  }

  public createOrder(orderData: Omit<Order, 'id' | 'trackingCode' | 'createdAt' | 'updatedAt' | 'statusHistory'>): Order {
    const orders = this.get<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    // Generate unique friendly code e.g. "QR-8241"
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const trackingCode = `QR-${randomSuffix}`;
    const now = new Date().toISOString();

    const newOrder: Order = {
      ...orderData,
      id: `ord_${Date.now()}`,
      trackingCode,
      createdAt: now,
      updatedAt: now,
      statusHistory: [
        {
          status: orderData.status || 'NEW',
          timestamp: now,
          note: orderData.type === 'DINE_IN' ? `Commande enregistrée pour la table ${orderData.tableNumber || ''}` : 'Commande client reçue',
        },
      ],
    };

    orders.unshift(newOrder);
    this.set(STORAGE_KEYS.ORDERS, orders);
    return newOrder;
  }

  public updateOrderStatus(orderId: string, status: OrderStatus, note?: string): Order | null {
    const orders = this.get<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    const index = orders.findIndex((o) => o.id === orderId);
    if (index === -1) return null;

    const now = new Date().toISOString();
    const currentOrder = orders[index];
    const updatedHistory = [
      ...(currentOrder.statusHistory || []),
      { status, timestamp: now, note: note || `Statut passé à : ${status}` },
    ];

    orders[index] = {
      ...currentOrder,
      status,
      updatedAt: now,
      statusHistory: updatedHistory,
    };

    this.set(STORAGE_KEYS.ORDERS, orders);
    return orders[index];
  }

  // AUTHENTICATION & USERS
  public getUsers(): User[] {
    return this.get<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  public getCurrentUser(): User | null {
    return this.get<User | null>(STORAGE_KEYS.CURRENT_USER, null);
  }

  public setCurrentUser(user: User | null): void {
    this.set(STORAGE_KEYS.CURRENT_USER, user);
  }

  public registerUser(userData: Omit<User, 'id' | 'createdAt'>): User {
    const users = this.getUsers();
    const existing = users.find((u) => u.email.toLowerCase() === userData.email.toLowerCase());
    if (existing) {
      throw new Error('Un utilisateur avec cet email existe déjà');
    }

    const newUser: User = {
      ...userData,
      id: `user_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    this.set(STORAGE_KEYS.USERS, users);
    this.setCurrentUser(newUser);
    return newUser;
  }

  public loginUser(email: string, password?: string): User {
    const users = this.getUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      throw new Error('Identifiants incorrects ou compte inexistant');
    }
    if (password && user.password && user.password !== password) {
      throw new Error('Mot de passe incorrect');
    }
    this.setCurrentUser(user);
    return user;
  }

  public logout(): void {
    this.setCurrentUser(null);
  }
}

export const storage = new QRestoStorage();
// auto-init on import
storage.init();
