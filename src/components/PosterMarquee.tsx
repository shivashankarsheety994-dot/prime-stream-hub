import { VodStream } from "@/lib/xtream";
import { usePlayer } from "@/context/PlayerContext";
import { Play } from "lucide-react";

interface Props { movies: VodStream[]; }

export function PosterMarquee({ movies }: Props) {
  const { play } = usePlayer();
  const withPosters = movies.filter((m) => m.stream_icon).slice(0, 20);
  if (withPosters.length === 0) return null;
  const loop = [...withPosters, ...withPosters];

  return (
    <section className="relative h-[60vh] md:h-[70vh] w-full overflow-hidden bg-background pt-16">
      <div className="absolute inset-0 flex items-center">
        <div className="marquee flex gap-4 w-max">
          {loop.map((m, i) => (
            <button
              type="button"
              onClick={() => play(m)}
              key={`${m.stream_id}-${i}`}
              className="group relative h-[45vh] md:h-[55vh] aspect-[2/3] flex-shrink-0 rounded-md overflow-hidden shadow-[var(--shadow-poster)] cursor-pointer"
              aria-label={`Play ${m.name}`}
            >
              <img
                src={m.stream_icon}
                alt={`${m.name} poster`}
                loading="lazy"
                className="h-full w-full object-cover"
                onError={(e) => { (e.currentTarget.style.display = "none"); }}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="rounded-full bg-primary p-4 shadow-lg">
                  <Play className="h-7 w-7 fill-primary-foreground text-primary-foreground" />
                </span>
              </div>
              <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-background/95 to-transparent">
                <p className="text-sm font-semibold text-foreground line-clamp-1">{m.name}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="absolute inset-0 pointer-events-none" style={{ background: "var(--gradient-hero)" }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "var(--gradient-side)" }} />
      <div className="absolute inset-x-0 bottom-8 z-10 text-center px-4 animate-fade-in">
        <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-shadow-hero">
          Primeflix
        </h2>
        <p className="mt-2 text-sm md:text-base text-muted-foreground">Your Destination for Unlimited Entertainment</p>
      </div>
    </section>
  );
}