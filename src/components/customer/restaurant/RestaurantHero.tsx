import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Share2, Star, MapPin, Phone } from 'lucide-react';
import { Restaurant } from '@/types';

interface RestaurantHeroProps {
  restaurant: Restaurant;
  onBack: () => void;
  onShareMenu: () => void;
  onContactRestaurant: () => void;
}

export const RestaurantHero: React.FC<RestaurantHeroProps> = ({
  restaurant,
  onBack,
  onShareMenu,
  onContactRestaurant,
}) => {
  return (
    <div className="relative h-64 sm:h-80 md:h-96 w-full bg-ink-950 overflow-hidden">
      <img
        src={restaurant.coverImage || '/images/resto_ambiance_1790196207320.jpg'}
        alt={restaurant.name}
        className="w-full h-full object-cover opacity-75"
      />
      <div className="absolute inset-0 bg-linear-to-t from-ink-950 via-ink-950/50 to-transparent" />

      <div className="absolute top-4 left-4 z-10">
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-ink-black/60 hover:bg-ink-black/80 backdrop-blur-md text-paper-white text-xs font-semibold transition-all border border-paper-white/15 shadow-md cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Tous les restaurants</span>
        </motion.button>
      </div>

      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onContactRestaurant}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-positive-600 hover:bg-positive-700 text-paper-white text-xs font-bold shadow-lg transition-all cursor-pointer"
          title="Contacter le restaurant sur WhatsApp"
        >
          <Phone className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Contacter le restaurant</span>
        </motion.button>

        <button
          type="button"
          onClick={onShareMenu}
          className="p-2.5 rounded-full bg-ink-black/60 hover:bg-ink-black/80 backdrop-blur-md text-paper-white text-xs font-bold border border-paper-white/15 transition-all cursor-pointer"
          title="Copier le lien"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      <div className="absolute bottom-6 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={restaurant.logo || '/images/resto_ambiance_1790196207320.jpg'}
            alt={restaurant.name}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-paper-white shadow-2xl bg-paper-white shrink-0"
          />
          <div className="text-paper-white text-left">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
                {restaurant.name}
              </h1>
              <span className={`px-2 py-0.5 rounded-md text-paper-white text-[0.625rem] font-bold ${
                restaurant.isOpen ? 'bg-positive-500' : 'bg-ink-600'
              }`}>
                ● {restaurant.isOpen ? 'Ouvert' : 'Fermé'}
              </span>
            </div>
            <p className="text-brand-300 text-xs sm:text-sm font-semibold mb-1">
              {restaurant.category} · {restaurant.cuisineType || 'Spécialités Africaines'}
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-ink-300">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-brand-400" />
                <span>{restaurant.address}, {restaurant.city}</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-brand-400" />
                <span>{restaurant.phone}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1.5 bg-ink-black/50 backdrop-blur-md p-3.5 rounded-2xl border border-paper-white/10 text-paper-white shrink-0 text-left sm:text-right">
          <div className="flex items-center gap-1.5 text-sm font-bold text-brand-400">
            <Star className="w-4 h-4 fill-brand-400" />
            {restaurant.reviewCount > 0 ? (
              <>
                <span>{restaurant.rating.toFixed(1)}</span>
                <span className="text-xs text-ink-300 font-normal">
                  ({restaurant.reviewCount} avis)
                </span>
              </>
            ) : (
              <span className="text-xs text-ink-300 font-normal">Pas encore d’avis</span>
            )}
          </div>
          <div className="text-xs text-ink-300 font-medium">
            Frais livraison : <strong className="text-paper-white">{restaurant.deliveryFee.toLocaleString()} {restaurant.currency}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
