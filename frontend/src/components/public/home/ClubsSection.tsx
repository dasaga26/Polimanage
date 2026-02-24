import { useState, useEffect, useCallback } from 'react';
import { usePublicClubsQuery } from '@/queries/clubs/useClubsQuery';
import { ClubCard } from './ClubCard';
import { ArrowRight, ArrowLeft, ChevronRight, Loader2 } from 'lucide-react';

// Cuántas tarjetas se ven a la vez (desktop)
const SPV = 4;
const INTERVAL_MS = 3500;

export function ClubsSection() {
    const { data: clubs, isLoading, isError } = usePublicClubsQuery();
    const [isPaused, setIsPaused] = useState(false);
    // El índice incluye el offset de los clones iniciales
    const [idx, setIdx] = useState(SPV);
    // Cuando hacemos el salto silencioso desactivamos la transición
    const [animated, setAnimated] = useState(true);

    const total = clubs?.length ?? 0;

    // Lista extendida: [últimos SPV clones] + [todos] + [primeros SPV clones]
    // Permite deslizar sin saltos visibles en los extremos
    const extended = clubs
        ? [...clubs.slice(-SPV), ...clubs, ...clubs.slice(0, SPV)]
        : [];

    // Cuando termina la transición, si estamos en zona de clon → salto silencioso
    const onTransitionEnd = useCallback(() => {
        if (total === 0) return;
        if (idx >= total + SPV) {
            setAnimated(false);
            setIdx(SPV);
        } else if (idx < SPV) {
            setAnimated(false);
            setIdx(total + SPV - 1);
        }
    }, [idx, total]);

    // Reactivar animación tras el salto (necesita dos frames para que el DOM aplique)
    useEffect(() => {
        if (!animated) {
            const raf = requestAnimationFrame(() =>
                requestAnimationFrame(() => setAnimated(true))
            );
            return () => cancelAnimationFrame(raf);
        }
    }, [animated]);

    const next = useCallback(() => { setAnimated(true); setIdx((i) => i + 1); }, []);
    const prev = useCallback(() => { setAnimated(true); setIdx((i) => i - 1); }, []);

    // Auto-avance
    useEffect(() => {
        if (isPaused || total === 0) return;
        const id = setInterval(next, INTERVAL_MS);
        return () => clearInterval(id);
    }, [next, isPaused, total]);

    // Índice real para los dots (mod total)
    const realIdx = total > 0 ? ((idx - SPV) % total + total) % total : 0;

    const translateX = -(idx * (100 / SPV));

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

    if (isError || !clubs || clubs.length === 0) return null;

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
                        href="/clubs"
                    >
                        See All Clubs <ArrowRight className="h-4 w-4" />
                    </a>
                </div>

                {/* Carrusel */}
                <div
                    className="relative"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    {/* Viewport — overflow oculta los clones */}
                    <div className="overflow-hidden">
                        <div
                            className="flex"
                            style={{
                                transform: `translateX(${translateX}%)`,
                                transition: animated ? 'transform 500ms ease-in-out' : 'none',
                            }}
                            onTransitionEnd={onTransitionEnd}
                        >
                            {extended.map((club, i) => (
                                <div
                                    key={`${club.id}-${i}`}
                                    className="w-full sm:w-1/2 lg:w-1/4 flex-shrink-0 px-3"
                                >
                                    <ClubCard club={club} colorIndex={i % clubs.length} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Flechas */}
                    <button
                        onClick={prev}
                        aria-label="Anterior"
                        className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-surface-dark shadow-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-primary hover:text-white hover:border-primary transition-all duration-200"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </button>
                    <button
                        onClick={next}
                        aria-label="Siguiente"
                        className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-surface-dark shadow-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-primary hover:text-white hover:border-primary transition-all duration-200"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>

                {/* Dots */}
                <div className="flex items-center justify-center gap-2 mt-8">
                    {clubs.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => { setAnimated(true); setIdx(SPV + i); }}
                            aria-label={`Ir al club ${i + 1}`}
                            className={`rounded-full transition-all duration-300 ${
                                i === realIdx
                                    ? 'w-6 h-2 bg-primary'
                                    : 'w-2 h-2 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400'
                            }`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
