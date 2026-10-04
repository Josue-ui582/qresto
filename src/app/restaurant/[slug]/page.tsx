'use client';

import React from 'react';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { Toast } from '@/components/common/Toast';
import { RestaurantDetailPage } from '@/components/customer/restaurant/RestaurantDetailPage';

export default function RestaurantDetailRoute() {
  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
      <Navbar />
      <main className="flex-1">
        <RestaurantDetailPage />
      </main>
      <Footer />
      <Toast />
    </div>
  );
}
