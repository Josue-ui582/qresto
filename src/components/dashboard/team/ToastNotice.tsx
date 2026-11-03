'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, AlertTriangle, X } from 'lucide-react';

interface ToastNoticeProps {
  notice: { type: 'success' | 'error'; msg: string } | null;
  onClose: () => void;
}

export const ToastNotice: React.FC<ToastNoticeProps> = ({ notice, onClose }) => {
  return (
    <AnimatePresence>
      {notice && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`p-4 rounded-2xl flex items-center justify-between border text-xs sm:text-sm font-bold shadow-lg ${
            notice.type === 'success'
              ? 'bg-positive-50 text-positive-900 border-positive-200'
              : 'bg-alert-50 text-alert-900 border-alert-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {notice.type === 'success' ? (
              <Check className="w-5 h-5 text-positive-600" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-alert-600" />
            )}
            <span>{notice.msg}</span>
          </div>
          <button
            onClick={onClose}
            className="text-ink-400 hover:text-ink-700 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
