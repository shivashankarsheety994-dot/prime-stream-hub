import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { CinemaLoader } from "@/components/CinemaLoader";
import { MovieCard } from "@/components/MovieCard";
import { useAuth } from "@/context/AuthContext";
import { getVodCategories, getVodStreams, VodCategory, VodStream } from "@/lib/xtream";

const WebSeries = () => {
  const { user, credentials, loading } = useAuth();
  const [streams, setStreams] = useState<VodStream[]>([]);
  const [categories, setCategories] = useState<VodCategory[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!credentials) return;
    let cancelled = false;

    (async () => {
      setDataLoading(true);
      const [vods, cats] = await Promise.all([
        getVodStreams(credentials.username, credentials.password),
        getVodCategories(credentials.username, credentials.password),
      ]);

      if (!cancelled) {
        setStreams(vods);
        setCategories(cats);
        setDataLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [credentials]);

  const webSeries = useMemo(() => {
    const seriesCategoryIds = categories
      .filter((category) => category.category_name.toLowerCase().includes("series"))
      .map((category) => category.category_id);

    const filtered = streams.filter((stream) => {
      const name = stream.name.toLowerCase();
      const categoryId = stream.category_id ?? "";
      return (
        seriesCategoryIds.includes(categoryId) || name.includes("series")
      );
    });

    return filtered;
  }, [streams, categories]);

  if (loading) {
    return <CinemaLoader fullscreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />
      <main className="relative z-10 px-4 py-6">
        {dataLoading ? (
          <CinemaLoader label="Loading web series" />
        ) : webSeries.length === 0 ? (
          <div className="text-center py-28 px-4">
            <h2 className="text-2xl font-bold mb-2">No web series found</h2>
            <p className="text-muted-foreground">
              We could not find any web series for your account right now.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-3xl font-bold">All Web Series</h1>
              <p className="text-sm text-muted-foreground mt-2">
                Browse {webSeries.length} web series items available in your catalog.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {webSeries.map((movie) => (
                <MovieCard key={movie.stream_id} movie={movie} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default WebSeries;
