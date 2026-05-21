import { Navigate, useNavigate } from "react-router-dom";
import { ArrowLeft, LogOut, User } from "lucide-react";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { formatTimestamp } from "@/lib/xtream";

export default function Account() {
  const { user, signOut, refreshUser } = useAuth();
  const navigate = useNavigate();

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
