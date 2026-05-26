import { VodStream } from "@/lib/xtream";
import { useNavigate } from "react-router-dom";

interface Props {
  movies: VodStream[];
  title: string;
}

export function Top5Row({ movies, title }: Props) {
  const navigate = useNavigate();
  const top = movies.slice(0, 5);
  if (!top.length) return null;

  return (
    <section className="py-4 md:py-6">
      <h3 className="px-4 md:px-8 text-xl md:text-2xl font-bold mb-3 tracking-wide">
        {title}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8 px-8 pb-4">
        {top.map((m, i) => (
          <button
            key={m.stream_id}
            type="button"
            onClick={() => navigate(`/movie/${m.stream_id}`)}
            className="group relative flex-shrink-0 cursor-pointer"
            aria-label={`View details for ${m.name}`}
          >
            <div className="relative w-full aspect-[2/3] rounded-md overflow-hidden bg-secondary shadow-[var(--shadow-poster)] transition-transform group-hover:scale-105 z-10">
              {m.stream_icon ? (
                <img
                  src={m.stream_icon}
                  alt={`${m.name} poster`}
                  loading="lazy"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs p-2 text-center">
                  {m.name}
                </div>
              )}
            </div>
            <span
              aria-hidden
              className="absolute -bottom-4 -left-6 font-black leading-none select-none text-transparent z-0"
              style={{
                fontSize: "clamp(8rem, 20vw, 15rem)",
                WebkitTextStroke: "2px hsl(var(--primary))",
              }}
            >
              {i + 1}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
