// ============================================================
// PROFILE SIDEBAR - Navegación lateral del perfil
// ============================================================

import React from 'react';
import type { UserProfile } from '../../types/profileTypes';

interface ProfileSidebarProps {
  profile: UserProfile;
  activeTab: 'profile' | 'bookings' | 'notifications' | 'security';
  onTabChange: (tab: 'profile' | 'bookings' | 'notifications' | 'security') => void;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ profile, activeTab, onTabChange }) => {
  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullName)}&size=96&background=135bec&color=fff`;
  
  const tabs = [
    { id: 'profile' as const, label: 'Mi Perfil', icon: 'person' },
    { id: 'bookings' as const, label: 'Mis Reservas', icon: 'calendar_month' },
    { id: 'notifications' as const, label: 'Notificaciones', icon: 'notifications' },
    { id: 'security' as const, label: 'Seguridad', icon: 'lock' },
  ];

  return (
    <aside className="w-full lg:w-72 flex-shrink-0">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sticky top-24 shadow-sm">
        {/* User Mini Profile */}
        <div className="flex items-center gap-3 px-2 pb-6 border-b border-slate-100 dark:border-slate-800 mb-4">
          <div 
            className="h-12 w-12 rounded-full bg-cover bg-center"
            style={{ backgroundImage: `url(${profile.avatarUrl || defaultAvatar})` }}
          />
          <div className="flex flex-col overflow-hidden">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {profile.fullName}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {profile.isPremium ? 'Premium Member' : 'Member'}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                activeTab === tab.id
                  ? 'bg-blue-600/10 text-blue-600 dark:bg-blue-600/20 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span className="material-symbols-outlined text-xl">
                {tab.icon}
              </span>
              <span className={`text-sm ${activeTab === tab.id ? 'font-bold' : 'font-medium'}`}>
                {tab.label}
              </span>
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default ProfileSidebar;
