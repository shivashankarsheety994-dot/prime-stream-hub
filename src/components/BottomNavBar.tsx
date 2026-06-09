import { NavLink } from "react-router-dom";
import { Home, Play, User } from "lucide-react";

export const BottomNavBar = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-muted-foreground/20 p-2 flex justify-around z-50">
      <NavLink to="/" className={({ isActive }) =>
          `flex flex-col items-center ${isActive ? 'bottom-nav-active' : 'text-muted-foreground'}`
        }>
        <Home className="h-5 w-5 text-[#dca250]" />
        <span className="text-xs">Home</span>
      </NavLink>
      <NavLink to="/continue" className={({ isActive }) =>
          `flex flex-col items-center ${isActive ? 'bottom-nav-active' : 'text-muted-foreground'}`
        }>
        <Play className="h-5 w-5 text-[#dca250]" />
        <span className="text-xs">Continue</span>
      </NavLink>
      <NavLink to="/account" className={({ isActive }) =>
          `flex flex-col items-center ${isActive ? 'bottom-nav-active' : 'text-muted-foreground'}`
        }>
        <User className="h-5 w-5 text-[#dca250]" />
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
