'use client';

import React, { Suspense } from 'react';
import { CartPage } from '@/components/customer/cart/CartPage';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { Toast } from '@/components/common/Toast';

export default function CartRoute() {
  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={null}>
          <CartPage />
        </Suspense>
      </main>
      <Footer />
      <Toast />
    </div>
  );
}
