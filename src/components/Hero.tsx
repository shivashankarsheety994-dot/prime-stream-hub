import { VodStream, VodInfo } from "@/lib/xtream";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { getVodInfo } from "@/lib/xtream";
import { useAuth } from "@/context/AuthContext";
import { Star } from "lucide-react";

interface Props {
  movies: VodStream[];
}

export function Hero({ movies }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [vodInfoById, setVodInfoById] = useState<Record<number, VodInfo | null>>({});
  const { user } = useAuth();

  useEffect(() => {
    if (movies.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % movies.length);
      }, 5000); // Change slide every 5 seconds

      return () => clearInterval(interval);
    }
  }, [movies.length]);

  useEffect(() => {
    const fetchHeroInfos = async () => {
      if (!user || movies.length === 0) return;

      const entries = await Promise.all(
        movies.map(async (movie) => [
          movie.stream_id,
          await getVodInfo(user.username, user.password, movie.stream_id),
        ] as const),
      );

      setVodInfoById(Object.fromEntries(entries));
    };

    fetchHeroInfos();
  }, [movies, user]);

  const movie = movies[currentIndex];
  const vodInfo = movie ? vodInfoById[movie.stream_id] : null;
  const isInfoLoading = movie ? !Object.prototype.hasOwnProperty.call(vodInfoById, movie.stream_id) : false;

  if (!movie) return null;

  const rating = movie.rating ? Number(movie.rating) : 0;
  const genreText = vodInfo?.info?.genre ?? (isInfoLoading ? "Loading..." : "");
  const plotText = vodInfo?.info?.plot ?? (isInfoLoading ? "Loading description..." : "");

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
            <div className="flex items-center gap-4 mb-4">
              {rating > 0 && (
                <span className="flex items-center text-yellow-400">
                  <Star className="h-4 w-4 mr-1 fill-yellow-400" />
                  {rating.toFixed(1)}
                </span>
              )}
              <p className="text-white">{vodInfo?.info?.genre ? `${vodInfo.info.genre}` : ''}</p>
            </div>
            <p className="text-white text-sm md:text-base line-clamp-3 mb-4">
              {vodInfo?.info?.plot}
            </p>
            <Link
              to={`/movie/${movie.stream_id}`}
              className="inline-block bg-white text-black px-8 py-3 rounded-md font-semibold hover:bg-gray-200 transition-transform transform hover:scale-105"
            >
              Watch
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}