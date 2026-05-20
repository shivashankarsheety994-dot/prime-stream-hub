import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { login as apiLogin, XtreamUserInfo } from "@/lib/xtream";
import { SubscriptionWarning } from "@/components/SubscriptionWarning";

interface AuthState {
  user: XtreamUserInfo | null;
  credentials: { username: string; password: string } | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);
const STORAGE_KEY = "prime-cinema-auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<XtreamUserInfo | null>(null);
  const [credentials, setCredentials] = useState<{ username: string; password: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setUser(parsed.user);
        setCredentials(parsed.credentials);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user?.exp_date) {
      const expDate = new Date(Number(user.exp_date) * 1000);
      const now = new Date();
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      if (expDate.getTime() - now.getTime() < sevenDays) {
        setShowWarning(true);
      }
    }
  }, [user]);

  const signIn = async (username: string, password: string) => {
    try {
      const res = await apiLogin(username, password);
      if (res?.user_info?.auth === 1) {
        setUser(res.user_info);
        setCredentials({ username, password });
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: res.user_info, credentials: { username, password } }));
        return { ok: true };
      }
      return { ok: false, error: res?.user_info?.message || "Invalid credentials" };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Login failed" };
    }
  };

  const signOut = () => {
    setUser(null);
    setCredentials(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, credentials, loading, signIn, signOut }}>
      {children}
      <SubscriptionWarning isOpen={showWarning} onClose={() => setShowWarning(false)} />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}