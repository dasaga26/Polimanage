import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { DashboardLayout } from './components/admin/DashboardLayout';
import { AdminRoute } from './components/auth/AdminRoute';
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
            <ClientRoute>
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1">
                  <MyProfilePage />
                </main>
                <Footer />
              </div>
            </ClientRoute>
          }
        />

        {/* Admin Routes - Solo ADMIN puede acceder */}
        <Route path="/admin" element={<AdminRoute><DashboardLayout><Dashboard /></DashboardLayout></AdminRoute>} />
        <Route path="/admin/bookings" element={<AdminRoute><DashboardLayout><BookingsPage /></DashboardLayout></AdminRoute>} />
        <Route path="/admin/pistas" element={<AdminRoute><DashboardLayout><PistasPage /></DashboardLayout></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><DashboardLayout><UsersPage /></DashboardLayout></AdminRoute>} />
        <Route path="/admin/classes" element={<AdminRoute><DashboardLayout><AdminClassesPage /></DashboardLayout></AdminRoute>} />
        <Route path="/admin/clubs" element={<AdminRoute><DashboardLayout><ClubsPage /></DashboardLayout></AdminRoute>} />
        <Route path="/admin/subscriptions" element={<AdminRoute><DashboardLayout><SubscriptionsPage /></DashboardLayout></AdminRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
