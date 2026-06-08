import { Navigate, useNavigate } from "react-router-dom";
import { LogOut, User, Calendar, CalendarX, Infinity, Wifi, ShieldCheck } from "lucide-react";
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

  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };

  const parseExpDate = (value?: string | number | null) => {
    if (value == null) return null;
    const timestamp = typeof value === "number" ? value : Number(value);
    if (Number.isNaN(timestamp) || timestamp <= 0) return null;
    return new Date(timestamp < 1e12 ? timestamp * 1000 : timestamp);
  };

  const expDate = parseExpDate(user.exp_date);
  const isUnlimited = user.exp_date === null;
  const normalizedStatus = user.status?.toLowerCase().trim() ?? "";
  const statusClosed = normalizedStatus.includes("closed") || normalizedStatus.includes("inactive") || normalizedStatus.includes("cancelled") || normalizedStatus.includes("suspended");
  const hasValidExpiry = !!expDate && expDate.getTime() > 0;
  const isExpired = !isUnlimited && hasValidExpiry ? expDate.getTime() < Date.now() : !isUnlimited && user.exp_date != null && !expDate;
  const isClosed = isExpired || statusClosed;
  const subscriptionStatus = isClosed ? "Closed" : user.status || "Active";

  const daysRemaining = () => {
    if (isUnlimited) {
      return <Infinity className="h-8 w-8" />;
    }
    if (isClosed) {
      return "Closed";
    }
    if (!expDate) {
      return "Closed";
    }
    const now = new Date();
    const diff = expDate.getTime() - now.getTime();
    if (diff < 0) return "Closed";
    return Math.ceil(diff / (1000 * 3600 * 24));
  };

  const expiresLabel = isUnlimited ? "Unlimited" : isClosed || !expDate ? "Closed" : formatTimestamp(expDate.getTime(), { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="flex items-center justify-between p-4">
        <h1 className="text-2xl font-bold" style={{ color: '#E5A04A' }}>PRIMEFLIX</h1>
        <div className="hidden md:block">
        <Button
          variant="secondary"
          className="bg-gray-800 hover:bg-gray-700"
          onClick={() => { signOut(); navigate("/login"); }}
        >
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </Button>
        </div>
      </header>

      <main className="px-4 py-2 space-y-6">
        <section className="rounded-lg p-4 bg-gradient-to-r from-red-900/50 via-gray-900 to-black">
          <div className="flex items-center gap-4 md:flex-col md:gap-2 md:p-4">
            <div className="h-20 w-20 md:h-24 md:w-24 rounded-lg bg-red-600 flex items-center justify-center">
              <User className="h-10 w-10 md:h-12 md:w-12 text-white" />
            </div>
            <div className="md:text-center">
              <p className="text-2xl md:text-3xl font-bold">{getInitials(user.username)}</p>
              <p className="text-sm md:text-base text-gray-400">PrimeFlix Member</p>
              <div className="flex items-center gap-1 mt-2 bg-green-600/50 text-green-300 border border-green-500 rounded-full px-2 py-0.5 text-xs md:text-sm w-fit md:mx-auto">
                <ShieldCheck className="h-3 w-3 md:h-4 md:w-4" />
                <span>{subscriptionStatus}</span>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">Subscription</h2>
          <div className="grid md:grid-cols-2 gap-3">
            <SubscriptionCard
              icon={<Calendar className="h-6 w-6 text-gray-400" />}
              label="STARTED"
              value={formatTimestamp(user.created_at, { month: 'short', day: 'numeric', year: 'numeric' })}
            />
            <SubscriptionCard
              icon={<CalendarX className="h-6 w-6 text-gray-400" />}
              label="EXPIRES"
              value={expiresLabel}
            />
            <SubscriptionCard
              icon={isUnlimited ? <Infinity className="h-6 w-6 text-gray-400" /> : <CalendarX className="h-6 w-6 text-gray-400" />}
              label="DAYS REMAINING"
              value={daysRemaining()}
            />
            <SubscriptionCard
              icon={<Wifi className="h-6 w-6 text-gray-400" />}
              label="CONNECTIONS"
              value={`${user.active_cons || "0"} / ${user.max_connections || "1"}`}
            />
          </div>
        </section>

        <div className="md:hidden">
          <Button
            variant="secondary"
            className="w-full bg-gray-800 hover:bg-gray-700"
            onClick={() => { signOut(); navigate("/login"); }}
          >
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </Button>
        </div>
      </main>
    </div>
  );
}

function SubscriptionCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="p-4 rounded-lg bg-gray-900/70 flex items-center gap-4">
      <div className="flex-shrink-0">{icon}</div>
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-lg font-semibold">{value}</p>
      </div>
    </div>
  );
}
