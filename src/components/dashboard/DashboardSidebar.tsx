import React from 'react';
import { Icon } from '../common/Icon';
import { DashboardTab } from '../../context/NavigationContext';
import { NavItem } from '@/types';

interface DashboardSidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  dashboardTab: DashboardTab;
  setDashboardTab: (tab: DashboardTab) => void;
  navItems: NavItem[];
  restaurantName: string;
  userEmail: string;
  onLogout: () => void;
  onNavigateHome: () => void;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  collapsed,
  setCollapsed,
  dashboardTab,
  setDashboardTab,
  navItems,
  restaurantName,
  userEmail,
  onLogout,
  onNavigateHome,
}) => {
  return (
    <aside
      className={`hidden md:flex flex-col bg-surface border-r border-soft transition-all duration-300 shrink-0 z-30 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="h-16 px-6 border-b border-ink-100 flex items-center justify-between">
        {!collapsed ? (
          <div onClick={onNavigateHome} className="cursor-pointer select-none group">
            <span className="text-2xl font-black tracking-tight text-ink-900">
              Q<span className="text-brand-500">Resto</span>
            </span>
          </div>
        ) : (
          <span className="text-2xl font-black text-ink-900 mx-auto">Q</span>
        )}

        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="text-ink-400 hover:text-ink-700 p-1 text-xs"
          title={collapsed ? 'Déplier' : 'Replier'}
        >
          <Icon name={collapsed ? 'chevron-right' : 'chevron-left'} />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = dashboardTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setDashboardTab(item.id as DashboardTab)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-ink-900 text-paper-white shadow-xs'
                  : 'text-ink-700 hover:bg-ink-100 hover:text-ink-950'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                name={item.icon}
                className={`text-base shrink-0 ${isActive ? 'text-paper-white' : 'text-ink-500'}`}
              />
              {!collapsed && <span className="flex-1 text-left truncate">{item.label}</span>}
              {!collapsed && item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[0.6875rem] font-bold ${
                    isActive ? 'bg-brand-500 text-ink-900' : 'bg-brand-100 text-brand-900'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-ink-100">
        {!collapsed ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-8 h-8 rounded-full bg-ink-900 text-paper-white flex items-center justify-center text-xs font-bold shrink-0">
                M
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-ink-900 truncate">{restaurantName}</p>
                <p className="text-[0.6875rem] text-ink-400 truncate">{userEmail}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="text-ink-400 hover:text-negative-600 p-1.5 transition-colors"
              title="Déconnexion"
            >
              <Icon name="arrow-right-from-bracket" className="text-sm" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onLogout}
            className="w-full text-ink-400 hover:text-negative-600 py-2 flex justify-center text-sm"
            title="Déconnexion"
          >
            <Icon name="arrow-right-from-bracket" />
          </button>
        )}
      </div>
    </aside>
  );
};
