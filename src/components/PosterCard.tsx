import { useState } from "react";
import { Star } from "lucide-react";
import { VodStream } from "@/lib/xtream";
import { usePlayer } from "@/context/PlayerContext";
import { Skeleton } from "@/components/ui/skeleton";

export function PosterCard({ movie }: { movie: VodStream }) {
  const { play } = usePlayer();
  const [loaded, setLoaded] = useState(false);
  const rating = movie.rating ? Number(movie.rating) : 0;
  const hasImage = Boolean(movie.stream_icon);

  return (
    <button
      type="button"
      onClick={() => play(movie)}
      className="group relative w-24 sm:w-28 md:w-32 lg:w-36 aspect-[2/3] rounded-lg overflow-hidden bg-secondary shadow-md transition-transform duration-200 ease-in-out hover:scale-105 flex-shrink-0"
      aria-label={`Play ${movie.name}`}
    >
      <div className="h-full w-full relative bg-muted">
        {hasImage && !loaded && <Skeleton className="absolute inset-0" />}
        {hasImage ? (
          <img
            src={movie.stream_icon}
            alt={`${movie.name} poster`}
            loading="lazy"
            className={`h-full w-full object-cover transition-opacity duration-300 ease-in-out ${loaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setLoaded(true)}
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg";
              setLoaded(true);
            }}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs p-2 text-center font-bold">
            {movie.name}
          </div>
        )}
      </div>
      {rating > 0 && (
        <div className="absolute top-1 right-1 flex items-center gap-1 text-xs text-white bg-black/60 rounded-md px-1.5 py-0.5">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          <span>{rating.toFixed(1)}</span>
        </div>
      )}
    </button>
  );
}
