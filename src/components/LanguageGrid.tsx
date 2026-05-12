import { VodStream } from "@/lib/xtream";
import { MovieCard } from "./MovieCard";

interface Props {
  nativeLabel: string;
  englishLabel: string;
  movies: VodStream[];
}

export function LanguageGrid({ nativeLabel, englishLabel, movies }: Props) {
  if (!movies.length) return null;
  const items = movies.slice(0, 16);

  return (
    <section className="py-4 md:py-6 px-4 md:px-8">
      <div className="inline-block bg-white px-4 py-2 rounded-md mb-4 shadow-sm">
        <h3 className="text-xl md:text-2xl font-bold tracking-wide" style={{ color: "hsl(0 0% 25%)" }}>
          {nativeLabel}
          <span className="ml-2 text-sm font-medium" style={{ color: "hsl(0 0% 40%)" }}>
            {englishLabel} ({movies.length})
          </span>
        </h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
        {items.map((m) => (
          <div key={m.stream_id} className="w-full">
            <MovieCard movie={m} />
          </div>
        ))}
      </div>
    </section>
  );
}