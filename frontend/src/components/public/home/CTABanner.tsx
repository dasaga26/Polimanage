import { useNavigate } from 'react-router-dom';

export function CTABanner() {
  const navigate = useNavigate();

  return (
    <section className="relative py-24 overflow-hidden bg-blue-600">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-500"></div>
      <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-6">
          ¿Listo para Reservar?
        </h2>
        <p className="text-white/90 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
          Accede a nuestras instalaciones deportivas de primera calidad. Reserva tu pista ahora y empieza a disfrutar.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate('/reservar')}
            className="w-full sm:w-auto px-8 py-4 bg-white text-blue-600 font-bold rounded-full text-lg hover:shadow-xl hover:shadow-white/10 hover:-translate-y-1 transition-all"
          >
            Ver Pistas Disponibles
          </button>
          <button
            onClick={() => navigate('/clases')}
            className="w-full sm:w-auto px-8 py-4 bg-transparent border-2 border-white/30 text-white font-bold rounded-full text-lg hover:bg-white/10 transition-colors"
          >
            Inscribirse a una Clase
          </button>
        </div>
      </div>
    </section>
  );
}
