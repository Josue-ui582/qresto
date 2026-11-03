'use client';

import React from 'react';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { Toast } from '@/components/common/Toast';
import { LandingPage } from '@/components/pages/LandingPage/LandingPage';

export default function LandingRoute() {
  return (
    <div
      className="min-h-screen flex flex-col bg-ink-50 text-ink-900 selection:bg-brand-500 selection:text-paper-white"
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
