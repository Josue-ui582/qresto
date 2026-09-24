'use client';

import React from 'react';
import { useToast } from '../../context/ToastContext';
import { FaIcon } from './Icon';

export const Toast: React.FC = () => {
  const { toastMessage, toastType } = useToast();

  if (!toastMessage) return null;

  const bgStyles = {
    success: 'bg-stone-900 text-white border-emerald-500/40',
    error: 'bg-red-950 text-red-100 border-red-500/40',
    info: 'bg-stone-900 text-white border-amber-500/40',
  }[toastType];

  const iconName = {
    success: 'fa-solid fa-circle-check text-emerald-400',
    error: 'fa-solid fa-triangle-exclamation text-red-400',
    info: 'fa-solid fa-circle-info text-amber-400',
  }[toastType];

  return (
    <div className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-50 max-w-sm animate-bounce-in">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-2xl backdrop-blur-xl ${bgStyles}`}>
        <FaIcon name={iconName} className="text-lg shrink-0" />
        <span className="text-sm font-medium leading-snug">{toastMessage}</span>
      </div>
    </div>
  );
};
