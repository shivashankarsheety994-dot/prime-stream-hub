import { Cast, Film, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useCast } from "@/context/CastContext";
import { Button } from "@/components/ui/button";

export function Header() {
  const { user } = useAuth();
  const { available, connected, deviceName, connect } = useCast();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-background via-background/90 to-transparent">
      <div className="container mx-auto flex h-16 items-center px-4 md:px-8">
        <div className="w-32 hidden md:block" />
        <div className="flex-1 flex items-center justify-center gap-2">
          <Link to="/" aria-label="Primeflix home">
            <div className="inline-flex items-center gap-2">
              <Film className="h-6 w-6 text-primary" strokeWidth={2.5} />
              <h1 className="text-2xl md:text-3xl font-bold tracking-[0.2em] text-foreground">
                PRIME<span className="text-primary">FLIX</span>
              </h1>
            </div>
          </Link>
        </div>
        <div className="w-32 flex justify-end gap-1">
          {user && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-full"
                aria-label={connected ? `Connected Chromecast${deviceName ? `: ${deviceName}` : ""}` : "Connect Chromecast"}
                title={connected ? `Connected Chromecast${deviceName ? `: ${deviceName}` : ""}` : available ? "Connect Chromecast" : "Chromecast available in Chrome"}
                onClick={() => connect().catch(() => {})}
              >
                <Cast className={connected ? "h-5 w-5 text-primary" : "h-5 w-5 text-foreground"} />
                {connected && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />}
              </Button>
              <Button asChild variant="ghost" size="icon" className="rounded-full" aria-label="Account">
                <Link to="/account">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
