// ============================================================
// PROFILE PAGE - Página de perfil público (Ejemplo React Query)
// ============================================================
import { useParams, Navigate } from "react-router-dom";
import { useProfile } from "../../queries/profileQueries";
import ProfileCard from "../../components/profile/ProfileCard";
import ProfileSkeleton from "../../components/profile/ProfileSkeleton";

/**
 * ProfilePage - Ejemplo de página siguiendo el patrón:
 * - Solo componentes y hooks
 * - React Query para data fetching (NO context)
 * - Sin lógica de negocio
 */
const ProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  
  // React Query hook (NO context)
  const { data: profile, isLoading, error } = useProfile(username || '');

  // Loading state
  if (isLoading) {
    return (<ProfileSkeleton />);
  }

  // Error state
  if (error || !profile) {
    return <Navigate to="/" replace />;
  }

  // Success state
  return (<ProfileCard profile={profile} />);
};

export default ProfilePage;
