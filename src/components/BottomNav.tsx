import { History, Home, User } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home", icon: Home },
  { href: "/account", label: "Account", icon: User },
  { href: "/continue", label: "Continue", icon: History },
];

export function BottomNav() {
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
                "flex flex-col items-center justify-center gap-1 rounded-2xl px-3 py-2 text-xs transition-all duration-150",
                isActive
                  ? "bg-[#dca250] text-black shadow-[0_12px_24px_-10px_rgba(220,162,80,0.8)] hover:shadow-[0_16px_28px_-12px_rgba(220,162,80,0.95)] active:translate-y-0.5 active:shadow-[0_8px_14px_-8px_rgba(220,162,80,0.7)]"
                  : "bg-background/80 text-muted-foreground hover:bg-[#dca250]/20 hover:text-[#dca250]"
              )
            }
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
