import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

export function SearchHero() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/reservar?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/reservar');
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-2xl">
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar pistas por nombre, deporte o ubicación..."
          className="w-full h-14 pl-14 pr-4 rounded-full border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-lg font-medium focus:ring-2 focus:ring-blue-600 focus:border-transparent shadow-lg transition-all placeholder:text-gray-400"
        />
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-6 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-md"
        >
          Buscar
        </button>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 text-center">
        Explora nuestras instalaciones de Pádel, Tenis, Fútbol Sala y más
      </p>
    </form>
  );
}
