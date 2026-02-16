import type { PublicClub } from '@/services/publicClubService';

interface ClubCardProps {
    club: PublicClub;
    colorIndex: number;
}

const colorSchemes = [
    {
        badge: 'bg-emerald-500',
        text: 'text-primary',
        bar: 'bg-primary',
        label: 'Competitive',
    },
    {
        badge: 'bg-purple-500',
        text: 'text-purple-500',
        bar: 'bg-purple-500',
        label: 'Youth',
    },
    {
        badge: 'bg-cyan-500',
        text: 'text-cyan-600 dark:text-cyan-400',
        bar: 'bg-cyan-500',
        label: 'All Levels',
    },
    {
        badge: 'bg-amber-500',
        text: 'text-amber-600 dark:text-amber-500',
        bar: 'bg-amber-500',
        label: 'Elite',
    },
];

export function ClubCard({ club, colorIndex }: ClubCardProps) {
    const colors = colorSchemes[colorIndex % colorSchemes.length];

    return (
        <article className="group relative h-[400px] rounded-2xl overflow-hidden bg-white dark:bg-surface-dark border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all duration-300">
            {/* Imagen */}
            <div className="h-2/3 overflow-hidden relative">
                <img
                    alt={club.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    src={club.logo_url || 'https://via.placeholder.com/400x300?text=Club'}
                    loading="lazy"
                />
                <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full ${colors.badge} text-white text-xs font-bold uppercase tracking-wide shadow-lg`}>
                        {colors.label}
                    </span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            {/* Contenido */}
            <div className="p-6 relative">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{club.name}</h3>
                {club.description && (
                    <p className={`${colors.text} font-medium text-sm mb-3`}>"{club.description}"</p>
                )}

                {/* Barra de progreso animada */}
                <div className="w-full h-1 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full ${colors.bar} w-0 group-hover:w-full transition-all duration-500`}></div>
                </div>
            </div>
        </article>
    );
}
