'use client';

import React from 'react';
import { OrderTrackingPage } from '@/components/customer/order/OrderTrackingPage';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { Toast } from '@/components/common/Toast';
import { Suspense } from 'react';

export default function OrderTrackingRoute() {
  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={null}>
          <OrderTrackingPage />
        </Suspense>
      </main>
      <Footer />
      <Toast />
    </div>
  );
}
