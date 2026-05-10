import { useEffect, useState } from "react";
import { Play, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VodStream } from "@/lib/xtream";
import { usePlayer } from "@/context/PlayerContext";

interface Props { movies: VodStream[]; }

export function HeroBillboard({ movies }: Props) {
  const { play } = usePlayer();
  const featured = movies.filter((m) => m.stream_icon).slice(0, 6);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (featured.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % featured.length), 7000);
    return () => clearInterval(t);
  }, [featured.length]);

  if (featured.length === 0) return null;
  const movie = featured[idx];

  return (
    <section className="relative h-[85vh] min-h-[500px] w-full overflow-hidden">
      {featured.map((m, i) => (
        <div
          key={m.stream_id}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: i === idx ? 1 : 0 }}
          aria-hidden={i !== idx}
        >
          <img
            src={m.stream_icon}
            alt=""
            className="h-full w-full object-cover scale-110 blur-sm md:blur-none md:scale-100"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        </div>
      ))}
      {/* Cinematic gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />

      {/* Content */}
      <div className="relative z-10 h-full flex items-end md:items-center pb-24 md:pb-0">
        <div key={movie.stream_id} className="px-4 md:px-12 max-w-2xl animate-fade-in">
          <p className="text-primary text-xs md:text-sm tracking-[0.3em] font-semibold mb-3">
            FEATURED MOVIE
          </p>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-shadow-hero mb-4 line-clamp-2">
            {movie.name}
          </h2>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-6">
            {movie.rating && (
              <span className="px-2 py-0.5 border border-border rounded text-foreground/90">
                ★ {movie.rating}
              </span>
            )}
            <span>HD</span>
            <span>•</span>
            <span>Stream Now</span>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" onClick={() => play(movie)} className="text-base font-semibold shadow-[var(--shadow-glow)]">
              <Play className="h-5 w-5 fill-current" /> Play
            </Button>
            <Button size="lg" variant="secondary" onClick={() => play(movie)} className="text-base font-semibold bg-foreground/10 backdrop-blur hover:bg-foreground/20">
              <Info className="h-5 w-5" /> More Info
            </Button>
          </div>
        </div>
      </div>

      {/* Slide indicators */}
      {featured.length > 1 && (
        <div className="absolute bottom-6 right-6 z-10 flex gap-2">
          {featured.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`h-1 rounded-full transition-all ${i === idx ? "w-8 bg-primary" : "w-4 bg-foreground/30 hover:bg-foreground/60"}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}