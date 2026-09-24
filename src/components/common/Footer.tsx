'use client';

import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {

  return (
    <footer className="bg-surface border-t border-soft pt-16 pb-12 text-text-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12">
          {/* Brand Col - EXACT as Screenshot 8 */}
          <div className="space-y-3">
            <Link href="/" className="inline-block group cursor-pointer">
              <span className="text-2xl font-black tracking-tight text-text">
                Q<span className="text-brand">Resto</span>
              </span>
            </Link>
            <p className="text-sm text-muted max-w-xs leading-relaxed">
              La digitalisation des restaurants en Afrique, simplement.
            </p>
          </div>

          {/* Plateforme Col - EXACT as Screenshot 8 */}
          <div>
            <h4 className="text-sm font-bold text-text mb-4">Plateforme</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/restaurants" className="text-stone-600 hover:text-stone-900 transition-colors">
                  Restaurants
                </Link>
              </li>
              <li>
                <Link href="/order-tracking" className="text-stone-600 hover:text-stone-900 transition-colors">
                  Suivre une commande
                </Link>
              </li>
              <li>
                <Link href="/register-restaurant" className="text-stone-600 hover:text-stone-900 transition-colors">
                  Créer un restaurant
                </Link>
              </li>
            </ul>
          </div>

          {/* Légal Col - EXACT as Screenshot 8 */}
          <div>
            <h4 className="text-sm font-bold text-stone-900 mb-4">Légal</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/cgu" className="text-stone-600 hover:text-stone-900 transition-colors">
                  Conditions d'utilisation
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-stone-600 hover:text-stone-900 transition-colors">
                  Confidentialité
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-stone-600 hover:text-stone-900 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Col - EXACT as Screenshot 8 */}
          <div>
            <h4 className="text-sm font-bold text-stone-900 mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="text-stone-600">
                Cotonou, Bénin
              </li>
              <li>
                <a
                  href="mailto:contact@qresto.africa"
                  className="text-stone-600 hover:text-stone-900 transition-colors"
                >
                  contact@qresto.africa
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright line - EXACT as Screenshot 8 */}
        <div className="pt-8 border-t border-soft text-center">
          <p className="text-xs text-muted">
            © 2026 QResto — Digitalisation des restaurants en Afrique.
          </p>
        </div>
      </div>
    </footer>
  );
};
