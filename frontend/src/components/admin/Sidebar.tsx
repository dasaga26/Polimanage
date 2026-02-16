import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  MapPin,
  Users,
  GraduationCap,
  UserPlus,
  CreditCard
} from 'lucide-react';

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

      <nav className="px-4">
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
      </nav>
    </aside>
  );
}
