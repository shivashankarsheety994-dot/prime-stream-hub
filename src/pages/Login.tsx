import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast({ title: "Missing fields", description: "Enter username and password.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const res = await signIn(username.trim(), password);
    setLoading(false);
    if (res.ok) {
      toast({ title: "Welcome back", description: `Signed in as ${username}` });
      navigate("/");
    } else {
      toast({ title: "Login failed", description: res.error, variant: "destructive" });
    }
  };

  return (
    <main className="min-h-screen relative flex items-center justify-center px-4 overflow-hidden">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse at top, hsl(0 84% 50% / 0.15), transparent 60%), radial-gradient(ellipse at bottom, hsl(0 0% 10%), hsl(0 0% 4%))",
        }}
      />
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <p className="text-2xl font-semibold text-foreground">Sign in to continue streaming</p>
        </div>
        <form onSubmit={onSubmit} className="bg-card/80 backdrop-blur border border-border rounded-lg p-8 space-y-5 shadow-2xl">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username" autoComplete="username" value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-input border-border h-11"
              placeholder="Your username"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password" type="password" autoComplete="current-password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-input border-border h-11"
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full h-11 text-base font-semibold tracking-wide bg-primary hover:bg-primary/90">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign In"}
          </Button>
          <div className="pt-1 text-center space-y-2">
            <p className="text-sm text-muted-foreground">Don't have a plan yet?</p>
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 font-semibold"
              onClick={() => navigate("/plans")}
            >
              Subscribe
            </Button>
          </div>
          <p className="text-xs text-center text-muted-foreground pt-2">
            Credentials are validated against the Primeflix API.
          </p>
        </form>
      </div>
    </main>
  );
}
