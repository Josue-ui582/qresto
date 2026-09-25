'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { LogIn, AlertCircle, Loader2, Lock, Mail, Sparkles, Eye, EyeOff } from 'lucide-react';
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

  const handleDemoLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    try {
      setIsLoading(true);
      await login(demoEmail, demoPass);
      router.push('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Identifiants incorrects.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card max-w-md w-full space-y-7 p-8 sm:p-10"
      >
        <div className="text-center">
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 cursor-pointer mb-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-amber-600 via-amber-500 to-orange-400 text-text-inverse flex items-center justify-center text-xl font-black shadow-lg shadow-amber-500/25">
              Q
            </div>
          </motion.button>
          <h2 className="heading-lg text-center">Espace Restaurateur</h2>
          <p className="mt-2 text-xs sm:text-sm text-muted leading-relaxed">
            Connectez-vous pour gérer votre menu digital, vos commandes en temps réel et vos QR codes par table.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2 text-left">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
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
                className="input-field pl-10 pr-4 py-3"
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
                className="input-field pl-10 pr-10 py-3"
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
            className="btn-primary w-full"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            <span>Se connecter à mon Dashboard</span>
          </motion.button>
        </form>

        <div className="pt-4 border-t border-soft text-left">
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-[11px] font-bold text-muted uppercase tracking-wider">
              Accès démo 1-clic pour tester
            </p>
            <Sparkles className="w-3.5 h-3.5 text-brand" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('owner@chezmama.bj', 'password123')}
              className="p-3 rounded-2xl bg-surface-alt hover:bg-primary-soft border border-soft text-left cursor-pointer transition-all"
            >
              <div className="font-bold text-text truncate">Chez Mama Bénin</div>
              <div className="text-[10px] text-muted mt-0.5">owner@chezmama.bj</div>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('contact@jardin-fidjrosse.bj', 'password123')}
              className="p-3 rounded-2xl bg-surface-alt hover:bg-primary-soft border border-soft text-left cursor-pointer transition-all"
            >
              <div className="font-bold text-text truncate">Le Jardin Fidjrossè</div>
              <div className="text-[10px] text-muted mt-0.5">contact@jardin...</div>
            </button>
          </div>
        </div>

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
      </motion.div>
    </div>
  );
};
