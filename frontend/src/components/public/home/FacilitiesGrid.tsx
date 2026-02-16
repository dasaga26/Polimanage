import { FacilityCard } from './FacilityCard';
import { useNavigate } from 'react-router-dom';

const facilities = [
  {
    image: 'https://images.unsplash.com/photo-1622163642998-1ea32b0bbc67?w=800&auto=format&fit=crop',
    icon: '🎾',
    title: 'Pádel',
    description: 'Pistas profesionales de pádel',
    deporte: 'Pádel',
  },
  {
    image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&auto=format&fit=crop',
    icon: '🎾',
    title: 'Tenis',
    description: 'Canchas de tenis de alta calidad',
    deporte: 'Tenis',
  },
  {
    image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&auto=format&fit=crop',
    icon: '⚽',
    title: 'Fútbol Sala',
    description: 'Canchas indoor de fútbol sala',
    deporte: 'Fútbol Sala',
  },
  {
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop',
    icon: '🏀',
    title: 'Baloncesto',
    description: 'Canchas de baloncesto reglamentarias',
    deporte: 'Baloncesto',
  },
  {
    image: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&auto=format&fit=crop',
    icon: '🏐',
    title: 'Voleibol',
    description: 'Pistas de voleibol profesionales',
    deporte: 'Voleibol',
  },
  {
    image: 'https://img.olympics.com/images/image/private/t_16-9_640/f_auto/v1538355600/primary/rvsbmt3oazavh5ddavbg',
    icon: '🎾',
    title: 'Squash',
    description: 'Canchas de squash modernas',
    deporte: 'Squash',
  },
];

export function FacilitiesGrid() {
  const navigate = useNavigate();

  const handleFacilityClick = (deporte: string) => {
    navigate(`/reservar?deporte=${encodeURIComponent(deporte)}`);
  };

  return (
    <section className="py-20 bg-white dark:bg-gray-800">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-2">
              Nuestros Deportes
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Descubre todas las instalaciones deportivas disponibles
            </p>
          </div>
          <button
            onClick={() => navigate('/reservar')}
            className="flex items-center gap-1 font-bold text-blue-600 hover:text-blue-700 transition-colors"
          >
            Ver Todas las Pistas <span>→</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilities.map((facility) => (
            <div key={facility.title} onClick={() => handleFacilityClick(facility.deporte)}>
              <FacilityCard {...facility} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
