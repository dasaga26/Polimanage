import { NewsCard } from './NewsCard';
import { SchedulePreview } from './SchedulePreview';

const newsItems = [
  {
    image: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=800&auto=format&fit=crop',
    category: 'Evento',
    categoryColor: 'bg-blue-600/10 text-blue-600',
    date: '24 Oct, 2023',
    title: 'Registro Abierto para Campeonato de Natación de Verano',
    description:
      '¡El campeonato anual está de vuelta! Asegura tu lugar para la próxima temporada. Clases disponibles para todas las edades y niveles de habilidad.',
  },
  {
    image: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&auto=format&fit=crop',
    category: 'Instalación',
    categoryColor: 'bg-green-500/10 text-green-600 dark:text-green-400',
    date: '20 Oct, 2023',
    title: 'Expansión del Gimnasio: Nueva Zona de Cardio',
    description:
      'Hemos añadido 200m² de nuevo equipamiento de cardio. Ven a ver las nuevas cintas de correr y máquinas de remo.',
  },
];

export function NewsSection() {
  return (
    <section className="py-20 bg-slate-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* News Column */}
          <div className="flex-1">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-8">
              Últimas Noticias y Actualizaciones
            </h2>
            <div className="flex flex-col gap-6">
              {newsItems.map((news) => (
                <NewsCard key={news.title} {...news} />
              ))}
            </div>
          </div>

          {/* Sidebar / Schedule Preview */}
          <SchedulePreview />
        </div>
      </div>
    </section>
  );
}
