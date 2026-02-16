import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { DashboardLayout } from './components/admin/DashboardLayout';
import Home from './pages/home/Home';
import ShopPage from './pages/shop/ShopPage';
import PublicClassesPage from './pages/classes/ClassesPage';
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

        {/* Shop/Reservas */}
        <Route
          path="/reservar"
          element={
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1">
                <ShopPage />
              </main>
              <Footer />
            </div>
          }
        />

        {/* Clases públicas */}
        <Route
          path="/clases"
          element={
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1">
                <PublicClassesPage />
              </main>
              <Footer />
            </div>
          }
        />

        {/* Admin Routes - Solo MVP */}
        <Route path="/admin" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
        <Route path="/admin/bookings" element={<DashboardLayout><BookingsPage /></DashboardLayout>} />
        <Route path="/admin/pistas" element={<DashboardLayout><PistasPage /></DashboardLayout>} />
        <Route path="/admin/users" element={<DashboardLayout><UsersPage /></DashboardLayout>} />
        <Route path="/admin/classes" element={<DashboardLayout><AdminClassesPage /></DashboardLayout>} />
        <Route path="/admin/clubs" element={<DashboardLayout><ClubsPage /></DashboardLayout>} />
        <Route path="/admin/subscriptions" element={<DashboardLayout><SubscriptionsPage /></DashboardLayout>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
