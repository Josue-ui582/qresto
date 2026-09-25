'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Search,
  X,
  MapPin,
  Star,
  Clock,
  QrCode,
  ArrowRight,
  Utensils,
  Loader2,
} from 'lucide-react';
import { useNavigation } from '@/context/NavigationContext';
import Link from 'next/link';
import { Badge, Button, Card, Heading } from '@/components/ui';
import { Restaurant } from '@/types';

export const RestaurantsPage: React.FC = () => {
  const { navigateTo } = useNavigation();
  
  // États pour les données API
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // États pour la recherche et le filtrage
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyOpen, setOnlyOpen] = useState(false);

  // 1. Récupération des restaurants depuis la base de données
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('/api/restaurants');

        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des établissements.');
        }

        const data = await response.json();
        setRestaurants(data.restaurants || []);
      } catch (err) {
        console.error('Erreur chargement restaurants:', err);
        setError('Impossible de charger la liste des restaurants pour le moment.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  // 2. Filtrage mémorisé
  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((r) => {
      const matchSearch =
        !searchTerm.trim() ||
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.description && r.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (r.category && r.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (r.city && r.city.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchCity =
        selectedCity === 'all' || (r.city && r.city.toLowerCase() === selectedCity.toLowerCase());
      const matchCategory =
        selectedCategory === 'all' || (r.category && r.category.includes(selectedCategory));
      const matchOpen = !onlyOpen || r.isOpen;

      return matchSearch && matchCity && matchCategory && matchOpen;
    });
  }, [restaurants, searchTerm, selectedCity, selectedCategory, onlyOpen]);

  return (
    <div className="min-h-screen bg-background py-10 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-10 text-left"
      >
        <Badge className="mb-3">Annuaire Gastronomique & Menus QR</Badge>
        <Heading as="h1" size="lg" className="mb-3">
          Restaurants & Menus Digitaux au Bénin
        </Heading>
        <p className="text-text-muted text-sm sm:text-base max-w-2xl font-normal leading-relaxed">
          Commandez vos plats favoris directement à table via QR code ou en livraison, sans avoir à créer de compte ou télécharger d’application.
        </p>
      </motion.div>

      {/* Barre de recherche et filtres */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="card p-5 sm:p-7 mb-12 space-y-5"
      >
        {/* Input de recherche */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
            <Search className="w-4 h-4 text-stone-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un restaurant, igname pilée, poulet bicyclette, amiwo, capitaine..."
            className="w-full pl-11 pr-10 py-3.5 bg-stone-50/80 border border-stone-200 rounded-2xl text-stone-900 placeholder-stone-400 text-sm focus:outline-hidden focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-medium"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-stone-400 hover:text-stone-700 text-xs cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Ligne des contrôles de filtres */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-1 border-t border-stone-100">
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-stone-100 rounded-2xl">
            {[
              { id: 'all', label: 'Toutes les villes' },
              { id: 'cotonou', label: 'Cotonou' },
              { id: 'porto-novo', label: 'Porto-Novo' },
              { id: 'abomey-calavi', label: 'Abomey-Calavi' },
            ].map((city) => (
              <button
                key={city.id}
                type="button"
                onClick={() => setSelectedCity(city.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCity === city.id
                    ? 'bg-white text-stone-950 shadow-xs'
                    : 'text-stone-600 hover:text-stone-950'
                }`}
              >
                {city.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setOnlyOpen(!onlyOpen)}
            className={`px-4 py-2 rounded-xl text-xs font-bold border flex items-center gap-2 transition-all cursor-pointer ${
              onlyOpen
                ? 'bg-accent text-white border-accent shadow-xs'
                : 'bg-surface-alt border-soft text-text hover:bg-white'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${onlyOpen ? 'bg-white' : 'bg-emerald-500'}`}
            />
            <span>Ouverts actuellement</span>
          </button>
        </div>
      </motion.div>

      {/* État de chargement */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-4" />
          <p className="text-sm font-medium text-stone-600">Chargement des établissements...</p>
        </div>
      ) : error ? (
        /* État d'erreur */
        <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center max-w-lg mx-auto">
          <p className="text-sm font-semibold text-red-700 mb-4">{error}</p>
          <Button variant="dark" size="sm" onClick={() => window.location.reload()}>
            Réessayer
          </Button>
        </div>
      ) : (
        <>
          {/* Nombre de résultats */}
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              {filteredRestaurants.length} établissement{filteredRestaurants.length > 1 ? 's' : ''} trouvé{filteredRestaurants.length > 1 ? 's' : ''}
            </span>
          </div>

          {/* Grille des restaurants */}
          {filteredRestaurants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredRestaurants.map((resto) => (
                <Link key={resto.id} href={`/restaurant/${resto.slug}`} className="overflow-hidden flex flex-col justify-between group cursor-pointer">
                  <Card as="article" className="overflow-hidden flex flex-col justify-between group h-full">
                    <div>
                      {/* Image Banner */}
                      <div className="relative h-52 overflow-hidden bg-stone-100">
                        <img
                          src={resto.coverImage || resto.logo || '/images/resto_ambiance_1790196207320.jpg'}
                          alt={resto.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />

                        {/* Badge statut */}
                        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-stone-950/85 backdrop-blur-xs text-white text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              resto.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
                            }`}
                          />
                          <span>{resto.isOpen ? 'Ouvert' : 'Fermé'}</span>
                        </div>

                        {/* Tag Ville */}
                        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-xs text-stone-900 text-[10px] font-bold flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-amber-600" />
                          <span>{resto.city}</span>
                        </div>
                      </div>

                      {/* Détails */}
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-amber-800">
                            {resto.cuisineType || resto.category || 'Cuisine Africaine'}
                          </span>
                          <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>{resto.rating || '4.8'}</span>
                            <span className="text-stone-400 font-normal">({resto.reviewCount || 0})</span>
                          </div>
                        </div>

                        <h3 className="text-xl font-bold text-stone-950 mb-2 group-hover:text-amber-700 transition-colors font-display">
                          {resto.name}
                        </h3>

                        <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed mb-5 font-normal">
                          {resto.description || 'Découvrez notre menu digital complet et passez vos commandes en ligne.'}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 pt-3 border-t border-stone-100">
                          <span className="flex items-center gap-1">
                            <QrCode className="w-3.5 h-3.5 text-amber-600" />
                            <span>Menu QR à table</span>
                          </span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-stone-400" />
                            <span>{resto.openingHours || '11h - 23h'}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer de la carte */}
                    <div className="p-6 pt-0 mt-2 flex items-center justify-between border-t border-stone-100">
                      <span className="text-xs font-bold text-stone-700 group-hover:text-stone-950">
                        Accéder à la carte
                      </span>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="w-9 h-9 rounded-xl bg-stone-900 text-white flex items-center justify-center group-hover:bg-amber-600 transition-colors shadow-xs"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </motion.div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 max-w-lg mx-auto">
              <Utensils className="w-12 h-12 text-stone-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-stone-900 mb-1">Aucun restaurant trouvé</h3>
              <p className="text-xs text-stone-500 mb-6">
                Essayez de modifier vos filtres ou effectuez une recherche différente.
              </p>
              <Button
                variant="dark"
                size="md"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCity('all');
                  setSelectedCategory('all');
                  setOnlyOpen(false);
                }}
              >
                Réinitialiser les filtres
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
