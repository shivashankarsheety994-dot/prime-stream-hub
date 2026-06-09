import { useEffect, useMemo, useState } from "react";
import { Navigate, useParams, Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { CinemaLoader } from "@/components/CinemaLoader";
import { Header } from "@/components/Header";
import { MovieCard } from "@/components/MovieCard";
import { useAuth } from "@/context/AuthContext";
import { getVodCategories, getVodStreams, getStreamCategoryIds, VodCategory, VodStream } from "@/lib/xtream";

export default function Category() {
  const { categoryId } = useParams();
  const { user, credentials, loading } = useAuth();
  const [categories, setCategories] = useState<VodCategory[]>([]);
  const [streams, setStreams] = useState<VodStream[]>([]);
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

  const category = useMemo(
    () => categories.find((cat) => cat.category_id === categoryId),
    [categories, categoryId],
  );

  const movies = useMemo(
    () => (category ? streams.filter((stream) => getStreamCategoryIds(stream).includes(category.category_id)) : []),
    [streams, category],
  );

  if (loading) return <CinemaLoader fullscreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (!category) return <Navigate to="/" replace />;

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
        <h1 className="text-3xl md:text-4xl font-bold mb-1">{category.category_name}</h1>
        <p className="text-muted-foreground mb-6">
          {dataLoading ? "Loading category movies..." : `${movies.length} movies`}
        </p>
        {dataLoading ? (
          <CinemaLoader label={`Loading ${category.category_name}`} />
        ) : movies.length === 0 ? (
          <p className="text-muted-foreground py-16 text-center">No movies found in this category.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {movies.map((movie) => (
              <div key={movie.stream_id} className="w-full">
                <MovieCard movie={movie} categories={categories} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
