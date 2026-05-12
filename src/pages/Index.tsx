import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { CinemaLoader } from "@/components/CinemaLoader";
import { useAuth } from "@/context/AuthContext";
import { Header } from "@/components/Header";
import { PosterMarquee } from "@/components/PosterMarquee";
import { GenreRow } from "@/components/GenreRow";
import { Top5Row } from "@/components/Top5Row";
import { getVodCategories, getVodStreams, VodCategory, VodStream } from "@/lib/xtream";
import { getContinueWatching, WatchEntry } from "@/lib/watchProgress";

export default function Index() {
  const { user, credentials, loading } = useAuth();
  const [categories, setCategories] = useState<VodCategory[]>([]);
  const [streams, setStreams] = useState<VodStream[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [continueWatching, setContinueWatching] = useState<WatchEntry[]>([]);

  useEffect(() => {
    const refresh = () => setContinueWatching(getContinueWatching());
    refresh();
    window.addEventListener("watch-progress-updated", refresh);
    return () => window.removeEventListener("watch-progress-updated", refresh);
  }, []);

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

  const latest = useMemo(() => {
    const sorted = [...streams].sort((a, b) => {
      const aT = a.added ? parseInt(a.added, 10) : 0;
      const bT = b.added ? parseInt(b.added, 10) : 0;
      return bT - aT;
    });
    return sorted.slice(0, 30);
  }, [streams]);

  const byCategory = useMemo(() => {
    const moviesByCatName = new Map<string, VodStream[]>();
    const catNameMap = new Map<string, string>();
    categories.forEach(c => catNameMap.set(c.category_id, c.category_name));

    // Map from normalized name to original name to preserve original casing
    const normalizedToOriginal = new Map<string, string>();

    streams.forEach((s) => {
      const originalCatName = (s.category_id && catNameMap.get(s.category_id)) || "Uncategorized";
      const normalized = originalCatName.trim().toLowerCase();
      
      if(!moviesByCatName.has(normalized)) {
        moviesByCatName.set(normalized, []);
        normalizedToOriginal.set(normalized, originalCatName.trim());
      }
      moviesByCatName.get(normalized)!.push(s);
    });

    // Sort movies within each category
    moviesByCatName.forEach((list) => {
      list.sort((a, b) => {
        const aT = a.added ? parseInt(a.added, 10) : 0;
        const bT = b.added ? parseInt(b.added, 10) : 0;
        return bT - aT;
      });
    });

    // Now, let's rebuild the map with original names as keys.
    const finalMap = new Map<string, VodStream[]>();
    for (const [normalized, movies] of moviesByCatName.entries()) {
      const originalName = normalizedToOriginal.get(normalized) || normalized;
      finalMap.set(originalName, movies);
    }
    
    return finalMap;
  }, [streams, categories]);

  const orderedCategories = useMemo(() => {
    const unsorted = Array.from(byCategory.entries())
      .map(([name, movies]) => ({
        name,
        movies,
        recency: movies.length > 0 && movies[0].added ? parseInt(movies[0].added, 10) : 0,
      }));
    
    const uncat = unsorted.find(c => c.name === "Uncategorized");
    const sorted = unsorted.filter(c => c.name !== "Uncategorized").sort((a, b) => b.recency - a.recency);

    if (uncat) {
        sorted.push(uncat);
    }
    
    return sorted;
  }, [byCategory]);

  if (loading) {
    return <CinemaLoader fullscreen />;
  }
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PosterMarquee movies={latest.length ? latest : streams} />
      <main className="pb-16 -mt-8 relative z-10">
        {dataLoading ? (
          <CinemaLoader label="Loading movies" />
        ) : streams.length === 0 ? (
          <div className="text-center py-32 px-4">
            <h2 className="text-2xl font-bold mb-2">No movies available</h2>
            <p className="text-muted-foreground">Your account is signed in, but no movie catalog was returned by the API.</p>
          </div>
        ) : (
          <>
            <Top5Row movies={latest.slice(0, 5)} />
            {continueWatching.length > 0 && (
              <GenreRow
                title="Continue Watching"
                movies={continueWatching.map((e) => e.movie)}
              />
            )}
            {orderedCategories.map((cat, i) => (
              <GenreRow
                key={`${cat.name}-${i}`}
                title={cat.name}
                movies={cat.movies}
              />
            ))}
          </>
        )}
      </main>
    </div>
  );
}
