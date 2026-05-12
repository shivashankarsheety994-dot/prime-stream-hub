import { VodStream } from "@/lib/xtream";
import { usePlayer } from "@/context/PlayerContext";
import { Play } from "lucide-react";

interface Props { movies: VodStream[]; }

export function Top5Row({ movies }: Props) {
  const { play } = usePlayer();
  const top = movies.slice(0, 5);
  if (!top.length) return null;

  return (
    <section className="py-4 md:py-6">
      <h3 className="px-4 md:px-8 text-xl md:text-2xl font-bold mb-3 tracking-wide">
        Top 5 New Releases
      </h3>
      <div className="flex gap-2 md:gap-4 overflow-x-auto scrollbar-hide px-4 md:px-8 pb-4">
        {top.map((m, i) => (
          <button
            key={m.stream_id}
            type="button"
            onClick={() => play(m)}
            className="group relative flex-shrink-0 flex items-end cursor-pointer"
            aria-label={`Play ${m.name}`}
          >
            <span
              aria-hidden
              className="font-black leading-none select-none text-transparent -mr-4 md:-mr-8"
              style={{
                fontSize: "clamp(6rem, 18vw, 13rem)",
                WebkitTextStroke: "3px hsl(var(--primary))",
                textShadow: "0 8px 24px hsl(var(--primary) / 0.35)",
              }}
            >
              {i + 1}
            </span>
            <div className="relative w-28 md:w-40 aspect-[2/3] rounded-md overflow-hidden bg-secondary shadow-[var(--shadow-poster)] transition-transform group-hover:scale-105">
              {m.stream_icon ? (
                <img
                  src={m.stream_icon}
                  alt={`${m.name} poster`}
                  loading="lazy"
                  className="h-full w-full object-cover"
                  onError={(e) => { e.currentTarget.src = "/placeholder.svg"; }}
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs p-2 text-center">
                  {m.name}
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="rounded-full bg-primary p-3 shadow-lg">
                  <Play className="h-5 w-5 fill-primary-foreground text-primary-foreground" />
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}