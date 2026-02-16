import { SearchHero } from './SearchHero';
import { useNavigate } from 'react-router-dom';

export function HeroSection() {
  const navigate = useNavigate();

  return (
    <header className="relative w-full bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 dark:bg-gray-900 pt-12 pb-20 lg:pt-20 lg:pb-32 overflow-hidden">
      {/* Decorative Gradients */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center text-center gap-8">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 text-blue-600 border border-blue-200 dark:border-blue-800">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-600 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </span>
            <span className="text-sm font-bold">Abierto hasta las 22:00</span>
          </div>

          {/* Main Title */}
          <div className="max-w-4xl">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] text-gray-900 dark:text-white mb-6">
              Reserva tu Pista{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-500">
                Deportiva
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10">
              Accede a las mejores instalaciones deportivas. Pádel, Tenis, Fútbol Sala y más. Reserva en segundos.
            </p>
          </div>

          {/* Search Bar */}
          <SearchHero />

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-4 justify-center pt-6">
            <button
              onClick={() => navigate('/reservar')}
              className="h-12 px-8 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold hover:scale-105 transition-transform shadow-lg"
            >
              Ver Todas las Pistas
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-12 pt-12 max-w-2xl w-full">
            <div className="text-center">
              <p className="text-4xl font-black text-gray-900 dark:text-white mb-1">6</p>
              <p className="text-sm text-gray-500 font-medium">Deportes</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-black text-gray-900 dark:text-white mb-1">20+</p>
              <p className="text-sm text-gray-500 font-medium">Pistas</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-black text-gray-900 dark:text-white mb-1">24/7</p>
              <p className="text-sm text-gray-500 font-medium">Disponible</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
