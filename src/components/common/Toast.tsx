'use client';

import React from 'react';
import { useToast } from '../../context/ToastContext';
import { Icon } from './Icon';

export const Toast: React.FC = () => {
  const { toastMessage, toastType } = useToast();

  if (!toastMessage) return null;

  const bgStyles = {
    success: 'bg-ink-900 text-paper-white border-positive-500/40',
    error: 'bg-negative-950 text-negative-100 border-negative-500/40',
    info: 'bg-ink-900 text-paper-white border-brand-500/40',
  }[toastType];

  const iconName = {
    success: 'circle-check text-positive-400',
    error: 'triangle-exclamation text-negative-400',
    info: 'circle-info text-brand-400',
  }[toastType];

  return (
    <div className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-50 max-w-sm animate-bounce-in">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-2xl backdrop-blur-xl ${bgStyles}`}>
        <Icon name={iconName} className="text-lg shrink-0" />
        <span className="text-sm font-medium leading-snug">{toastMessage}</span>
      </div>
    </div>
  );
};
