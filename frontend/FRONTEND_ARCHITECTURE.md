# 🏗️ FRONTEND ARCHITECTURE - POLIMANAGE

## 📐 Arquitectura Implementada

### 🎯 **Principios de Diseño**

1. **Context API** → SOLO para autenticación (estado global crítico)
2. **React Query** → TODO lo demás (data fetching, cache, mutations)
3. **Pages como Orquestadores** → Sin lógica de negocio, solo composición

---

## 📂 Estructura de Carpetas

```
src/
├── components/          # Componentes reutilizables
│   ├── auth/           # SignInForm
│   ├── profile/        # ProfileCard, ProfileSkeleton
│   ├── layout/         # Navbar, Footer
│   └── admin/          # DashboardLayout
│
├── pages/              # Páginas (SOLO orchestration)
│   ├── auth/           # Login, Register
│   ├── profile/        # ProfilePage
│   ├── home/           # Home
│   └── admin/          # Dashboard, Users, etc.
│
├── context/            # Context API (SOLO auth)
│   └── AuthContext.tsx # Estado global de autenticación
│
├── hooks/              # Custom hooks
│   └── useAuth.ts      # Hook para acceder a AuthContext
│
├── queries/            # React Query hooks
│   └── profileQueries.ts # useProfile (data fetching)
│
├── mutations/          # React Query mutations
│   └── (futuro)        # updateProfile, deleteUser, etc.
│
├── services/           # API calls (Axios)
│   ├── api.ts          # Configuración de Axios
│   ├── authService.ts  # Login, Register, Logout
│   ├── profileService.ts # GetProfile
│   └── userService.ts  # CRUD usuarios
│
├── types/              # TypeScript interfaces
│   ├── authTypes.ts    # User, LoginCredentials, etc.
│   └── ...
│
└── config/
    └── queryClient.ts  # Configuración React Query
```

---

## 🔐 **PATRÓN AUTH (Context API)**

### ¿Por qué Context para Auth?

- **Estado global crítico**: Token, usuario logged, isAuthenticated
- **Acceso universal**: Navbar, ProtectedRoutes, etc. necesitan saber si user está logged
- **Persistencia**: localStorage sync entre tabs
- **Performance**: No re-fetching innecesario del usuario

### Implementación

```typescript
// 1. AuthContext.tsx - Provider
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  
  const useLogin = async (credentials) => { /* ... */ };
  const useRegister = async (data) => { /* ... */ };
  const logout = () => { /* ... */ };
  
  return <AuthContext.Provider value={{ user, token, useLogin, ... }}>
    {children}
  </AuthContext.Provider>;
};

// 2. useAuth.ts - Hook personalizado
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be within AuthProvider');
  return context;
};

// 3. main.tsx - Wrapping
<AuthProvider>
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
</AuthProvider>

// 4. Usage en páginas
const Login = () => {
  const { useLogin, errorMSG, isCorrect } = useAuth();
  
  useEffect(() => {
    if (isCorrect) navigate('/');
  }, [isCorrect]);
  
  return <SignInForm sendData={useLogin} errorMSG={errorMSG} />;
};
```

---

## 📊 **PATRÓN REACT QUERY (Todo lo demás)**

### ¿Por qué React Query para data fetching?

- **Cache automático**: No re-fetching innecesario
- **Background updates**: Refresh data en background
- **Loading/Error states**: Built-in
- **Optimistic updates**: UI instantáneo
- **Devtools**: Debugging visual

### Implementación

```typescript
// 1. profileService.ts - API calls
export const profileService = {
  getByUsername: async (username: string): Promise<PublicProfile> => {
    const { data } = await apiGo.get(`/profiles/${username}`);
    return data;
  },
};

// 2. profileQueries.ts - React Query hook
export const useProfile = (username: string) => {
  return useQuery({
    queryKey: ['profile', username],
    queryFn: () => profileService.getByUsername(username),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// 3. ProfilePage.tsx - Usage en página
const ProfilePage = () => {
  const { username } = useParams();
  const { data: profile, isLoading, error } = useProfile(username);
  
  if (isLoading) return <ProfileSkeleton />;
  if (error) return <Navigate to="/" />;
  
  return <ProfileCard profile={profile} />;
};
```

---

## 📄 **PATRÓN DE PAGES**

### ✅ **CORRECTO** (Como Login.tsx)

```typescript
const Login = () => {
  const { isCorrect, useLogin, errorMSG } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isCorrect) navigate('/');
  }, [isCorrect]);

  return (
    <SignInForm 
      sendData={(data) => useLogin(data)} 
      errorMSG={errorMSG}
    />
  );
}
```

**✅ Características:**
- Solo imports de componentes y hooks
- Lógica mínima (navigation, conditional rendering)
- Delegación a componentes (SignInForm)
- Sin estado complejo
- Sin lógica de negocio

---

### ❌ **INCORRECTO**

```typescript
// ❌ NO HACER ESTO
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      navigate('/home');
    } catch (err) {
      setError(err.message);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      {/* ... más JSX inline ... */}
    </form>
  );
}
```

**❌ Problemas:**
- Lógica de negocio en la page
- Estado local innecesario
- API calls directos
- Sin reutilización
- Difícil de testear

---

## 🔑 **REGLAS DE ORO**

### Context API (Auth)
✅ Login/Register/Logout  
✅ Estado global de usuario  
✅ Token management  
✅ isAuthenticated checks  

❌ Data fetching de perfiles  
❌ CRUD operations  
❌ Business logic  

### React Query (Data Fetching)
✅ GET/POST/PUT/DELETE operations  
✅ Cache y background updates  
✅ Paginación, infinite scroll  
✅ Mutations con optimistic updates  

❌ Estado de autenticación  
❌ Global UI state (modals, theme)  

### Pages
✅ Composition de componentes  
✅ Llamadas a hooks  
✅ Navigation logic  
✅ Conditional rendering simple  

❌ Lógica de negocio  
❌ API calls directos  
❌ Estado complejo  
❌ JSX inline extenso  

---

## 📝 **EJEMPLOS DE USO**

### Crear nueva feature con React Query

```typescript
// 1. Service
export const userService = {
  getAll: async (): Promise<User[]> => {
    const { data } = await apiGo.get('/users');
    return data;
  },
};

// 2. Query
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: userService.getAll,
  });
};

// 3. Page
const UsersPage = () => {
  const { data: users, isLoading } = useUsers();
  
  if (isLoading) return <UsersSkeleton />;
  
  return <UsersList users={users} />;
};
```

### Mutation con React Query

```typescript
// 1. Mutation
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ slug, data }) => userService.update(slug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

// 2. Component
const EditUserForm = ({ slug }) => {
  const { mutate, isPending } = useUpdateUser();
  
  const handleSubmit = (formData) => {
    mutate({ slug, data: formData });
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
};
```

---

## 🚀 **Implementado en este setup**

✅ AuthContext + AuthProvider  
✅ useAuth hook  
✅ Login/Register pages (patrón correcto)  
✅ SignInForm component  
✅ React Query configurado  
✅ profileQueries ejemplo  
✅ ProfilePage ejemplo  
✅ Types separados por dominio  
✅ Services con Axios instance  

---

## 🎯 **Next Steps**

1. **ProtectedRoute component** - Wrapper para rutas privadas
2. **User mutations** - useUpdateUser, useDeleteUser
3. **Admin pages** - Siguiendo mismo patrón
4. **Error boundaries** - Manejo de errores global
5. **Loading states** - Skeletons para todas las pages

---

**Filosofía:** Pages delgadas, componentes tontos, hooks inteligentes, servicios puros.
