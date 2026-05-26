import { VodStream } from "@/lib/xtream";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

interface Props {
  movies: VodStream[];
}

export function Hero({ movies }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (movies.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % movies.length);
      }, 5000); // Change slide every 5 seconds

      return () => clearInterval(interval);
    }
  }, [movies.length]);

  const movie = movies[currentIndex];

  if (!movie) return null;

  return (
    <div className="relative w-full h-[50vh] md:h-[80vh] bg-black">
      {/* Fading background images */}
      {movies.map((m, index) => (
        <div
          key={m.stream_id}
          className={`absolute inset-0 bg-cover bg-top transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-30' : 'opacity-0'}`}
          style={{ backgroundImage: `url(${m.stream_icon})` }}
        ></div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 lg:p-12">
        <div className="w-full md:w-1/2 lg:w-1/3">
          <div key={currentIndex} className="animate-fade-in">
            <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg mb-4">
              {movie.name}
            </h1>
            <p className="text-white text-sm md:text-base line-clamp-3 mb-4">
              {/* Placeholder for movie description - will need to be added if available in the API */}
            </p>
            <Link
              to={`/movie/${movie.stream_id}`}
              className="inline-block bg-red-600 text-white px-8 py-3 rounded-md font-semibold hover:bg-red-700 transition-colors"
            >
              Play
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
