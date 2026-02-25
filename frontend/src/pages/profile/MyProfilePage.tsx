// ============================================================
// MY PROFILE PAGE - Página de perfil del usuario autenticado
// ============================================================

import React, { useState } from 'react';
import { useMyProfile } from '../../queries/profileQueries';
import { useUpdateProfile, useChangePassword, useUploadAvatar } from '../../mutations/profileMutations';
import { useAuth } from '../../hooks/useAuth';
import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfileSidebar from '../../components/profile/ProfileSidebar';
import PersonalInfoForm from '../../components/profile/PersonalInfoForm';
import SecurityForm from '../../components/profile/SecurityForm';
import EmptyState from '../../components/profile/EmptyState';
import ProfileSkeleton from '../../components/profile/ProfileSkeleton';
import AvatarUploadModal from '../../components/profile/AvatarUploadModal';
import type { ProfileFormData, ChangePasswordData, UserProfile } from '../../types/profileTypes';

const MyProfilePage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'profile' | 'bookings' | 'notifications' | 'security'>('profile');
    const [logoutAllLoading, setLogoutAllLoading] = useState(false);
    const [avatarModalOpen, setAvatarModalOpen] = useState(false);

    // Auth context
    const { logout, logoutAll } = useAuth();

    // Queries
    const { data: profile, isLoading, error } = useMyProfile();

    // Mutations
    const updateProfileMutation = useUpdateProfile();
    const changePasswordMutation = useChangePassword();
    const uploadAvatarMutation = useUploadAvatar();

    // Handlers
    const handleProfileUpdate = async (formData: ProfileFormData) => {
        try {
            await updateProfileMutation.mutateAsync({
                fullName: formData.fullName,
                phone: formData.phone,
                dni: formData.dni,
            });
            // Mostrar mensaje de éxito (podrías usar un toast aquí)
            alert('Perfil actualizado correctamente');
        } catch (error) {
            console.error('Error al actualizar perfil:', error);
            alert('Error al actualizar el perfil');
        }
    };

    const handlePasswordChange = async (passwordData: ChangePasswordData) => {
        try {
            await changePasswordMutation.mutateAsync(passwordData);
            // Contraseña cambiada: el backend invalida todas las sesiones.
            // Forzar logout local para que el usuario vuelva a iniciar sesión.
            alert('Contraseña cambiada correctamente. Inicia sesión de nuevo.');
            logout();
        } catch (error) {
            console.error('Error al cambiar contraseña:', error);
            alert('Error al cambiar la contraseña. Verifica tu contraseña actual.');
        }
    };

    const handleLogoutAllDevices = async () => {
        if (!confirm('\u00bfCerrar sesión en todos los dispositivos?')) return;
        try {
            setLogoutAllLoading(true);
            await logoutAll();
        } catch (error) {
            console.error('Error al cerrar todas las sesiones:', error);
            alert('Error al cerrar las sesiones.');
        } finally {
            setLogoutAllLoading(false);
        }
    };

    const handleChangePhoto = () => {
        setAvatarModalOpen(true);
    };

    const handleAvatarUpload = async (file: File) => {
        try {
            await uploadAvatarMutation.mutateAsync(file);
        } catch (error) {
            console.error('Error al subir el avatar:', error);
            alert('Error al subir la foto de perfil. Inténtalo de nuevo.');
            throw error; // para que el modal no se cierre en caso de error
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
                <div className="container mx-auto px-4 py-8 lg:px-8 max-w-7xl">
                    <ProfileSkeleton />
                </div>
            </div>
        );
    }

    // Error state
    if (error || !profile) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        Error al cargar el perfil
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        No se pudo cargar la información del perfil
                    </p>
                </div>
            </div>
        );
    }

    // Render tab content
    const renderTabContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <div className="space-y-8">
                        <ProfileHeader profile={profile as UserProfile} onChangePhoto={handleChangePhoto} />
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-8">
                            <PersonalInfoForm
                                profile={profile as UserProfile}
                                onSubmit={handleProfileUpdate}
                                isLoading={updateProfileMutation.isPending}
                            />
                        </div>
                    </div>
                );

            case 'security':
                return (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-8">
                            <SecurityForm
                                onSubmit={handlePasswordChange}
                                isLoading={changePasswordMutation.isPending}
                            />
                        </div>

                        {/* Cerrar sesión en todos los dispositivos */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-red-200 dark:border-red-900 shadow-sm p-8">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                                Cerrar sesión en todos los dispositivos
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                                Cierra todas las sesiones activas en cualquier navegador o dispositivo.
                                Tendrás que volver a iniciar sesión.
                            </p>
                            <button
                                onClick={handleLogoutAllDevices}
                                disabled={logoutAllLoading}
                                className="px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
                            >
                                {logoutAllLoading ? 'Cerrando sesiones...' : 'Cerrar todas las sesiones'}
                            </button>
                        </div>
                    </div>
                );

            case 'bookings':
                return (
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <EmptyState
                            icon="calendar_month"
                            title="Mis Reservas"
                            description="Aquí verás todas tus reservas de pistas y clases. Esta funcionalidad estará disponible pronto."
                        />
                    </div>
                );

            case 'notifications':
                return (
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <EmptyState
                            icon="notifications"
                            title="Notificaciones"
                            description="Aquí verás todas tus notificaciones importantes. Esta funcionalidad estará disponible pronto."
                        />
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Modal de subida de avatar */}
            <AvatarUploadModal
                isOpen={avatarModalOpen}
                currentAvatarUrl={profile?.avatarUrl ?? undefined}
                userName={profile?.fullName ?? ''}
                onClose={() => setAvatarModalOpen(false)}
                onUpload={handleAvatarUpload}
                isLoading={uploadAvatarMutation.isPending}
            />

            <div className="container mx-auto px-4 py-8 lg:px-8 max-w-7xl">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <ProfileSidebar
                        profile={profile as UserProfile}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                    />

                    {/* Main Content */}
                    <section className="flex-1">
                        {renderTabContent()}
                    </section>
                </div>
            </div>
        </div>
    );
};

export default MyProfilePage;
