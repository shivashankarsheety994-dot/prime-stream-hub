import { Navigate, useNavigate } from "react-router-dom";
import { ArrowLeft, LogOut, User, Trash2, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { formatTimestamp } from "@/lib/xtream";
import { getContinueWatching, removeProgress, WatchEntry } from "@/lib/watchProgress";
import { usePlayer } from "@/context/PlayerContext";

export default function Account() {
  const { user, signOut, refreshUser } = useAuth();
  const { play } = usePlayer();
  const navigate = useNavigate();
  const [history, setHistory] = useState<WatchEntry[]>([]);

  useEffect(() => {
    const refresh = () => setHistory(getContinueWatching());
    refresh();
    window.addEventListener("watch-progress-updated", refresh);
    return () => window.removeEventListener("watch-progress-updated", refresh);
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold tracking-wide">Account</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-8 max-w-2xl">
        <section className="bg-card rounded-lg p-5 border border-border">
          <div className="flex items-center gap-4 mb-5">
            <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Username</p>
              <p className="text-xl font-bold">{user.username}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <Field label="Status" value={user.status || "Active"} highlight />
            <Field label="Trial" value={user.is_trial === "1" ? "Yes" : "No"} />
            <Field label="Subscribed" value={formatTimestamp(user.created_at)} />
            <Field label="Expires" value={formatTimestamp(user.exp_date)} />
            <Field label="Max Connections" value={user.max_connections || "—"} />
            <Field label="Active" value={user.active_cons || "0"} />
          </div>

          <Button
            variant="destructive"
            className="w-full mt-6"
            onClick={() => { signOut(); navigate("/login"); }}
          >
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </Button>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3">Continue Watching</h2>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No movies in your watch history yet.</p>
          ) : (
            <ul className="space-y-2">
              {history.map((e) => {
                const pct = Math.min(100, (e.position / e.duration) * 100);
                return (
                  <li key={e.movie.stream_id} className="bg-card border border-border rounded-lg p-3 flex items-center gap-3">
                    <button
                      onClick={() => play(e.movie)}
                      className="relative h-16 w-12 flex-shrink-0 rounded overflow-hidden bg-muted group"
                    >
                      {e.movie.stream_icon ? (
                        <img src={e.movie.stream_icon} alt={e.movie.name} className="h-full w-full object-cover" />
                      ) : null}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <Play className="h-5 w-5 text-white fill-white" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                        <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                      </div>
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{e.movie.name}</p>
                      <p className="text-xs text-muted-foreground">{Math.round(pct)}% watched</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeProgress(e.movie.stream_id)} aria-label="Remove">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

function Field({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className={`font-semibold capitalize ${highlight ? "text-primary" : ""}`}>{value}</p>
    </div>
  );
}
