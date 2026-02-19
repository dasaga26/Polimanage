// ============================================================
// SECURITY FORM - Formulario de seguridad y cambio de contraseña
// ============================================================

import React, { useState } from 'react';
import type { ChangePasswordData } from '../../types/profileTypes';

interface SecurityFormProps {
  onSubmit: (data: ChangePasswordData) => void;
  isLoading?: boolean;
}

const SecurityForm: React.FC<SecurityFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<ChangePasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Partial<ChangePasswordData>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error on change
    if (errors[e.target.name as keyof ChangePasswordData]) {
      setErrors({
        ...errors,
        [e.target.name]: undefined,
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<ChangePasswordData> = {};

    if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'La contraseña debe tener al menos 8 caracteres';
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleReset = () => {
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Security Section */}
      <div className="mb-10">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-600">lock_reset</span>
          Seguridad
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Password */}
          <div className="space-y-2 md:col-span-2">
            <label 
              htmlFor="currentPassword" 
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Contraseña Actual
            </label>
            <div className="relative max-w-md">
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-blue-600 focus:ring-blue-600 py-2.5 pl-10 pr-4 sm:text-sm"
                required
              />
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-xl">
                key
              </span>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <label 
              htmlFor="newPassword" 
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Nueva Contraseña
            </label>
            <div className="relative">
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-blue-600 focus:ring-blue-600 py-2.5 pl-10 pr-4 sm:text-sm ${
                  errors.newPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                }`}
                required
              />
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-xl">
                lock
              </span>
            </div>
            {errors.newPassword && (
              <p className="text-xs text-red-600 dark:text-red-400">{errors.newPassword}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label 
              htmlFor="confirmPassword" 
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Confirmar Nueva Contraseña
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-blue-600 focus:ring-blue-600 py-2.5 pl-10 pr-4 sm:text-sm ${
                  errors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                }`}
                required
              />
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-xl">
                lock_clock
              </span>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={handleReset}
          className="px-6 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Cambiando...' : 'Cambiar Contraseña'}
        </button>
      </div>
    </form>
  );
};

export default SecurityForm;
