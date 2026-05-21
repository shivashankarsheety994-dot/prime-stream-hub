import { useEffect, useState } from "react";
import { GenreRow } from "@/components/GenreRow";
import { Header } from "@/components/Header";
import { getContinueWatching, WatchEntry } from "@/lib/watchProgress";

const Continue = () => {
  const [continueWatching, setContinueWatching] = useState<WatchEntry[]>([]);

  useEffect(() => {
    const refresh = () => setContinueWatching(getContinueWatching());
    refresh();
    window.addEventListener("watch-progress-updated", refresh);
    return () => window.removeEventListener("watch-progress-updated", refresh);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pb-16 pt-20 relative z-10 px-4">
        <h1 className="text-2xl mb-4">Continue Watching</h1>
        {continueWatching.length > 0 ? (
          <GenreRow
            title=""
            movies={continueWatching.map((e) => e.movie)}
            variant="poster"
          />
        ) : (
          <div className="text-center py-32 px-4">
            <h2 className="text-2xl font-bold mb-2">Nothing to continue</h2>
            <p className="text-muted-foreground">
              You have not started watching any movie yet.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Continue;
