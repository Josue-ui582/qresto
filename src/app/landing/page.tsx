'use client';

import React from 'react';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { Toast } from '@/components/common/Toast';
import { LandingPage } from '@/components/pages/LandingPage';

export default function LandingRoute() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-stone-50 text-stone-900 selection:bg-amber-500 selection:text-white">
      <Navbar />
      <main className="flex-1">
        <LandingPage />
      </main>
      <Footer />
      <Toast />
    </div>
  );
}
