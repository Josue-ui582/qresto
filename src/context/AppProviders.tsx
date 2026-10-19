'use client';

import React, { ReactNode } from 'react';
import { ToastProvider } from './ToastContext';
import { NavigationProvider } from './NavigationContext';
import { AuthProvider } from './AuthContext';
import { CartProvider } from './CartContext';
import { OrderProvider } from './OrderContext';

export const AppProviders: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ToastProvider>
      <AuthProvider>
        <NavigationProvider>
          <CartProvider>
            <OrderProvider>
              {children}
            </OrderProvider>
          </CartProvider>
        </NavigationProvider>
      </AuthProvider>
    </ToastProvider>
  );
};
