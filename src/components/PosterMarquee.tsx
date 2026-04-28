import { VodStream } from "@/lib/xtream";

interface Props { movies: VodStream[]; }

export function PosterMarquee({ movies }: Props) {
  const withPosters = movies.filter((m) => m.stream_icon).slice(0, 20);
  if (withPosters.length === 0) return null;
  const loop = [...withPosters, ...withPosters];

  return (
    <section className="relative h-[60vh] md:h-[70vh] w-full overflow-hidden bg-background pt-16">
      <div className="absolute inset-0 flex items-center">
        <div className="marquee flex gap-4 w-max">
          {loop.map((m, i) => (
            <div
              key={`${m.stream_id}-${i}`}
              className="relative h-[45vh] md:h-[55vh] aspect-[2/3] flex-shrink-0 rounded-md overflow-hidden shadow-[var(--shadow-poster)]"
            >
              <img
                src={m.stream_icon}
                alt={`${m.name} poster`}
                loading="lazy"
                className="h-full w-full object-cover"
                onError={(e) => { (e.currentTarget.style.display = "none"); }}
              />
              <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-background/95 to-transparent">
                <p className="text-sm font-semibold text-foreground line-clamp-1">{m.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute inset-0 pointer-events-none" style={{ background: "var(--gradient-hero)" }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "var(--gradient-side)" }} />
      <div className="absolute inset-x-0 bottom-8 z-10 text-center px-4 animate-fade-in">
        <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-shadow-hero">
          Unlimited <span className="text-primary">Movies</span>, Endless Stories
        </h2>
        <p className="mt-2 text-sm md:text-base text-muted-foreground">Stream the latest blockbusters across every genre.</p>
      </div>
    </section>
  );
}