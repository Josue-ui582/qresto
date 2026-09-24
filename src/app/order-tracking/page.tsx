'use client';

import React from 'react';
import { OrderTrackingPage } from '@/components/customer/order/OrderTrackingPage';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { Toast } from '@/components/common/Toast';

export default function OrderTrackingRoute() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <OrderTrackingPage />
      </main>
      <Footer />
      <Toast />
    </div>
  );
}
