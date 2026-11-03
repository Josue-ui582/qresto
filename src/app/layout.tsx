import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

import { AppProviders } from '@/context/AppProviders'; 

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'QResto - Digitalisation Restaurants & Menus QR Afrique',
  description:
    'Plateforme SaaS complète pour les restaurants au Bénin et en Afrique : menus digitaux QR interactifs, commandes sans inscription, suivi en temps réel, dashboard multi-tenant sécurisé.',
  openGraph: {
    title: 'QResto - Digitalisation Restaurants & Menus QR Afrique',
    description:
      'Plateforme SaaS complète pour les restaurants au Bénin et en Afrique : menus digitaux QR interactifs, commandes sans inscription, suivi en temps réel, dashboard multi-tenant sécurisé.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QResto - Digitalisation Restaurants & Menus QR Afrique',
    description:
      'Plateforme SaaS complète pour les restaurants au Bénin et en Afrique : menus digitaux QR interactifs, commandes sans inscription, suivi en temps réel, dashboard multi-tenant sécurisé.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#d97706',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${plusJakartaSans.variable} scroll-smooth`}>
      <body className="bg-background text-text antialiased">
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
