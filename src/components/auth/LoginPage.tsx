'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { LogIn, AlertCircle, Loader2, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setIsLoading(true);
      await login(email, password);
      router.push('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Identifiants incorrects.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#eaf1f7] px-4 py-12 sm:px-6"
      style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.9),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(148,163,184,0.18),transparent_60%)]" />
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md overflow-hidden rounded-[2rem] bg-white shadow-[0_24px_70px_rgba(15,23,42,0.16)]"
      >
        <div className="relative overflow-hidden bg-gradient-to-br from-[#F59E0B] via-[#F59E0B] to-[#F59E0B] px-7 pb-12 pt-10 text-center">
          <div className="absolute -left-12 bottom-[-3rem] h-36 w-36 rounded-full bg-amber-200/50" />
          <div className="absolute -right-10 bottom-[-4rem] h-40 w-40 rounded-full bg-emerald-300/45" />
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/')}
            className="relative z-10 mb-4 inline-flex cursor-pointer items-center gap-2"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-xl font-black text-stone-950 shadow-lg">
              <span>Q<span className="text-amber-600">R</span></span>
            </div>
          </motion.button>
          <h2 className="relative z-10 text-center text-2xl font-bold text-white">Espace Restaurateur</h2>
          <p className="relative z-10 mx-auto mt-2 max-w-sm text-xs leading-relaxed text-white/90 sm:text-sm">
            Connectez-vous pour gérer votre menu digital, vos commandes en temps réel et vos QR codes par table.
          </p>
        </div>

        <div className="-mt-5 rounded-t-[2rem] bg-white px-6 pb-8 pt-7 sm:px-9 sm:pb-9">
          {error && (
            <div className="mb-5 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-left text-xs font-medium text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="form-label">Adresse Email professionnelle</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@chezmama.bj"
                className="input-field rounded-full border-0 bg-stone-100 py-3 pl-10 pr-4"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="form-label mb-0">Mot de passe</label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field rounded-full border-0 bg-stone-100 py-3 pl-10 pr-10"
              />
              {/* Bouton pour basculer l'affichage du mot de passe */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-stone-950 px-5 py-3.5 text-sm font-bold text-white transition-colors hover:bg-stone-800 disabled:opacity-60"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            <span>Se connecter</span>
          </motion.button>
        </form>

        <div className="text-center pt-1">
          <p className="text-xs text-muted">
            Vous n’avez pas encore digitalisé votre établissement ?{' '}
            <button
              type="button"
              onClick={() => router.push('/register-restaurant')}
              className="font-bold text-brand hover:underline cursor-pointer"
            >
              Créer mon restaurant
            </button>
          </p>
        </div>
        </div>
      </motion.div>
    </div>
  );
};
