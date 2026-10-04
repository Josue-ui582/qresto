'use client';

import React, { useEffect } from 'react';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { Toast } from '@/components/common/Toast';
import { LandingPage } from '@/components/pages/LandingPage/LandingPage';

export default function HomePage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col bg-stone-50 text-stone-900 selection:bg-amber-500 selection:text-white"
      style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
    >
      <Navbar />
      <main className="flex-1">
        <LandingPage />
      </main>
      <Footer />
      <Toast />
    </div>
  );
}
