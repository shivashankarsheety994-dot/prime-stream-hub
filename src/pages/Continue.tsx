import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import {
  getContinueWatching,
  removeFromContinueWatching,
  clearContinueWatching,
  WatchEntry,
} from "@/lib/watchProgress";
import { usePlayer } from "@/context/PlayerContext";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";

const Continue = () => {
  const [continueWatching, setContinueWatching] = useState<WatchEntry[]>([]);
  const { play } = usePlayer();

  useEffect(() => {
    const refresh = () => setContinueWatching(getContinueWatching());
    refresh();
    window.addEventListener("watch-progress-updated", refresh);
    return () => window.removeEventListener("watch-progress-updated", refresh);
  }, []);

  const handleRemove = (
    e: React.MouseEvent<HTMLButtonElement>,
    streamId: number
  ) => {
    e.stopPropagation();
    removeFromContinueWatching(streamId);
  };

  const handleClearAll = () => {
    clearContinueWatching();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pb-16 pt-20 relative z-10 px-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl">Continue Watching</h1>
          {continueWatching.length > 0 && (
            <Button onClick={handleClearAll} variant="destructive">
              Clear All
            </Button>
          )}
        </div>

        {continueWatching.length > 0 ? (
          <div className="flex flex-col gap-4">
            {continueWatching.map(({ movie, position, duration }) => {
              const progress = duration > 0 ? (position / duration) * 100 : 0;
              return (
                <div key={movie.stream_id} className="relative group">
                  <button
                    onClick={() => play(movie)}
                    className="flex items-center gap-4 bg-card p-2 rounded-lg shadow-md text-left w-full"
                  >
                    <div className="w-20 h-28 flex-shrink-0 bg-secondary rounded-md overflow-hidden">
                      {movie.stream_icon ? (
                        <img
                          src={movie.stream_icon}
                          alt={`${movie.name} poster`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs p-2 text-center">
                          {movie.name}
                        </div>
                      )}
                    </div>
                    <div className="flex-grow">
                      <p className="text-lg font-medium text-foreground line-clamp-2">
                        {movie.name}
                      </p>
                      <div className="w-full bg-secondary h-1.5 mt-2">
                        <div
                          className="h-1.5"
                          style={{ width: `${progress}%`, backgroundColor: '#E5A04A' }}
                        />
                      </div>
                    </div>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => handleRemove(e, movie.stream_id)}
                  >
                    <Trash className="h-5 w-5" />
                  </Button>
                </div>
              );
            })}
          </div>
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
