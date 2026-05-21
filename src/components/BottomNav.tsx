import { Cast, History, Home, Tv, User } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useCast } from "@/context/CastContext";

const links = [
  { href: "/", label: "Home", icon: Home },
  { href: "/web-series", label: "Web Series", icon: Tv },
  { href: "/continue", label: "Continue", icon: History },
  { href: "/account", label: "Account", icon: User },
];

export function BottomNav() {
  const { user } = useAuth();
  const { available, connected, deviceName, connect } = useCast();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t border-border md:hidden">
      <div className="container mx-auto flex h-16 items-center justify-around px-4">
        {links.map(({ href, label, icon: Icon }) => (
          <NavLink
            key={href}
            to={href}
            end={href === "/"}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center gap-1 text-xs text-muted-foreground transition-colors",
                isActive ? "text-primary" : "hover:text-foreground"
              )
            }
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </NavLink>
        ))}
        {user && (
          <button
            onClick={() => connect().catch(() => {})}
            className={cn(
              "flex flex-col items-center justify-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground",
              { "text-primary": connected }
            )}
            title={connected ? `Connected Chromecast${deviceName ? `: ${deviceName}` : ""}` : available ? "Connect Chromecast" : "Chromecast available in Chrome"}
          >
            <Cast className="h-5 w-5" />
            <span>Cast</span>
          </button>
        )}
      </div>
    </nav>
  );
}
