'use client';

import React, { useState } from 'react';
import { useNavigation } from '../../context/NavigationContext';
import Link from 'next/link';
import { useToast } from '../../context/ToastContext';
import { FaIcon } from '../common/Icon';

export const CguPage: React.FC = () => {
  const { navigateTo } = useNavigation();

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <Link href="/" className="mb-6 inline-flex items-center gap-2 text-xs font-bold text-stone-500 hover:text-stone-900">
        <FaIcon name="fa-solid fa-arrow-left" />
        <span>Retour à l'accueil</span>
      </Link>

      <div className="card p-8 sm:p-12 space-y-6">
        <h1 className="heading-lg text-text">Conditions Générales d'Utilisation (CGU)</h1>
        <p className="text-xs text-muted">Dernière mise à jour : 23 Septembre 2026 • Cotonou, Bénin</p>

        <section className="space-y-3 text-sm text-text-muted leading-relaxed">
          <h2 className="text-base font-bold text-text">1. Présentation de la plateforme QResto</h2>
          <p>
            QResto est une plateforme SaaS dédiée à la digitalisation des restaurants, bars, maquis et lounges au Bénin et en Afrique de l'Ouest. Elle permet aux restaurateurs de publier des menus interactifs, de générer des QR codes pour leurs tables et de recevoir des commandes en direct.
          </p>

          <h2 className="text-base font-bold text-text">2. Commandes et Clients</h2>
          <p>
            Les clients accèdent aux menus digitaux sans obligation de créer un compte. Les commandes passées en salle ou en livraison sont transmises directement à l'établissement partenaire.
          </p>

          <h2 className="text-base font-bold text-text">3. Abonnements Restaurateurs</h2>
          <p>
            Les abonnements restaurateurs sont proposés aux formules mensuelles de 5 000 FCFA (Plan Starter) et 8 000 FCFA (Plan Pro Illimité). Le règlement s'effectue via les moyens de paiement locaux (MTN Mobile Money, Moov Money).
          </p>
        </section>
      </div>
    </div>
  );
};

export const PrivacyPage: React.FC = () => {
  const { navigateTo } = useNavigation();

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <Link href="/" className="mb-6 inline-flex items-center gap-2 text-xs font-bold text-stone-500 hover:text-stone-900">
        <FaIcon name="fa-solid fa-arrow-left" />
        <span>Retour à l'accueil</span>
      </Link>

      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-stone-200 shadow-sm space-y-6">
        <h1 className="text-3xl font-extrabold text-stone-900">Politique de Confidentialité</h1>
        <p className="text-xs text-stone-400">Protection des données • République du Bénin</p>

        <section className="space-y-3 text-sm text-stone-600 leading-relaxed">
          <p>
            La confidentialité de nos restaurateurs et des clients est primordiale. QResto applique une stricte isolation multi-tenant : les données d'un restaurant (chiffre d'affaires, commandes, liste des clients) ne sont jamais accessibles par un autre restaurant.
          </p>
          <p>
            Les numéros de téléphone collectés lors des commandes sont uniquement utilisés pour la validation et la livraison de la commande en cours.
          </p>
        </section>
      </div>
    </div>
  );
};

export const ContactPage: React.FC = () => {
  const { navigateTo } = useNavigation();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Votre message a bien été envoyé ! Notre équipe au Bénin vous répondra sous 24h.', 'success');
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      <Link href="/" className="mb-6 inline-flex items-center gap-2 text-xs font-bold text-stone-500 hover:text-stone-900">
        <FaIcon name="fa-solid fa-arrow-left" />
        <span>Retour à l'accueil</span>
      </Link>

      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-stone-200 shadow-sm space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-stone-900">Contactez l'Équipe QResto</h1>
          <p className="text-sm text-stone-500 mt-2">
            Notre équipe est basée à Cotonou et accompagne les restaurants 7j/7.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
            <FaIcon name="fa-brands fa-whatsapp" className="text-emerald-600 text-xl mb-2" />
            <h4 className="font-bold text-stone-900 text-sm">Assistance WhatsApp 7j/7</h4>
            <p className="text-xs text-stone-600 mt-1">+229 97 00 00 00</p>
          </div>
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
            <FaIcon name="fa-solid fa-envelope" className="text-amber-600 text-xl mb-2" />
            <h4 className="font-bold text-stone-900 text-sm">Email Support</h4>
            <p className="text-xs text-stone-600 mt-1">support@qresto.bj</p>
          </div>
        </div>

        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">Votre Nom & Prénom</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">Votre Email ou Téléphone</label>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">Message</label>
            <textarea
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md"
          >
            Envoyer mon message
          </button>
        </form>
      </div>
    </div>
  );
};
