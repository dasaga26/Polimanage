import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { DashboardLayout } from './components/admin/DashboardLayout';
import GuardAdmin from './components/auth/guard_admin';
import GuardAuth from './components/auth/guard_auth';
import { ClientRoute } from './components/auth/ClientRoute';
import Home from './pages/home/Home';
import ShopPage from './pages/shop/ShopPage';
import PublicClassesPage from './pages/classes/ClassesPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import MyProfilePage from './pages/profile/MyProfilePage';
import Dashboard from './pages/admin/Dashboard';
import UsersPage from './pages/admin/UsersPage';
import PistasPage from './pages/admin/PistasPage';
import BookingsPage from './pages/admin/BookingsPage';
import AdminClassesPage from './pages/admin/ClassesPage';
import ClubsPage from './pages/admin/ClubsPage';
import PublicClubsPage from './pages/clubs/ClubsPage';
import SubscriptionsPage from './pages/admin/SubscriptionsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1">
                <Home />
              </main>
              <Footer />
            </div>
          }
        />

        {/* Shop/Reservas - Solo clientes */}
        <Route
          path="/reservar"
          element={
            <ClientRoute>
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1">
                  <ShopPage />
                </main>
                <Footer />
              </div>
            </ClientRoute>
          }
        />

        {/* Clubs públicos */}
        <Route
          path="/clubs"
          element={
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1">
                <PublicClubsPage />
              </main>
              <Footer />
            </div>
          }
        />

        {/* Clases públicas - Solo clientes */}
        <Route
          path="/clases"
          element={
            <ClientRoute>
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1">
                  <PublicClassesPage />
                </main>
                <Footer />
              </div>
            </ClientRoute>
          }
        />

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* My Profile - Usuario autenticado */}
        <Route
          path="/mi-perfil"
          element={
            <GuardAuth>
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1">
                  <MyProfilePage />
                </main>
                <Footer />
              </div>
            </GuardAuth>
          }
        />

        {/* Admin Routes - Solo ADMIN puede acceder */}
        <Route path="/admin" element={<GuardAdmin><DashboardLayout><Dashboard /></DashboardLayout></GuardAdmin>} />
        <Route path="/admin/bookings" element={<GuardAdmin><DashboardLayout><BookingsPage /></DashboardLayout></GuardAdmin>} />
        <Route path="/admin/pistas" element={<GuardAdmin><DashboardLayout><PistasPage /></DashboardLayout></GuardAdmin>} />
        <Route path="/admin/users" element={<GuardAdmin><DashboardLayout><UsersPage /></DashboardLayout></GuardAdmin>} />
        <Route path="/admin/classes" element={<GuardAdmin><DashboardLayout><AdminClassesPage /></DashboardLayout></GuardAdmin>} />
        <Route path="/admin/clubs" element={<GuardAdmin><DashboardLayout><ClubsPage /></DashboardLayout></GuardAdmin>} />
        <Route path="/admin/subscriptions" element={<GuardAdmin><DashboardLayout><SubscriptionsPage /></DashboardLayout></GuardAdmin>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
