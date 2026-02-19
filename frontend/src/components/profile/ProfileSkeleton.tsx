// ============================================================
// PROFILE SKELETON - Loading state para perfil
// ============================================================

import React from 'react';

const ProfileSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="container mx-auto px-4 py-8 lg:px-8 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Skeleton */}
          <aside className="w-full lg:w-72 flex-shrink-0">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
              <div className="animate-pulse">
                {/* Mini Profile */}
                <div className="flex items-center gap-3 px-2 pb-6 border-b border-slate-100 dark:border-slate-800 mb-4">
                  <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-700" />
                  <div className="flex-1">
                    <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                    <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
                  </div>
                </div>
                {/* Navigation Items */}
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 rounded-lg mb-2" />
                ))}
              </div>
            </div>
          </aside>

          {/* Content Skeleton */}
          <section className="flex-1">
            <div className="space-y-8">
              {/* Header Skeleton */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600" />
                <div className="pt-12 px-8 pb-8 animate-pulse">
                  <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                  <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
              </div>

              {/* Form Skeleton */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-8">
                <div className="animate-pulse space-y-6">
                  <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded mb-6" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i}>
                        <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                        <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end gap-4 pt-6">
                    <div className="h-10 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                    <div className="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProfileSkeleton;
