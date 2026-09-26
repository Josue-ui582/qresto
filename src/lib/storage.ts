import { INITIAL_CATEGORIES, INITIAL_DISHES, INITIAL_ORDERS, INITIAL_RESTAURANTS, INITIAL_TABLES, INITIAL_USERS, STORAGE_KEYS } from '@/constants/storageConstants';
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
