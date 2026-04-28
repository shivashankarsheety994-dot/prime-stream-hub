import { Star } from "lucide-react";
import { VodStream } from "@/lib/xtream";

export function MovieCard({ movie }: { movie: VodStream }) {
  return (
    <div className="group relative flex-shrink-0 w-36 md:w-44 cursor-pointer transition-[var(--transition-smooth)] hover:scale-105 hover:z-10">
      <div className="aspect-[2/3] rounded-md overflow-hidden bg-secondary shadow-[var(--shadow-poster)]">
        {movie.stream_icon ? (
          <img
            src={movie.stream_icon}
            alt={`${movie.name} poster`}
            loading="lazy"
            className="h-full w-full object-cover transition-[var(--transition-smooth)] group-hover:brightness-110"
            onError={(e) => { e.currentTarget.src = "/placeholder.svg"; }}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs p-2 text-center">
            {movie.name}
          </div>
        )}
      </div>
      <div className="mt-2 px-1">
        <p className="text-sm font-medium text-foreground line-clamp-1">{movie.name}</p>
        {movie.rating && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
            <Star className="h-3 w-3 fill-primary text-primary" />
            <span>{movie.rating}</span>
          </div>
        )}
      </div>
    </div>
  );
}