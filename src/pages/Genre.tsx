import { useEffect, useMemo, useState } from "react";
import { Navigate, useParams, Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { CinemaLoader } from "@/components/CinemaLoader";
import { Header } from "@/components/Header";
import { MovieCard } from "@/components/MovieCard";
import { useAuth } from "@/context/AuthContext";
import {
  getVodStreams,
  getVodInfo,
  getStreamsByGenre,
  VodStream,
  VodCategory,
  parseGenres,
  getVodLanguage,
} from "@/lib/xtream";

export default function Genre() {
  const { genreName } = useParams();
  const { user, credentials, loading } = useAuth();
  const [streams, setStreams] = useState<VodStream[]>([]);
  const [categories, setCategories] = useState<VodCategory[]>([]);
  const [vodInfoMap, setVodInfoMap] = useState<Map<number, any>>(new Map());
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!credentials || !genreName) return;
    let cancelled = false;

    (async () => {
      setDataLoading(true);
      try {
        // Fetch all streams
        const allStreams = await getVodStreams(
          credentials.username,
          credentials.password
        );

        if (!cancelled) {
          setStreams(allStreams);

          // Fetch VOD info for all streams to get genre and language data
          const infoMap = new Map();
          await Promise.all(
            allStreams.map(async (stream) => {
              const info = await getVodInfo(
                credentials.username,
                credentials.password,
                stream.stream_id
              );
              if (!cancelled) {
                infoMap.set(stream.stream_id, info);
              }
            })
          );

          if (!cancelled) {
            setVodInfoMap(infoMap);
          }
        }
      } catch (error) {
        console.error("Error fetching genre data:", error);
      } finally {
        if (!cancelled) {
          setDataLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [credentials, genreName]);

  const decodedGenreName = useMemo(
    () => (genreName ? decodeURIComponent(genreName) : ""),
    [genreName]
  );

  const movies = useMemo(
    () => getStreamsByGenre(streams, vodInfoMap, decodedGenreName),
    [streams, vodInfoMap, decodedGenreName]
  );

  const moviesByLanguage = useMemo(() => {
    const grouped: Record<string, VodStream[]> = {};
    movies.forEach((movie) => {
      const info = vodInfoMap.get(movie.stream_id);
      const language = getVodLanguage(info) || "All Movies";
      if (!grouped[language]) {
        grouped[language] = [];
      }
      grouped[language].push(movie);
    });
    return grouped;
  }, [movies, vodInfoMap]);

  if (loading) return <CinemaLoader fullscreen />;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16 px-4 md:px-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold mb-6 capitalize">
          {decodedGenreName}
        </h1>

        {dataLoading ? (
          <CinemaLoader label={`Loading ${decodedGenreName}`} />
        ) : movies.length === 0 ? (
          <p className="text-muted-foreground py-16 text-center">
            No movies found in this genre.
          </p>
        ) : (
          <div className="space-y-8">
            {Object.entries(moviesByLanguage)
              .sort(([langA], [langB]) => langA.localeCompare(langB))
              .map(([language, languageMovies]) => (
                <div key={language}>
                  <h2 className="text-2xl font-semibold mb-4 text-amber-100">
                    {language}
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {languageMovies.map((movie) => (
                      <div key={movie.stream_id} className="w-full">
                        <MovieCard 
                          movie={movie} 
                          categories={categories}
                          vodLanguage={getVodLanguage(vodInfoMap.get(movie.stream_id))}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </main>
    </div>
  );
}
