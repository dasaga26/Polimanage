interface ScheduleItem {
  time: string;
  period: string;
  title: string;
  location: string;
  instructor: string;
  intensity: string;
  intensityColor: string;
}

const scheduleItems: ScheduleItem[] = [
  {
    time: '02',
    period: 'PM',
    title: 'HIIT Training',
    location: 'Estudio B',
    instructor: 'Sarah J.',
    intensity: 'Alta Intensidad',
    intensityColor: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  },
  {
    time: '04',
    period: 'PM',
    title: 'Aqua Aeróbicos',
    location: 'Piscina Principal',
    instructor: 'Mike T.',
    intensity: 'Bajo Impacto',
    intensityColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  },
  {
    time: '06',
    period: 'PM',
    title: 'Power Yoga',
    location: 'Estudio A',
    instructor: 'Emma W.',
    intensity: 'Flexibilidad',
    intensityColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  },
];

export function SchedulePreview() {
  return (
    <div className="w-full lg:w-96 shrink-0">
      <div className="sticky top-24">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Horario de Hoy</h3>
            <a href="#" className="text-xs font-bold text-blue-600">
              Ver Completo
            </a>
          </div>

          <div className="space-y-4">
            {scheduleItems.map((item, index) => (
              <div
                key={index}
                className={`flex gap-4 items-start ${
                  index < scheduleItems.length - 1
                    ? 'pb-4 border-b border-gray-100 dark:border-gray-700'
                    : ''
                }`}
              >
                <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white shrink-0">
                  <span className="text-xs font-bold uppercase text-gray-500">{item.period}</span>
                  <span className="text-lg font-black">{item.time}</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">{item.title}</h4>
                  <p className="text-sm text-gray-500 mb-1">
                    {item.location} • con {item.instructor}
                  </p>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${item.intensityColor}`}
                  >
                    {item.intensity}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-6 py-3 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 font-bold hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-sm">
            + Reservar una Clase
          </button>
        </div>
      </div>
    </div>
  );
}
