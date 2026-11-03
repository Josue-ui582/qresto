'use client';

import React from 'react';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { Toast } from '@/components/common/Toast';
import { ContactPage } from '@/components/pages/StaticPages';

export default function ContactRoute() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <ContactPage />
      </main>
      <Footer />
      <Toast />
    </div>
  );
}
