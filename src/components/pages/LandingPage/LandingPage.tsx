'use client';

import { Dish3DSelection } from '@/types';
import React, { useState } from 'react';
import { HeroSection } from './HeroSection';
import { ProcessSteps } from './ProcessSteps';
import { DishesShowcase } from './DishesShowCase';
import { QRSimulator } from './QrSimilator';
import { FeaturedRestaurants } from './FeaturedRestaurant';
import { PricingSection } from './PricingSection';
import { FAQSection } from './FaqSection';
import { FinalCTA } from './FinalCta';
import { Dish3DModal } from './Dish3dModal';

export const LandingPage: React.FC = () => {
  // The only piece of state shared across sections: which dish is
  // currently open in the 3D viewer modal. Hero and DishesShowcase both
  // set it; the modal reads and clears it. Everything else (tabs, the
  // QR demo inputs, billing toggle, FAQ accordion) is local to its own
  // section now that each section owns its slice of UI.
  const [selected3DDish, setSelected3DDish] = useState<Dish3DSelection | null>(null);

  return (
    <div className="w-full bg-[#fbf9f5] text-stone-900 overflow-x-hidden">
      <HeroSection onSelectDish={setSelected3DDish} />
      <ProcessSteps />
      <DishesShowcase onSelectDish={setSelected3DDish} />
      <QRSimulator />
      <FeaturedRestaurants />
      <PricingSection />
      <FAQSection />
      <FinalCTA />
      <Dish3DModal dish={selected3DDish} onClose={() => setSelected3DDish(null)} />
    </div>
  );
};
