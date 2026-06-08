import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { CinemaLoader } from "@/components/CinemaLoader";
import { useAuth } from "@/context/AuthContext";
import { Header } from "@/components/Header";
import { MovieCard } from "@/components/MovieCard";
import { getVodStreams, getVodCategories, VodStream, VodCategory } from "@/lib/xtream";
import { Hero } from "@/components/Hero";

export default function Index() {
  const { user, credentials, loading } = useAuth();
  const [streams, setStreams] = useState<VodStream[]>([]);
  const [categories, setCategories] = useState<VodCategory[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!credentials) return;
    let cancelled = false;
    (async () => {
      setDataLoading(true);
      const [cats, vods] = await Promise.all([
        getVodCategories(credentials.username, credentials.password),
        getVodStreams(credentials.username, credentials.password),
      ]);
      if (!cancelled) {
        setCategories(cats);
        setStreams(vods);
        setDataLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [credentials]);

  const sortedStreams = useMemo(() => {
    return [...streams].sort((a, b) => {
      const aT = a.added ? parseInt(a.added, 10) : 0;
      const bT = b.added ? parseInt(b.added, 10) : 0;
      return bT - aT;
    });
  }, [streams]);

  const heroMovies = useMemo(() => {
    return sortedStreams.slice(0, 5);
  }, [sortedStreams]);

  if (loading) {
    return <CinemaLoader fullscreen />;
  }
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />
      <main className="relative z-10">
        {dataLoading ? (
          <CinemaLoader label="Loading movies" />
        ) : streams.length === 0 ? (
          <div className="text-center py-32 px-4">
            <h2 className="text-2xl font-bold mb-2">No movies available</h2>
            <p className="text-muted-foreground">Your account is signed in, but no movie catalog was returned by the API.</p>
          </div>
        ) : (
          <>
            {heroMovies.length > 0 && <Hero movies={heroMovies} />}
            <div className="px-4 mt-6">
              <h2 className="text-xl font-bold">Latest Releases</h2>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 p-4">
              {sortedStreams.map((movie) => (
                <MovieCard key={movie.stream_id} movie={movie} categories={categories} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
