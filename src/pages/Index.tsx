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
    const sorted = [...streams].sort((a, b) => b.stream_id - a.stream_id);
    return sorted.slice(0, 30);
  }, [streams]);

  const byCategory = useMemo(() => {
    const map = new Map<string, VodStream[]>();
    streams.forEach((s) => {
      const id = s.category_id ?? "uncat";
      if (!map.has(id)) map.set(id, []);
      map.get(id)!.push(s);
    });
    // Sort each category by most-recently-added first
    map.forEach((list) => {
      list.sort((a, b) => b.stream_id - a.stream_id);
    });
    return map;
  }, [streams]);

  // Order categories by their most recent addition (newest first)
  const orderedCategories = useMemo(() => {
    const recencyOf = (catId: string) => {
      const list = byCategory.get(catId);
      if (!list || list.length === 0) return 0;
      return list[0].stream_id;
    };
    return [...categories]
      .sort((a, b) => recencyOf(b.category_id) - recencyOf(a.category_id));
  }, [categories, byCategory]);

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
            {orderedCategories.map((cat) => (
              <GenreRow
                key={cat.category_id}
                title={cat.category_name}
                movies={byCategory.get(cat.category_id) ?? []}
              />
            ))}
            {byCategory.has("uncat") && (
              <GenreRow title="More Movies" movies={byCategory.get("uncat")!} />
            )}
          </>
        )}
      </main>
    </div>
  );
}
