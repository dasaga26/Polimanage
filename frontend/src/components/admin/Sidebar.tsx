import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  MapPin,
  Users,
  GraduationCap,
  UserPlus,
  CreditCard,
  LogOut,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface SidebarProps {
  isOpen?: boolean;
}

const navigation = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/bookings', label: 'Reservas', icon: Calendar },
  { path: '/admin/classes', label: 'Clases', icon: GraduationCap },
  { path: '/admin/clubs', label: 'Clubs', icon: UserPlus },
  { path: '/admin/subscriptions', label: 'Subscripciones', icon: CreditCard },
  { path: '/admin/pistas', label: 'Pistas', icon: MapPin },
  { path: '/admin/users', label: 'Usuarios', icon: Users },
];

export function Sidebar({ isOpen = true }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-gray-900 text-white transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'
        } overflow-y-auto z-50`}
    >
      <div className="p-6">
        <h1 className={`font-bold text-xl mb-8 ${!isOpen && 'hidden'}`}>
          PoliManage Admin
        </h1>
        {!isOpen && <div className="text-2xl font-bold mb-8">PM</div>}
      </div>

      <nav className="px-4 flex flex-col h-[calc(100vh-112px)]">
        <div className="flex-1">
          {navigation.map((route) => {
            const Icon = route.icon;
            const isActive = location.pathname === route.path;

            return (
              <Link
                key={route.path}
                to={route.path}
                className={`flex items-center gap-4 px-4 py-3 mb-2 rounded-lg transition-colors ${isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
                  }`}
              >
                <Icon size={20} />
                {isOpen && <span>{route.label}</span>}
              </Link>
            );
          })}
        </div>

        {/* Acciones inferiores */}
        <div className="pb-6 border-t border-gray-700 pt-4 space-y-1">
          <Link
            to="/"
            className="flex items-center gap-4 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            {isOpen && <span>Volver al sitio</span>}
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-lg text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-colors"
          >
            <LogOut size={20} />
            {isOpen && <span>Cerrar sesión</span>}
          </button>
        </div>
      </nav>
    </aside>
  );
}
