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
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  errorMSG: string | null;
  useLogin: (credentials: LoginCredentials) => Promise<void>;
  useRegister: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  isCorrect: boolean;
}
