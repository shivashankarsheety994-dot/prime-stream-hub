
import { useState } from "react";
import { Star } from "lucide-react";
import { VodStream, VodCategory } from "@/lib/xtream";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { getStreamLanguages } from "@/lib/languages";

export function MovieCard({ 
  movie, 
  categories = [],
  vodLanguage 
}: { 
  movie: VodStream; 
  categories?: VodCategory[];
  vodLanguage?: string;
}) {
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);
  const rating = movie.rating ? Number(movie.rating) : 0;
  const hasImage = Boolean(movie.stream_icon);
  const languages = getStreamLanguages(movie, categories);
  const displayLanguage = vodLanguage?.trim() || null;

  const handleMovieClick = () => {
    navigate(`/movie/${movie.stream_id}`);
  };

  return (
    <button
      type="button"
      onClick={handleMovieClick}
      className="group text-left bg-card rounded-lg shadow-md overflow-hidden transition-transform duration-200 ease-in-out hover:scale-105 w-full"
      aria-label={`View details for ${movie.name}`}
    >
      <div className="relative">
        <div className="aspect-[2/3] bg-muted overflow-hidden">
          {hasImage && !loaded && <Skeleton className="absolute inset-0" />}
          {hasImage ? (
            <img
              src={movie.stream_icon}
              alt={`${movie.name} poster`}
              loading="lazy"
              className={`w-full h-full object-cover transition-opacity duration-300 ease-in-out ${loaded ? "opacity-100" : "opacity-0"}`}
              onLoad={() => setLoaded(true)}
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg";
                setLoaded(true);
              }}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-black text-xs p-2 text-center">
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
        <p className="text-sm font-bold text-white line-clamp-1">{movie.name}</p>
        {displayLanguage ? (
          <p className="text-xs text-amber-300 line-clamp-1 mt-1 font-medium">
            {displayLanguage}
          </p>
        ) : languages.length > 0 ? (
          <p className="text-xs text-gray-400 line-clamp-1 mt-1">
            {languages.map((lang) => lang.english).join(", ")}
          </p>
        ) : null}
      </div>
    </button>
  );
}
