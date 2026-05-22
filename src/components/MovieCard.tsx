
import { Star } from "lucide-react";
import { VodStream } from "@/lib/xtream";
import { useNavigate } from "react-router-dom";

export function MovieCard({ movie }: { movie: VodStream }) {
  const navigate = useNavigate();
  const rating = movie.rating ? Number(movie.rating) : 0;

  const handleMovieClick = () => {
    navigate(`/movie/${movie.stream_id}`);
  };

  return (
    <button
      type="button"
      onClick={handleMovieClick}
      className="group text-left bg-card rounded-lg shadow-md overflow-hidden transition-transform duration-200 ease-in-out hover:scale-105"
      aria-label={`View details for ${movie.name}`}
    >
      <div className="relative">
        <div className="aspect-[2/3] bg-secondary">
          {movie.stream_icon ? (
            <img
              src={movie.stream_icon}
              alt={`${movie.name} poster`}
              loading="lazy"
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.src = "/placeholder.svg"; }}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs p-2 text-center">
              {movie.name}
            </div>
          )}
        </div>
        {rating > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-1 text-xs text-white bg-black/60 rounded-md px-1.5 py-0.5">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span>{rating.toFixed(1)}</span>
          </div>
        )}
      </div>
      <div className="p-2">
        <p className="text-sm font-medium text-foreground line-clamp-1">{movie.name}</p>
      </div>
    </button>
  );
}
