import { useEffect, useMemo, useState } from "react";
import { Navigate, useParams, Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { CinemaLoader } from "@/components/CinemaLoader";
import { Header } from "@/components/Header";
import { MovieCard } from "@/components/MovieCard";
import { useAuth } from "@/context/AuthContext";
import { getVodCategories, getVodStreams, VodCategory, VodStream } from "@/lib/xtream";
import { LANGUAGES, filterByLanguage } from "@/lib/languages";

export default function Language() {
  const { slug } = useParams();
  const { user, credentials, loading } = useAuth();
  const [categories, setCategories] = useState<VodCategory[]>([]);
  const [streams, setStreams] = useState<VodStream[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const lang = LANGUAGES.find((l) => l.slug === slug);

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

  const movies = useMemo(
    () => (lang ? filterByLanguage(lang, streams, categories) : []),
    [lang, streams, categories],
  );

  if (loading) return <CinemaLoader fullscreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (!lang) return <Navigate to="/" replace />;

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
        <h1 className="text-3xl md:text-4xl font-bold mb-1">{lang.native}</h1>
        <p className="text-muted-foreground mb-6">
          {lang.english} {!dataLoading && `· ${movies.length} movies`}
        </p>
        {dataLoading ? (
          <CinemaLoader label={`Loading ${lang.english} movies`} />
        ) : movies.length === 0 ? (
          <p className="text-muted-foreground py-16 text-center">No {lang.english} movies found.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {movies.map((m) => (
              <div key={m.stream_id} className="w-full">
                <MovieCard movie={m} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}