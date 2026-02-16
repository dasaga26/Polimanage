// ============================================================
// PROFILE CARD - Componente de tarjeta de perfil público
// ============================================================

import React from 'react';
import type { PublicProfile } from '../../services/profileService';

interface ProfileCardProps {
  profile: PublicProfile;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile }) => {
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-32"></div>
      
      <div className="relative px-6 pb-6">
        {/* Avatar */}
        <div className="flex justify-center -mt-16 mb-4">
          <img
            src={profile.avatarUrl || 'https://ui-avatars.com/api/?name=' + profile.fullName}
            alt={profile.fullName}
            className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
          />
        </div>

        {/* Info */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {profile.fullName}
          </h1>
          <p className="text-gray-600 mb-4">@{profile.username}</p>
          
          {profile.bio && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700">{profile.bio}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
