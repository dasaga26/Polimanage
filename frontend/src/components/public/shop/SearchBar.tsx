import { Search, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Buscar pistas...' }: SearchBarProps) {
  return (
    <div className="space-y-2">
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg blur-sm opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
        <div className="relative bg-white rounded-lg border-2 border-gray-200 focus-within:border-blue-500 transition-colors">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          <Input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="pl-12 pr-4 h-14 text-base border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
          />
          {value && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <Sparkles className="h-4 w-4 text-blue-500 animate-pulse" />
            </div>
          )}
        </div>
      </div>
      <p className="text-xs text-gray-500 pl-1 flex items-center gap-1.5">
        <Search className="h-3 w-3" />
        Busca por nombre, ubicación o tipo de instalación
      </p>
    </div>
  );
}
