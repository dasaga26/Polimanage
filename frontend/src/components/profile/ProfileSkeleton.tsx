// ============================================================
// PROFILE SKELETON - Loading state para perfil
// ============================================================

import React from 'react';

const ProfileSkeleton: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
      <div className="bg-gray-300 h-32"></div>
      
      <div className="relative px-6 pb-6">
        {/* Avatar Skeleton */}
        <div className="flex justify-center -mt-16 mb-4">
          <div className="w-32 h-32 bg-gray-300 rounded-full border-4 border-white"></div>
        </div>

        {/* Info Skeleton */}
        <div className="text-center space-y-3">
          <div className="h-8 bg-gray-300 rounded w-48 mx-auto"></div>
          <div className="h-4 bg-gray-300 rounded w-32 mx-auto"></div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSkeleton;
