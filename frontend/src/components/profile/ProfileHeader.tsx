// ============================================================
// PROFILE HEADER - Header de perfil con avatar y gradient
// ============================================================

import React from 'react';
import type { UserProfile } from '../../types/profileTypes';

interface ProfileHeaderProps {
  profile: UserProfile;
  onChangePhoto?: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile, onChangePhoto }) => {
  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullName)}&size=200&background=135bec&color=fff`;
  
  // Función para formatear fecha de creación de forma segura
  const formatMemberSince = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      
      // Verificar si es una fecha válida (no 0001, 1970, etc.)
      if (!dateString || year < 2000 || isNaN(year)) {
        return new Date().getFullYear().toString();
      }
      
      return year.toString();
    } catch {
      return new Date().getFullYear().toString();
    }
  };
  
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Header Gradient */}
      <div className="relative h-32 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="absolute -bottom-10 left-8 flex items-end">
          <div 
            className="h-24 w-24 rounded-full border-4 border-white dark:border-slate-900 bg-cover bg-center shadow-md"
            style={{ backgroundImage: `url(${profile.avatarUrl || defaultAvatar})` }}
          />
        </div>
      </div>

      {/* Profile Info */}
      <div className="pt-12 px-8 pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {profile.fullName}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              {profile.isPremium && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200 border border-amber-200 dark:border-amber-800">
                  <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Premium Member
                </span>
              )}
              <span className="text-sm text-slate-500 dark:text-slate-400">
                • Miembro desde {formatMemberSince(profile.createdAt)}
              </span>
            </div>
          </div>
          {onChangePhoto && (
            <button 
              onClick={onChangePhoto}
              className="mt-4 sm:mt-0 text-sm text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              Cambiar foto de perfil
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
