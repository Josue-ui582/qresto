import type { Metadata, Viewport } from 'next';
import './globals.css';
// Importez votre nouveau composant AppProviders (ajustez le chemin selon votre structure)
import { AppProviders } from '@/context/AppProviders'; 

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
    <html lang="fr" className="scroll-smooth">
      <body className="bg-background text-text antialiased">
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
