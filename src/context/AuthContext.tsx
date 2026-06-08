import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from "react";
import { login as apiLogin, XtreamUserInfo } from "@/lib/xtream";
import { SubscriptionWarning } from "@/components/SubscriptionWarning";

interface AuthState {
  user: XtreamUserInfo | null;
  credentials: { username: string; password: string } | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);
const STORAGE_KEY = "prime-cinema-auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<XtreamUserInfo | null>(null);
  const [credentials, setCredentials] = useState<{ username: string; password: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWarning, setShowWarning] = useState(false);
  const [warningType, setWarningType] = useState<"expiring" | "expired" | null>(null);
  const [warningAcknowledged, setWarningAcknowledged] = useState(false);

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
    if (user?.exp_date && !warningAcknowledged) {
      const expDate = new Date(Number(user.exp_date) * 1000);
      const now = new Date();
      if (expDate.getTime() < now.getTime()) {
        setWarningType("expired");
        setShowWarning(true);
      } else {
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        if (expDate.getTime() - now.getTime() < sevenDays) {
          setWarningType("expiring");
          setShowWarning(true);
        }
      }
    }
  }, [user, warningAcknowledged]);

  const signIn = useCallback(async (username: string, password: string) => {
    try {
      const res = await apiLogin(username, password);
      if (res?.user_info) {
        setUser(res.user_info);
        setCredentials({ username, password });
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: res.user_info, credentials: { username, password } }));
      }

      if (res?.user_info?.auth === 1) {
        return { ok: true };
      }

      const status = res?.user_info?.status?.toLowerCase() ?? "";
      const message = res?.user_info?.message?.toLowerCase() ?? "";
      const closedAccount = status.includes("closed") || status.includes("inactive") || status.includes("cancel") || status.includes("suspended");
      const subscriptionProblem = message.includes("expired") || message.includes("closed") || message.includes("inactive") || message.includes("cancel");

      if (closedAccount || subscriptionProblem) {
        return { ok: true };
      }

      if (message.includes("invalid") || message.includes("incorrect") || message.includes("failed")) {
        return { ok: false, error: res?.user_info?.message || "Invalid credentials" };
      }

      return { ok: Boolean(res?.user_info), error: res?.user_info?.message || "Login failed" };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Login failed" };
    }
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    setCredentials(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const refreshUser = useCallback(async () => {
    if (credentials) {
      const result = await signIn(credentials.username, credentials.password);
      if (!result.ok && result.error?.toLowerCase().includes("invalid")) {
        signOut();
      }
    }
  }, [credentials, signIn, signOut]);

  const value = useMemo(() => ({
    user,
    credentials,
    loading,
    signIn,
    signOut,
    refreshUser
  }), [user, credentials, loading, signIn, signOut, refreshUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
      <SubscriptionWarning
        isOpen={showWarning}
        onClose={() => {
          setShowWarning(false);
          setWarningAcknowledged(true);
        }}
        type={warningType}
      />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
