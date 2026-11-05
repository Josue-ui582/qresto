'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, X } from 'lucide-react';
import { LoginPage } from './LoginPage';
import { RegisterRestaurantPage } from './RegisterRestaurantPage';

export type AuthModalView = 'login' | 'register';

interface AuthModalProps {
  initialView: AuthModalView;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ initialView, onClose }) => {
  const [view, setView] = useState(initialView);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-ink-950/60 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={view === 'login' ? 'Connexion restaurateur' : 'Inscription restaurant'}
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        className="mx-auto my-auto w-full max-w-3xl"
      >
        <div className="mb-2 flex items-center justify-between">
          <button
            type="button"
            onClick={() => view === 'register' ? setView('login') : onClose()}
            className="inline-flex min-h-10 items-center gap-2 rounded-full bg-paper-white px-3 text-xs font-bold text-ink-800 shadow-sm transition-colors hover:bg-ink-100"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Retour</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer la fenêtre"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-paper-white text-ink-700 shadow-sm transition-colors hover:bg-ink-100 hover:text-ink-950"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {view === 'login' ? (
            <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LoginPage presentation="modal" onRegister={() => setView('register')} />
            </motion.div>
          ) : (
            <motion.div key="register" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <RegisterRestaurantPage presentation="modal" onLogin={() => setView('login')} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
