'use client';

import React from 'react';
import { RestaurantsPage } from '@/components/customer/restaurant/RestaurantsPage';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { Toast } from '@/components/common/Toast';

export default function RestaurantsRoute() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <RestaurantsPage />
      </main>
      <Footer />
      <Toast />
    </div>
  );
}
