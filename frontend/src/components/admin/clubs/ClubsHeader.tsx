import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ClubsHeaderProps {
    onCreateClick: () => void;
}

export function ClubsHeader({ onCreateClick }: ClubsHeaderProps) {
    return (
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Clubs</h1>
                <p className="text-gray-600 mt-1">Gestiona los clubs deportivos y sus miembros</p>
            </div>
            <Button onClick={onCreateClick} className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Nuevo Club
            </Button>
        </div>
    );
}
