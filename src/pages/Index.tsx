import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { CinemaLoader } from "@/components/CinemaLoader";
import { useAuth } from "@/context/AuthContext";
import { Header } from "@/components/Header";
import { MovieCard } from "@/components/MovieCard";
import { getVodStreams, VodStream } from "@/lib/xtream";
import { GenreRow } from "@/components/GenreRow";
import { PosterMarquee } from "@/components/PosterMarquee";
import { Top5Row } from "@/components/Top5Row";

export default function Index() {
  const { user, credentials, loading } = useAuth();
  const [streams, setStreams] = useState<VodStream[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!credentials) return;
    let cancelled = false;
    (async () => {
      setDataLoading(true);
      const vods = await getVodStreams(credentials.username, credentials.password);
      if (!cancelled) {
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

  const topRatedStreams = useMemo(() => {
    return [...streams].sort((a, b) => {
      const aR = a.rating ? Number(a.rating) : 0;
      const bR = b.rating ? Number(b.rating) : 0;
      return bR - aR;
    });
  }, [streams]);

  if (loading) {
    return <CinemaLoader fullscreen />;
  }
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pb-16 pt-16 relative z-10">
        {dataLoading ? (
          <CinemaLoader label="Loading movies" />
        ) : streams.length === 0 ? (
          <div className="text-center py-32 px-4">
            <h2 className="text-2xl font-bold mb-2">No movies available</h2>
            <p className="text-muted-foreground">Your account is signed in, but no movie catalog was returned by the API.</p>
          </div>
        ) : (
          <>
            <PosterMarquee movies={sortedStreams} />
            <Top5Row movies={sortedStreams} title="Top 5 New Releases" />
            <Top5Row movies={topRatedStreams} title="Top 5 Rated" />
            <h2 className="text-xl font-bold px-4 mt-6">Recently Added</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4 p-4">
              {sortedStreams.slice(0, 40).map((movie) => (
                <MovieCard key={movie.stream_id} movie={movie} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
