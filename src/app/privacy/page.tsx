'use client';

import React from 'react';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { Toast } from '@/components/common/Toast';
import { PrivacyPage } from '@/components/pages/StaticPages';

export default function PrivacyRoute() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <PrivacyPage />
      </main>
      <Footer />
      <Toast />
    </div>
  );
}
