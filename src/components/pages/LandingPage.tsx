'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  QrCode,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  RotateCw,
  Utensils,
  Smartphone,
  ChevronDown,
  Star,
  CheckCircle2,
  Clock,
  Printer,
  Compass,
  Store,
  Layers,
  Award,
  Flame,
  Check,
  X,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';
import { Dish3DViewer } from '../3d/Dish3DViewer';
import { storage } from '../../lib/storage';

export const LandingPage: React.FC = () => {
  const { navigateTo } = useNavigation();

  // State for interactive features
  const [activeSpecialtyTab, setActiveSpecialtyTab] = useState<'all' | 'signature' | 'street' | 'drinks'>('all');
  const [selected3DDish, setSelected3DDish] = useState<{
    id: string;
    name: string;
    price: number;
    description: string;
    modelType: 'poulet_braise' | 'poisson_grille' | 'igname_pile' | 'burger' | 'alloco' | 'cocktail';
    ingredients: string[];
    prepTime: string;
  } | null>(null);

  // Live QR Demo State
  const [demoTable, setDemoTable] = useState<number>(4);
  const [demoRestoName, setDemoRestoName] = useState<string>('Chez Mama Bénin');
  const [demoColor, setDemoColor] = useState<string>('#d97706'); // Amber 600

  // Pricing toggle (Mensuel / Annuel)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // FAQ state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  // Curated African Dishes with 3D Models & Photo Assets
  const dishesShowcase = [
    {
      id: 'dish_poulet',
      name: 'Poulet Bicyclette Braisé Kpédji',
      category: 'signature',
      price: 4500,
      currency: 'FCFA',
      rating: 4.9,
      reviewsCount: 142,
      prepTime: '20 min',
      image: '/images/poulet_braise_1790196218496.jpg',
      modelType: 'poulet_braise' as const,
      description: 'Poulet local fermier mariné 24h aux épices gboma et gingembre frais, grillé au feu de bois avec alloco doré et piment vert écrasé.',
      ingredients: ['Poulet bicyclette', 'Alloco bananes mûres', 'Piment vert maison', 'Oignons caramélisés'],
      isPopular: true,
    },
    {
      id: 'dish_amiwo',
      name: 'Amiwo Rouge au Wagashi & Poulet',
      category: 'signature',
      price: 3800,
      currency: 'FCFA',
      rating: 4.8,
      reviewsCount: 98,
      prepTime: '15 min',
      image: '/images/wagashi_amiwo_1790196228866.jpg',
      modelType: 'igname_pile' as const,
      description: 'Pâte de maïs rouge parfumée au bouillon de poulet fermier, accompagnée de fromage Peulh Wagashi poêlé et sauce tomate pimentée.',
      ingredients: ['Farine de maïs fine', 'Fromage Peulh Wagashi', 'Coulis de tomates fraîches', 'Épices royales'],
      isPopular: true,
    },
    {
      id: 'dish_akara',
      name: 'Plateau Akara Croustillants & Sauces',
      category: 'street',
      price: 2200,
      currency: 'FCFA',
      rating: 4.9,
      reviewsCount: 86,
      prepTime: '10 min',
      image: '/images/akara_streetfood_1790196240482.jpg',
      modelType: 'alloco' as const,
      description: 'Beignets de haricots blancs soufflés et ultra-croustillants, servis avec sauce piquante oignon-tomate et kluiklui concassé.',
      ingredients: ['Haricots blancs bio', 'Sauce dja maison', 'Échalotes dorées', 'Piment doux'],
      isPopular: false,
    },
    {
      id: 'dish_poisson',
      name: 'Capitaine Braisé à la Braise d’Atacora',
      category: 'signature',
      price: 5500,
      currency: 'FCFA',
      rating: 5.0,
      reviewsCount: 114,
      prepTime: '25 min',
      image: '/images/resto_ambiance_1790196207320.jpg',
      modelType: 'poisson_grille' as const,
      description: 'Poisson frais du jour pêché au large de Grand-Popo, assaisonné aux herbes sauvages avec igname frite et sauce moyo.',
      ingredients: ['Capitaine entier frais', 'Frites d’igname blanche', 'Sauce moyo citronnée', 'Condiments traditionnels'],
      isPopular: true,
    },
  ];

  const filteredDishes = dishesShowcase.filter((dish) => {
    if (activeSpecialtyTab === 'all') return true;
    return dish.category === activeSpecialtyTab;
  });

  const featuredRestaurants = [
    {
      name: 'Chez Mama Bénin',
      neighborhood: 'Cadjehoun, Cotonou',
      specialty: 'Cuisine traditionnelle béninoise & grillades',
      rating: 4.9,
      reviews: 320,
      status: 'Ouvert en continu',
      tables: 18,
      slug: 'chez-mama-benin',
      image: '/images/resto_ambiance_1790196207320.jpg',
      badge: 'Le plus populaire',
    },
    {
      name: 'Le Jardin Fidjrossè',
      neighborhood: 'Bord de Mer, Fidjrossè Plage',
      specialty: 'Fruits de mer, poissons grillés & cocktails',
      rating: 4.8,
      reviews: 215,
      status: 'Ouvert · Service terrasse',
      tables: 24,
      slug: 'le-jardin-fidjrosse',
      image: '/images/poulet_braise_1790196218496.jpg',
      badge: 'Vue Océan',
    },
    {
      name: 'Délice Cotonou & Lounge',
      neighborhood: 'Haie Vive, Cotonou',
      specialty: 'Fusion africaine, burgers gourmets & mocktails',
      rating: 4.7,
      reviews: 180,
      status: 'Ouvert jusqu’à 02h00',
      tables: 15,
      slug: 'delice-cotonou',
      image: '/images/wagashi_amiwo_1790196228866.jpg',
      badge: 'Ambiance lounge',
    },
  ];

  const faqItems = [
    {
      q: 'Comment fonctionne QResto concrètement pour mon établissement ?',
      a: 'Vous créez votre restaurant en 2 minutes. Vos QR codes personnalisés par table sont générés automatiquement. Vos clients scannent avec l’appareil photo de leur smartphone, consultent le menu interactif (avec visualisation 3D des plats), commandent sans installer d’application et peuvent régler directement par MTN MoMo, Moov Money ou à la livraison.',
    },
    {
      q: 'Les clients doivent-ils télécharger une application sur l’App Store ou Play Store ?',
      a: 'Absolument aucune installation ! C’est la force numéro 1 de QResto : 100% web instantané. Le scan ouvre immédiatement le menu fluide en moins de 1,5 seconde, même avec une connexion 3G/4G modeste.',
    },
    {
      q: 'Comment s’effectue la gestion des commandes en cuisine ?',
      a: 'Chaque commande passée depuis une table arrive instantanément sur votre tableau de bord restaurant (sur tablette, smartphone ou écran de cuisine) avec notification sonore, détails des articles, remarques spéciales et numéro de table.',
    },
    {
      q: 'Quels sont les modes de paiement pris en charge au Bénin ?',
      a: 'QResto supporte nativement MTN Mobile Money, Moov Money Bénin, le paiement en espèces (Cash à table) et les cartes bancaires internationales (Visa, Mastercard).',
    },
    {
      q: 'Puis-je modifier mes prix, ajouter des plats ou désactiver un plat épuisé ?',
      a: 'Oui, en temps réel depuis votre espace gérant. La mise à jour est immédiate pour tous les clients scannant les tables, sans jamais avoir besoin de réimprimer les chevalets QR.',
    },
  ];

  return (
    <div className="w-full bg-[#fbf9f5] text-stone-900 overflow-x-hidden">
      {/* 1. HERO SECTION WITH RICH GOURMET AESTHETICS & MOTION */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle radial warmth background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-250 h-150 bg-linear-to-b from-amber-200/40 via-orange-100/20 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto">
          {/* Main Hero Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Editorial Value Proposition & Action Triggers */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7 text-left flex flex-col items-start"
            >
              {/* Refined Pill-Free Region Label with Live Pulse Beacon */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-amber-200/80 shadow-xs mb-6 backdrop-blur-xs">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <span className="text-xs font-bold text-amber-900 tracking-wide">
                  La digitalisation des restaurants au Bénin & en Afrique
                </span>
              </div>

              {/* Title with Playfair Display & High Contrast Typography */}
              <h1 className="text-4xl sm:text-6xl xl:text-7xl font-black text-stone-950 tracking-tight leading-[1.08] mb-6 font-display">
                L’art culinaire d’Afrique,{' '}
                <span className="relative inline-block text-amber-600 italic">
                  sublimé
                  <svg
                    className="absolute -bottom-2 left-0 w-full text-amber-400/40 -z-10 h-3"
                    viewBox="0 0 100 20"
                    preserveAspectRatio="none"
                  >
                    <path d="M0,10 Q50,0 100,10" fill="none" stroke="currentColor" strokeWidth="8" />
                  </svg>
                </span>{' '}
                par le digital.
              </h1>

              {/* Subheading */}
              <p className="text-base sm:text-lg md:text-xl text-stone-600 leading-relaxed mb-8 max-w-2xl font-normal">
                Menus QR dynamiques par table, visualiseur 3D interactif et encaissement Mobile Money instantané sans friction pour les restaurants et leurs clients.
              </p>

              {/* Animated Button Row */}
              <div className="flex flex-wrap items-center gap-3.5 sm:gap-4 w-full sm:w-auto mb-10">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigateTo('restaurants')}
                  className="btn-primary w-full sm:w-auto"
                >
                  <Utensils className="w-4 h-4" />
                  <span>Explorer les restaurants</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </motion.button>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigateTo('register-restaurant')}
                  className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-stone-900 text-white font-bold text-sm shadow-lg hover:bg-stone-800 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Store className="w-4 h-4 text-amber-400" />
                  <span>Digitaliser mon restaurant</span>
                </motion.button>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigateTo('order-tracking')}
                  className="btn-secondary w-full sm:w-auto"
                >
                  <Clock className="w-4 h-4 text-stone-500" />
                  <span>Suivre commande</span>
                </motion.button>
              </div>

              {/* Key Trust Stats without AI Slop */}
              <div className="grid grid-cols-3 gap-6 pt-4 border-t border-stone-200/80 w-full max-w-xl">
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-stone-950 font-display">0s</div>
                  <div className="text-xs text-stone-500 font-medium mt-0.5">Téléchargement requis</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-amber-600 font-display">+32%</div>
                  <div className="text-xs text-stone-500 font-medium mt-0.5">Panier moyen constaté</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-stone-950 font-display">1.5s</div>
                  <div className="text-xs text-stone-500 font-medium mt-0.5">Vitesse d’affichage QR</div>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Live Interactive Dual Showcase (Interactive Phone & 3D Dish Live Demo) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5 relative"
            >
              {/* Ambient decoration ring */}
              <div className="absolute inset-0 bg-linear-to-tr from-amber-400/20 to-orange-500/10 rounded-[3rem] blur-2xl -z-10 transform rotate-2" />

              {/* Interactive Phone Mockup Card */}
              <div className="relative mx-auto max-w-85 sm:max-w-90 bg-white rounded-[2.5rem] p-4 shadow-2xl border-4 border-stone-900/90 shadow-amber-900/15">
                {/* Speaker pill notch */}
                <div className="w-24 h-4 bg-stone-900 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-stone-700/50" />
                </div>

                {/* Simulated Screen Content */}
                <div className="bg-[#fbf9f5] rounded-3xl p-4 border border-stone-200/80 overflow-hidden text-left">
                  {/* Restaurant Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-amber-500 text-stone-950 font-black text-sm flex items-center justify-center shadow-xs">
                        Q
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-stone-900 leading-tight">Chez Mama Bénin</h4>
                        <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>Table 04 · En service</span>
                        </div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-stone-900 text-white text-[10px] font-bold">
                      QR Direct
                    </span>
                  </div>

                  {/* Featured interactive dish inside simulator */}
                  <div className="mt-3.5 relative bg-white rounded-2xl p-3 border border-stone-200/90 shadow-sm group">
                    <div className="relative h-40 rounded-xl overflow-hidden mb-3 bg-stone-100">
                      <img
                        src="/images/poulet_braise_1790196218496.jpg"
                        alt="Poulet braisé"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-stone-950/80 backdrop-blur-xs text-white text-[10px] font-bold flex items-center gap-1">
                        <Flame className="w-3 h-3 text-amber-400" />
                        <span>Best-seller</span>
                      </div>
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-amber-500 text-stone-950 text-[10px] font-extrabold flex items-center gap-1 shadow-sm">
                        <Sparkles className="w-3 h-3" />
                        <span>3D Dispo</span>
                      </div>
                    </div>

                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h5 className="text-xs font-bold text-stone-900">Poulet Bicyclette Braisé</h5>
                        <p className="text-[11px] text-stone-500 line-clamp-1">Alloco doré, piment vert maison & oignons</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-black text-amber-600">4 500</div>
                        <div className="text-[9px] text-stone-400 font-bold">FCFA</div>
                      </div>
                    </div>

                    {/* Interactive Action inside phone */}
                    <div className="mt-3 pt-3 border-t border-stone-100 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setSelected3DDish({
                            id: 'dish_poulet',
                            name: 'Poulet Bicyclette Braisé Kpédji',
                            price: 4500,
                            description: 'Poulet fermier mariné 24h aux épices royales avec alloco croustillant.',
                            modelType: 'poulet_braise',
                            ingredients: ['Poulet bicyclette', 'Alloco bananes mûres', 'Piment vert maison'],
                            prepTime: '20 min',
                          })
                        }
                        className="flex-1 py-2 rounded-xl bg-amber-100/80 hover:bg-amber-100 text-amber-900 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <RotateCw className="w-3 h-3 text-amber-700 animate-spin" style={{ animationDuration: '6s' }} />
                        <span>Tourner en 3D 360°</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => navigateTo('restaurant-detail', { slug: 'chez-mama-benin', table: '4' })}
                        className="px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-[11px] transition-colors cursor-pointer"
                      >
                        Commander
                      </button>
                    </div>
                  </div>

                  {/* Payment Icons Footer in simulator */}
                  <div className="mt-3 bg-stone-100/80 rounded-xl p-2 flex items-center justify-between text-[10px] text-stone-600 font-medium">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>MoMo & Moov acceptés</span>
                    </span>
                    <span className="font-bold text-stone-800">100% Sécurisé</span>
                  </div>
                </div>
              </div>

              {/* Floating Animated Badges outside phone */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-4 -left-6 sm:-left-8 bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-xl border border-stone-200/90 text-left flex items-center gap-3 z-20"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/30">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900">Scan Instantané</div>
                  <div className="text-[11px] text-stone-500">Table assignée automatiquement</div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute -bottom-6 -right-4 sm:-right-6 bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-xl border border-stone-200/90 text-left flex items-center gap-3 z-20"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/30">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900">En cuisine en 2s</div>
                  <div className="text-[11px] text-emerald-700 font-semibold">0 attente serveur</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. PROCESSUS FLUIDE EN 4 ÉTAPES (Scroll Reveal) */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white border-y border-stone-200/80">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto mb-14"
          >
            <div className="text-xs uppercase font-extrabold tracking-widest text-amber-700 mb-2">
              Expérience Sans Friction
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-stone-950 font-display">
              Comment ça marche pour vos clients ?
            </h2>
            <p className="text-sm sm:text-base text-stone-500 mt-3 font-normal">
              De l’installation à table jusqu’au régal, tout se fait en 4 étapes simples et agréables.
            </p>
          </motion.div>

          {/* 4 Process Cards with motion hover */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Scan à table',
                desc: 'Le client pointe son smartphone sur le QR code fixé à sa table. Le menu s’ouvre sans installer aucune application.',
                icon: QrCode,
              },
              {
                step: '02',
                title: 'Visualisation 3D',
                desc: 'Il découvre vos plats avec photos haute résolution et inspecte les spécialités sous tous les angles en 3D 360°.',
                icon: RotateCw,
              },
              {
                step: '03',
                title: 'Commande immédiate',
                desc: 'Le client personnalise ses cuissons ou accompagnements et valide son panier. La commande est transmise en cuisine.',
                icon: Utensils,
              },
              {
                step: '04',
                title: 'Paiement sans attente',
                desc: 'Règlement en un clic par MTN MoMo, Moov Money, Carte ou en espèces auprès du serveur.',
                icon: ShieldCheck,
              },
            ].map((item, index) => {
              const IconComp = item.icon;
              return (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -6, scale: 1.01 }}
                  className="bg-[#fbf9f5] rounded-3xl p-6 border border-stone-200/90 text-left relative flex flex-col justify-between transition-shadow hover:shadow-xl hover:shadow-stone-200/50"
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
                        <IconComp className="w-6 h-6" />
                      </div>
                      <span className="text-2xl font-black text-stone-300 font-display">{item.step}</span>
                    </div>
                    <h3 className="text-lg font-bold text-stone-900 mb-2">{item.title}</h3>
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">{item.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. GALERIE INTERACTIVE DE SPÉCIALITÉS & VISUALISATION 3D 360° */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12"
          >
            <div>
              <div className="text-xs uppercase font-extrabold tracking-widest text-amber-700 mb-2">
                Innovation Gastronomique
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-stone-950 font-display">
                Plats signatures & immersion 3D
              </h2>
              <p className="text-sm sm:text-base text-stone-500 mt-2 font-normal">
                Permettez à vos convives de voir exactement ce qu’ils vont déguster avant de commander.
              </p>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-1.5 p-1 bg-stone-200/60 rounded-2xl self-start md:self-auto">
              {[
                { id: 'all', label: 'Toutes les spécialités' },
                { id: 'signature', label: 'Plats signatures' },
                { id: 'street', label: 'Street food' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveSpecialtyTab(tab.id as any)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    activeSpecialtyTab === tab.id
                      ? 'bg-white text-stone-950 shadow-sm'
                      : 'text-stone-600 hover:text-stone-950'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Dishes Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredDishes.map((dish, idx) => (
              <motion.div
                key={dish.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -6 }}
                className="bg-white rounded-3xl overflow-hidden border border-stone-200/90 shadow-xs hover:shadow-xl hover:shadow-stone-200/60 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-48 overflow-hidden bg-stone-100">
                    <img
                      src={dish.image}
                      alt={dish.name}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-stone-900/80 backdrop-blur-xs text-white text-[10px] font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>{dish.prepTime}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelected3DDish(dish)}
                      className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-extrabold shadow-md flex items-center gap-1.5 cursor-pointer hover:scale-105 transition-all"
                    >
                      <RotateCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '8s' }} />
                      <span>Voir en 3D</span>
                    </button>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
                        Bénin Gourmand
                      </span>
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{dish.rating}</span>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-stone-900 leading-snug mb-2 group-hover:text-amber-700 transition-colors">
                      {dish.name}
                    </h3>
                    <p className="text-xs text-stone-500 leading-relaxed line-clamp-2 mb-4 font-normal">
                      {dish.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {dish.ingredients.slice(0, 2).map((ing) => (
                        <span key={ing} className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 text-[10px] font-medium">
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-stone-100 mt-2 flex items-center justify-between">
                  <div>
                    <span className="text-base font-black text-stone-950 font-display">
                      {dish.price.toLocaleString('fr-FR')}
                    </span>
                    <span className="text-[10px] font-bold text-stone-500 ml-1">FCFA</span>
                  </div>

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigateTo('restaurant-detail', { slug: 'chez-mama-benin', table: '4' })}
                    className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    Commander
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. SIMULATEUR INTERACTIF DE QR CODE EN DIRECT POUR RESTAURATEURS */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-stone-900 text-white relative overflow-hidden">
        {/* Subtle decorative grid background */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Interactive QR Controls */}
            <div className="lg:col-span-7 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold mb-4">
                <QrCode className="w-3.5 h-3.5" />
                <span>Simulateur en direct</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight mb-4 font-display">
                Personnalisez vos QR codes de tables en quelques clics
              </h2>

              <p className="text-stone-300 text-sm sm:text-base leading-relaxed mb-8 max-w-xl font-normal">
                Chaque table dispose de son propre QR code sécurisé. Le client scanne, le numéro de table est automatiquement injecté et la commande part directement au bon endroit.
              </p>

              {/* Live Playground Controls */}
              <div className="bg-stone-800/80 backdrop-blur-md rounded-3xl p-6 border border-stone-700/80 space-y-5 max-w-xl">
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-2">
                    Nom de votre restaurant
                  </label>
                  <input
                    type="text"
                    value={demoRestoName}
                    onChange={(e) => setDemoRestoName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-stone-900 text-white rounded-xl border border-stone-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-sm outline-hidden font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-2">
                    Numéro de table : <span className="text-amber-400 font-extrabold text-sm">Table #{demoTable}</span>
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 4, 8, 12, 16].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setDemoTable(num)}
                        className={`w-10 h-10 rounded-xl font-black text-xs transition-all cursor-pointer ${
                          demoTable === num
                            ? 'bg-amber-500 text-stone-950 scale-105 shadow-md shadow-amber-500/30'
                            : 'bg-stone-900 text-stone-400 hover:text-white hover:bg-stone-700'
                        }`}
                      >
                        #{num}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() =>
                      navigateTo('restaurant-detail', {
                        slug: 'chez-mama-benin',
                        table: demoTable.toString(),
                      })
                    }
                    className="px-5 py-3 rounded-xl bg-linear-to-r from-amber-500 to-orange-500 text-stone-950 font-black text-xs shadow-lg hover:shadow-amber-500/30 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Tester le scan de la Table #{demoTable}</span>
                  </motion.button>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-3 rounded-xl bg-stone-900 hover:bg-stone-700 text-stone-300 hover:text-white font-bold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Imprimer simulation</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: High-Res Chevalet QR Card Preview */}
            <div className="lg:col-span-5 flex justify-center">
              <motion.div
                key={demoTable}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-sm bg-white rounded-3xl p-6 text-stone-900 shadow-2xl border-4 border-amber-500/40 text-center relative"
              >
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-stone-950 font-black text-lg mx-auto flex items-center justify-center mb-3">
                  Q
                </div>
                <h4 className="text-base font-extrabold text-stone-950 leading-tight">
                  {demoRestoName || 'Mon Restaurant'}
                </h4>
                <p className="text-[11px] text-stone-500 mt-0.5">Scannez pour commander sans attente</p>

                {/* QR Code Container */}
                <div className="my-5 p-4 bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200 inline-block shadow-inner">
                  {/* Generated QR representation */}
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                      `https://qresto.africa/#menu-chez-mama-benin?table=${demoTable}`
                    )}&color=1c1917`}
                    alt="QR Code Table"
                    className="w-40 h-40 mx-auto rounded-lg"
                  />
                </div>

                {/* Table Badge */}
                <div className="inline-block px-4 py-1.5 rounded-full bg-stone-900 text-white font-black text-xs uppercase tracking-wider mb-2">
                  Table #{demoTable}
                </div>

                <div className="text-[10px] text-stone-400 font-medium">
                  Compatible iPhone & Android · 100% sans application
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. RESTAURANTS PARTENAIRES PHARES (Scroll Reveal) */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12"
          >
            <div>
              <div className="text-xs uppercase font-extrabold tracking-widest text-amber-700 mb-2">
                Établissements Certifiés
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-stone-950 font-display">
                Restaurants digitalisés à Cotonou
              </h2>
              <p className="text-sm sm:text-base text-stone-500 mt-2 font-normal">
                Découvrez comment les meilleurs chefs et gérants modernisent leur service en salle.
              </p>
            </div>

            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigateTo('restaurants')}
              className="px-5 py-2.5 rounded-xl border border-stone-200 hover:border-stone-900 text-stone-800 font-bold text-xs flex items-center gap-2 self-start md:self-auto transition-colors cursor-pointer"
            >
              <span>Voir tous les restaurants</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredRestaurants.map((resto, i) => (
              <motion.div
                key={resto.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                whileHover={{ y: -6 }}
                className="bg-[#fbf9f5] rounded-3xl overflow-hidden border border-stone-200/90 shadow-xs hover:shadow-xl transition-all flex flex-col justify-between group cursor-pointer"
                onClick={() => navigateTo('restaurant-detail', { slug: resto.slug })}
              >
                <div>
                  <div className="relative h-52 overflow-hidden bg-stone-100">
                    <img
                      src={resto.image}
                      alt={resto.name}
                      className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-stone-900/80 backdrop-blur-xs text-white text-[10px] font-bold">
                      {resto.badge}
                    </div>
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-1 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      <span>{resto.status}</span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-stone-500">{resto.neighborhood}</span>
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{resto.rating}</span>
                        <span className="text-stone-400 font-normal">({resto.reviews})</span>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-stone-950 mb-2 group-hover:text-amber-700 transition-colors font-display">
                      {resto.name}
                    </h3>
                    <p className="text-xs text-stone-600 leading-relaxed font-normal mb-4">
                      {resto.specialty}
                    </p>

                    <div className="flex items-center gap-2 text-xs font-medium text-stone-500">
                      <QrCode className="w-3.5 h-3.5 text-amber-600" />
                      <span>{resto.tables} tables équipées en QR dynamique</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-stone-200/60 mt-3 flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-700 group-hover:text-stone-950">
                    Consulter la carte
                  </span>
                  <div className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center group-hover:bg-amber-600 transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CALCULATEUR DE TARIFS SANS SURPRISE (Scroll Reveal) */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#fbf9f5]">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto mb-12"
          >
            <div className="text-xs uppercase font-extrabold tracking-widest text-amber-700 mb-2">
              Tarification Transparente
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-stone-950 font-display">
              Un investissement rentabilisé dès le 1er jour
            </h2>
            <p className="text-sm sm:text-base text-stone-500 mt-2 font-normal">
              Commencez gratuitement, puis choisissez la formule adaptée à votre rythme sans engagement.
            </p>

            {/* Monthly / Yearly Toggle */}
            <div className="mt-6 inline-flex items-center p-1 bg-stone-200/80 rounded-2xl">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-5 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-stone-950 shadow-sm'
                    : 'text-stone-600 hover:text-stone-950'
                }`}
              >
                Paiement Mensuel
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('yearly')}
                className={`px-5 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  billingCycle === 'yearly'
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-950'
                }`}
              >
                <span>Annuel</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-500 text-stone-950 font-black">
                  -20%
                </span>
              </button>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left items-stretch">
            {/* Plan 1: Starter */}
            <motion.div
              whileHover={{ y: -6 }}
              className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Starter</span>
                <div className="mt-3 mb-6">
                  <span className="text-4xl font-black text-stone-950 font-display">0</span>
                  <span className="text-sm font-bold text-stone-500 ml-1">FCFA / mois</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed mb-6 font-normal">
                  Idéal pour tester la digitalisation de votre carte sur quelques tables.
                </p>
                <div className="space-y-3 border-t border-stone-100 pt-6">
                  {['Jusqu’à 5 tables QR', 'Menu digital complet', 'Support standard par email', 'Pas de commission cachée'].map(
                    (feat) => (
                      <div key={feat} className="flex items-center gap-2.5 text-xs text-stone-700">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    )
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigateTo('register-restaurant')}
                className="mt-8 w-full py-3 rounded-xl border border-stone-300 hover:border-stone-900 text-stone-900 font-bold text-xs transition-colors cursor-pointer"
              >
                Démarrer gratuitement
              </button>
            </motion.div>

            {/* Plan 2: Pro (Highlight) */}
            <motion.div
              whileHover={{ y: -6 }}
              className="bg-stone-950 text-white rounded-3xl p-8 border-2 border-amber-500 shadow-2xl relative flex flex-col justify-between"
            >
              <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-linear-to-r from-amber-500 to-orange-500 text-stone-950 text-[10px] font-black uppercase tracking-wider shadow-md">
                Recommandé
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Pro Restaurant</span>
                <div className="mt-3 mb-6">
                  <span className="text-4xl font-black text-white font-display">
                    {billingCycle === 'monthly' ? '5 000' : '4 000'}
                  </span>
                  <span className="text-sm font-bold text-stone-400 ml-1">FCFA / mois</span>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed mb-6 font-normal">
                  Pour les restaurants en activité voulant maximiser le chiffre d’affaires et la rotation des tables.
                </p>
                <div className="space-y-3 border-t border-stone-800 pt-6">
                  {[
                    'Tables illimitées avec QR dynamique',
                    'Intégration Mobile Money (MTN & Moov)',
                    'Visualiseur 3D interactif des plats',
                    'Dashboard gérant avec KPIs en direct',
                    'Impression chevalets haute définition',
                  ].map((feat) => (
                    <div key={feat} className="flex items-center gap-2.5 text-xs text-stone-200">
                      <Check className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigateTo('register-restaurant')}
                className="mt-8 w-full py-3.5 rounded-xl bg-linear-to-r from-amber-500 to-orange-500 text-stone-950 font-black text-xs shadow-lg hover:shadow-amber-500/30 transition-all cursor-pointer"
              >
                Choisir la formule Pro
              </motion.button>
            </motion.div>

            {/* Plan 3: Business */}
            <motion.div
              whileHover={{ y: -6 }}
              className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Business & Chaînes</span>
                <div className="mt-3 mb-6">
                  <span className="text-4xl font-black text-stone-950 font-display">
                    {billingCycle === 'monthly' ? '8 000' : '6 500'}
                  </span>
                  <span className="text-sm font-bold text-stone-500 ml-1">FCFA / mois</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed mb-6 font-normal">
                  Pour les hôtels, maquis réputés et enseignes multi-établissements.
                </p>
                <div className="space-y-3 border-t border-stone-100 pt-6">
                  {[
                    'Multi-restaurants & succursales',
                    'Export comptable & analytics avancés',
                    'Modélisation 3D sur-mesure de vos plats',
                    'Accompagnement et support VIP 7j/7',
                  ].map((feat) => (
                    <div key={feat} className="flex items-center gap-2.5 text-xs text-stone-700">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigateTo('register-restaurant')}
                className="mt-8 w-full py-3 rounded-xl border border-stone-300 hover:border-stone-900 text-stone-900 font-bold text-xs transition-colors cursor-pointer"
              >
                Contacter pour Business
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 7. FAQ AVEC ANIMATION ACCORDÉON (Scroll Reveal) */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-white border-t border-stone-200/80">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <div className="text-xs uppercase font-extrabold tracking-widest text-amber-700 mb-2">
              Questions Fréquentes
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-stone-950 font-display">
              Tout ce que vous devez savoir
            </h2>
          </motion.div>

          <div className="space-y-3">
            {faqItems.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={item.q}
                  className="bg-[#fbf9f5] rounded-2xl border border-stone-200/90 overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 font-bold text-stone-900 text-sm sm:text-base cursor-pointer"
                  >
                    <span>{item.q}</span>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="shrink-0"
                    >
                      <ChevronDown className="w-5 h-5 text-stone-500" />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                      >
                        <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-stone-600 leading-relaxed border-t border-stone-200/60 font-normal">
                          {item.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. BANNIÈRE CTA FINALE */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-linear-to-tr from-stone-950 via-stone-900 to-amber-950 text-white relative overflow-hidden text-center">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl mx-auto relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-5xl font-black mb-6 font-display tracking-tight leading-tight"
          >
            Prêt à transformer l’expérience de votre restaurant ?
          </motion.h2>

          <p className="text-stone-300 text-sm sm:text-base leading-relaxed mb-8 max-w-xl mx-auto font-normal">
            Rejoignez les dizaines d’établissements qui modernisent la restauration en Afrique avec QResto.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <motion.button
              type="button"
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigateTo('register-restaurant')}
              className="px-8 py-4 rounded-2xl bg-linear-to-r from-amber-500 via-orange-500 to-amber-500 text-stone-950 font-black text-sm shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Store className="w-4 h-4" />
              <span>Créer mon restaurant gratuitement</span>
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigateTo('restaurants')}
              className="px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <Utensils className="w-4 h-4 text-amber-400" />
              <span>Voir les restaurants partenaires</span>
            </motion.button>
          </div>
        </div>
      </section>

      {/* 9. MODAL INTERACTIF DE VISUALISATION 3D 360° */}
      <AnimatePresence>
        {selected3DDish && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative border border-stone-200 text-left overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setSelected3DDish(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold flex items-center gap-1">
                  <RotateCw className="w-3 h-3 text-amber-700 animate-spin" />
                  <span>Visualiseur 3D Interactif</span>
                </span>
                <span className="text-xs text-stone-400 font-medium">Glissez la souris ou touchez pour pivoter</span>
              </div>

              <h3 className="text-2xl font-black text-stone-900 font-display mb-1">{selected3DDish.name}</h3>
              <p className="text-xs text-stone-500 mb-4">{selected3DDish.description}</p>

              {/* Canvas 3D Viewer inside modal */}
              <div className="relative rounded-2xl overflow-hidden border border-stone-200 bg-stone-950 mb-6">
                <Dish3DViewer modelType={selected3DDish.modelType} dishName={selected3DDish.name} />
              </div>

              {/* Bottom modal actions */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-stone-100">
                <div>
                  <div className="text-xl font-black text-stone-900 font-display">
                    {selected3DDish.price.toLocaleString('fr-FR')} FCFA
                  </div>
                  <div className="text-[11px] text-stone-400">Préparé à la minute · Ingrédients frais</div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSelected3DDish(null)}
                    className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-700 font-bold text-xs hover:bg-stone-50 transition-colors"
                  >
                    Fermer
                  </button>

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      setSelected3DDish(null);
                      navigateTo('restaurant-detail', { slug: 'chez-mama-benin', table: '4' });
                    }}
                    className="px-6 py-2.5 rounded-xl bg-linear-to-r from-amber-600 to-orange-500 text-white font-bold text-xs shadow-md shadow-amber-600/30 transition-all cursor-pointer"
                  >
                    Commander ce plat
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
