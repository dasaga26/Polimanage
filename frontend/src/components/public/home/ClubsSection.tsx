import { usePublicClubsQuery } from '@/queries/clubs/useClubsQuery';
import { ClubCard } from './ClubCard';
import { ArrowRight, Loader2 } from 'lucide-react';

export function ClubsSection() {
    const { data: clubs, isLoading, isError } = usePublicClubsQuery();

    if (isLoading) {
        return (
            <section className="py-20 bg-slate-50 dark:bg-background-dark border-t border-slate-200 dark:border-slate-800">
                <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                </div>
            </section>
        );
    }

    if (isError || !clubs || clubs.length === 0) {
        return null;
    }

    return (
        <section className="py-20 bg-slate-50 dark:bg-background-dark border-t border-slate-200 dark:border-slate-800">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                            Our Sports Clubs
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 text-lg">
                            Join a team, compete, and take your skills to the next level.
                        </p>
                    </div>
                    <a
                        className="flex items-center gap-1 font-bold text-primary hover:text-primary/80 transition-colors"
                        href="#"
                    >
                        See All Clubs <ArrowRight className="h-4 w-4" />
                    </a>
                </div>

                {/* Grid de clubes */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {clubs.map((club, index) => (
                        <ClubCard key={club.id} club={club} colorIndex={index} />
                    ))}
                </div>
            </div>
        </section>
    );
}
