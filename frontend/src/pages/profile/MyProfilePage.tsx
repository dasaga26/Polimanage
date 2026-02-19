// ============================================================
// MY PROFILE PAGE - Página de perfil del usuario autenticado
// ============================================================

import React, { useState } from 'react';
import { useMyProfile } from '../../queries/profileQueries';
import { useUpdateProfile, useChangePassword } from '../../mutations/profileMutations';
import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfileSidebar from '../../components/profile/ProfileSidebar';
import PersonalInfoForm from '../../components/profile/PersonalInfoForm';
import SecurityForm from '../../components/profile/SecurityForm';
import EmptyState from '../../components/profile/EmptyState';
import ProfileSkeleton from '../../components/profile/ProfileSkeleton';
import type { ProfileFormData, ChangePasswordData, UserProfile } from '../../types/profileTypes';

const MyProfilePage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'profile' | 'bookings' | 'notifications' | 'security'>('profile');

    // Queries
    const { data: profile, isLoading, error } = useMyProfile();

    // Mutations
    const updateProfileMutation = useUpdateProfile();
    const changePasswordMutation = useChangePassword();

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
            // Mostrar mensaje de éxito
            alert('Contraseña cambiada correctamente');
        } catch (error) {
            console.error('Error al cambiar contraseña:', error);
            alert('Error al cambiar la contraseña. Verifica tu contraseña actual.');
        }
    };

    const handleChangePhoto = () => {
        // TODO: Implementar modal para cambiar foto
        alert('Funcionalidad de cambio de foto en desarrollo');
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
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-8">
                        <SecurityForm
                            onSubmit={handlePasswordChange}
                            isLoading={changePasswordMutation.isPending}
                        />
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
