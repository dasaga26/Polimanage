// ============================================================
// AUTH TYPES - Interfaces y tipos para autenticación
// ============================================================

// Roles del sistema (deben coincidir con backend)
export const ROLES = {
  ADMIN: 'ADMIN',
  GESTOR: 'GESTOR',
  CLUB: 'CLUB',
  MONITOR: 'MONITOR',
  CLIENTE: 'CLIENTE',
} as const;

export type RoleName = typeof ROLES[keyof typeof ROLES];

export interface User {
  id: number;
  roleId: number;
  slug: string;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  roleName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  deviceId?: string; // V2: Opcional
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string; // V2: Renombrado de 'token'
  deviceId?: string;   // V2: Retornado al cliente
}

export interface RefreshResponse {
  accessToken: string;
}

// Callbacks para login/register
export interface AuthCallbacks {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export interface AuthContextType {
  user: User | null;
  token: string | null; // Access token
  deviceId: string | null; // V2: Device identifier
  isAuthenticated: boolean;
  isLoading: boolean;
  errorMSG: string | null;
  useLogin: (credentials: LoginCredentials, callbacks?: AuthCallbacks) => Promise<void>;
  useRegister: (data: RegisterData, callbacks?: AuthCallbacks) => Promise<void>;
  logout: () => void;
  logoutAll: () => Promise<void>; // V2: Logout global
  refreshToken: () => Promise<void>;
}
