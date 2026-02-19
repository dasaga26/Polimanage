// ============================================================
// PERSONAL INFO FORM - Formulario de información personal
// ============================================================

import React, { useState } from 'react';
import type { UserProfile, ProfileFormData } from '../../types/profileTypes';

interface PersonalInfoFormProps {
  profile: UserProfile;
  onSubmit: (data: ProfileFormData) => void;
  isLoading?: boolean;
}

const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({ profile, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: profile.fullName || '',
    email: profile.email || '',
    phone: profile.phone || '',
    dni: profile.dni || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Personal Info Section */}
      <div className="mb-10">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-600">badge</span>
          Información Personal
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div className="space-y-2">
            <label 
              htmlFor="fullName" 
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Nombre Completo
            </label>
            <div className="relative">
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-blue-600 focus:ring-blue-600 py-2.5 pl-10 pr-4 sm:text-sm"
                required
              />
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-xl">
                person
              </span>
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label 
              htmlFor="email" 
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Email
            </label>
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled
                className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 shadow-sm py-2.5 pl-10 pr-4 sm:text-sm cursor-not-allowed"
              />
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-xl">
                mail
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              El email no se puede modificar
            </p>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <label 
              htmlFor="phone" 
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Teléfono
            </label>
            <div className="relative">
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-blue-600 focus:ring-blue-600 py-2.5 pl-10 pr-4 sm:text-sm"
              />
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-xl">
                call
              </span>
            </div>
          </div>

          {/* DNI */}
          <div className="space-y-2">
            <label 
              htmlFor="dni" 
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              DNI
            </label>
            <div className="relative">
              <input
                id="dni"
                name="dni"
                type="text"
                value={formData.dni}
                onChange={handleChange}
                className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-blue-600 focus:ring-blue-600 py-2.5 pl-10 pr-4 sm:text-sm"
              />
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-xl">
                id_card
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setFormData({
            fullName: profile.fullName || '',
            email: profile.email || '',
            phone: profile.phone || '',
            dni: profile.dni || '',
          })}
          className="px-6 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </form>
  );
};

export default PersonalInfoForm;
