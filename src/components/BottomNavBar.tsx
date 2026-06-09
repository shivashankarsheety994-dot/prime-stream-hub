import { NavLink } from "react-router-dom";
import { Home, Play, User } from "lucide-react";

export const BottomNavBar = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-muted-foreground/20 p-2 flex justify-around z-50">
      <NavLink
        to="/"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 rounded-2xl px-3 py-2 text-xs transition-all duration-150 ${isActive ? 'bg-[#dca250] text-black shadow-[0_12px_24px_-10px_rgba(220,162,80,0.8)] hover:shadow-[0_16px_28px_-12px_rgba(220,162,80,0.95)] active:translate-y-0.5 active:shadow-[0_8px_14px_-8px_rgba(220,162,80,0.7)]' : 'bg-background/80 text-muted-foreground hover:bg-[#dca250]/20 hover:text-[#dca250]'}`
        }
      >
        <Home className="h-5 w-5" />
        <span className="text-xs">Home</span>
      </NavLink>
      <NavLink
        to="/continue"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 rounded-2xl px-3 py-2 text-xs transition-all duration-150 ${isActive ? 'bg-[#dca250] text-black shadow-[0_12px_24px_-10px_rgba(220,162,80,0.8)] hover:shadow-[0_16px_28px_-12px_rgba(220,162,80,0.95)] active:translate-y-0.5 active:shadow-[0_8px_14px_-8px_rgba(220,162,80,0.7)]' : 'bg-background/80 text-muted-foreground hover:bg-[#dca250]/20 hover:text-[#dca250]'}`
        }
      >
        <Play className="h-5 w-5" />
        <span className="text-xs">Continue</span>
      </NavLink>
      <NavLink
        to="/account"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 rounded-2xl px-3 py-2 text-xs transition-all duration-150 ${isActive ? 'bg-[#dca250] text-black shadow-[0_12px_24px_-10px_rgba(220,162,80,0.8)] hover:shadow-[0_16px_28px_-12px_rgba(220,162,80,0.95)] active:translate-y-0.5 active:shadow-[0_8px_14px_-8px_rgba(220,162,80,0.7)]' : 'bg-background/80 text-muted-foreground hover:bg-[#dca250]/20 hover:text-[#dca250]'}`
        }
      >
        <User className="h-5 w-5" />
        <span className="text-xs">Account</span>
      </NavLink>
    </div>
  );
};
          `flex flex-col items-center ${isActive ? 'bottom-nav-active' : 'text-muted-foreground'}`
        }>
        <User />
        <span className="text-xs">Account</span>
      </NavLink>
    </div>
  );
};
