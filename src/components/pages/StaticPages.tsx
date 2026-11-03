'use client';

import React, { useState } from 'react';
import { useNavigation } from '../../context/NavigationContext';
import Link from 'next/link';
import { useToast } from '../../context/ToastContext';
import { Icon } from '../common/Icon';
import { PLAN_CURRENCY, PLANS_CATALOG } from '@/lib/subscription/catalog';

export const CguPage: React.FC = () => {
  const { navigateTo } = useNavigation();

  return (
    <div className="min-h-screen bg-ink-50 py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <Link href="/" className="mb-6 inline-flex items-center gap-2 text-xs font-bold text-ink-500 hover:text-ink-900">
        <Icon name="arrow-left" />
        <span>Retour à l'accueil</span>
      </Link>

      <div className="card p-8 sm:p-12 space-y-6">
        <h1 className="text-text">Conditions Générales d'Utilisation (CGU)</h1>
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
            Les formules actuellement affichées sont :
            {' '}{PLANS_CATALOG.map((plan, index) => (
              <React.Fragment key={plan.id}>
                {index > 0 ? ', ' : ''}
                {plan.name} : {new Intl.NumberFormat('fr-FR').format(plan.monthlyPrice)} {PLAN_CURRENCY} par mois ou {new Intl.NumberFormat('fr-FR').format(plan.yearlyPrice)} {PLAN_CURRENCY} par an
              </React.Fragment>
            ))}.
            {' '}Ces tarifs sont à confirmer. Un essai de 14 jours est proposé. Le changement de formule est actuellement simulé : aucun paiement ni renouvellement automatique n’est effectué. Les moyens de paiement seront précisés lorsqu’un prestataire sera intégré.
          </p>
        </section>
      </div>
    </div>
  );
};

export const PrivacyPage: React.FC = () => {
  const { navigateTo } = useNavigation();

  return (
    <div className="min-h-screen bg-ink-50 py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <Link href="/" className="mb-6 inline-flex items-center gap-2 text-xs font-bold text-ink-500 hover:text-ink-900">
        <Icon name="arrow-left" />
        <span>Retour à l'accueil</span>
      </Link>

      <div className="bg-paper-white p-8 sm:p-12 rounded-3xl border border-ink-200 shadow-sm space-y-6">
        <h1 className="text-3xl font-extrabold text-ink-900">Politique de Confidentialité</h1>
        <p className="text-xs text-ink-400">Protection des données • République du Bénin</p>

        <section className="space-y-3 text-sm text-ink-600 leading-relaxed">
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
  const [website, setWebsite] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, contact: email, message, website }),
      });
      if (response.status === 204) {
        setName('');
        setEmail('');
        setMessage('');
        setWebsite('');
        return;
      }

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Impossible d’enregistrer votre message.');
      }

      showToast(
        result.deliveryStatus === 'sent'
          ? 'Votre message a été envoyé. Notre équipe vous répondra bientôt.'
          : 'Votre message est enregistré. La livraison par e-mail reste à configurer.',
        result.deliveryStatus === 'sent' ? 'success' : 'info'
      );
      setName('');
      setEmail('');
      setMessage('');
      setWebsite('');
    } catch (error: unknown) {
      showToast(
        error instanceof Error ? error.message : 'Impossible d’envoyer votre message.',
        'error'
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-50 py-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      <Link href="/" className="mb-6 inline-flex items-center gap-2 text-xs font-bold text-ink-500 hover:text-ink-900">
        <Icon name="arrow-left" />
        <span>Retour à l'accueil</span>
      </Link>

      <div className="bg-paper-white p-8 sm:p-12 rounded-3xl border border-ink-200 shadow-sm space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-ink-900">Contactez l'Équipe QResto</h1>
          <p className="text-sm text-ink-500 mt-2">
            Notre équipe est basée à Cotonou et accompagne les restaurants 7j/7.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-brand-50 rounded-2xl border border-brand-200">
            <Icon name="whatsapp" className="text-positive-600 text-xl mb-2" />
            <h4 className="font-bold text-ink-900 text-sm">Assistance WhatsApp 7j/7</h4>
            <p className="text-xs text-ink-600 mt-1">+229 97 00 00 00</p>
          </div>
          <div className="p-4 bg-ink-50 rounded-2xl border border-ink-200">
            <Icon name="envelope" className="text-brand-600 text-xl mb-2" />
            <h4 className="font-bold text-ink-900 text-sm">Email Support</h4>
            <p className="text-xs text-ink-600 mt-1">support@qresto.bj</p>
          </div>
        </div>

        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">Votre Nom & Prénom</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-ink-50 border border-ink-200 rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">Votre Email ou Téléphone</label>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-ink-50 border border-ink-200 rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">Message</label>
            <textarea
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-ink-50 border border-ink-200 rounded-xl text-sm"
            />
          </div>
          <div
            aria-hidden="true"
            className="absolute -left-[625rem] top-auto h-px w-px overflow-hidden"
          >
            <label htmlFor="contact-website">Ne pas remplir ce champ</label>
            <input
              id="contact-website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={isSending}
            className="w-full py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-paper-white font-bold text-sm shadow-md"
          >
            {isSending ? 'Envoi en cours...' : 'Envoyer mon message'}
          </button>
        </form>
      </div>
    </div>
  );
};
