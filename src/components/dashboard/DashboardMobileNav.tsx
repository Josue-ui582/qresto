'use client';

import React, { useEffect, useRef } from 'react';
import { Icon } from '@/components/common/Icon';
import { DashboardTab } from '@/context/NavigationContext';
import { NavItem } from '@/types';

interface DashboardMobileNavProps {
  dashboardTab: DashboardTab;
  setDashboardTab: (tab: DashboardTab) => void;
  navItems: NavItem[];
}

export const DashboardMobileNav: React.FC<DashboardMobileNavProps> = ({
  dashboardTab,
  setDashboardTab,
  navItems,
}) => {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const activeItem = navRef.current?.querySelector<HTMLElement>('[aria-current="page"]');
    activeItem?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [dashboardTab]);

  return (
    <nav
      ref={navRef}
      aria-label="Navigation du dashboard"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-200 bg-paper-white/95 pb-[env(safe-area-inset-bottom)] shadow-lg backdrop-blur-lg lg:hidden"
    >
      <div className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain px-2 py-2 [scrollbar-width:thin]">
        {navItems.map((item) => {
          const isActive = dashboardTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setDashboardTab(item.id as DashboardTab)}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex min-w-20 shrink-0 snap-start flex-col items-center justify-center gap-1 rounded-xl px-2 py-1.5 text-xs font-semibold transition-colors ${
                isActive
                  ? 'bg-brand-100 text-brand-900'
                  : 'text-ink-500 hover:bg-ink-100 hover:text-ink-900'
              }`}
            >
              <span className="relative">
                <Icon
                  name={item.icon}
                  className={`text-lg ${isActive ? 'text-brand-800' : 'text-ink-500'}`}
                />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-negative-600 px-1 text-xs font-bold leading-none text-white">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </span>
              <span className="max-w-18 truncate">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
