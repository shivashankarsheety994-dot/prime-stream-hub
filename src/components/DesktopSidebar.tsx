import { NavLink } from "react-router-dom";
import { Home, Play, User } from "lucide-react";

export const DesktopSidebar = () => {
  return (
    <div className="hidden md:block fixed left-0 top-0 h-full bg-background border-r border-muted-foreground/20 p-4 flex flex-col items-center z-[99] w-20">
      <div className="flex flex-col items-center space-y-8 mt-20">
        <NavLink to="/" end className={({ isActive }) =>
          `flex flex-col items-center ${isActive ? 'sidebar-icon-active' : 'text-muted-foreground'}`
        }>
          <Home className="h-6 w-6 mb-1" />
          <span className="text-xs">Home</span>
        </NavLink>
        <NavLink to="/continue" className={({ isActive }) =>
          `flex flex-col items-center ${isActive ? 'sidebar-icon-active' : 'text-muted-foreground'}`
        }>
          <Play className="h-6 w-6 mb-1" />
          <span className="text-xs">Continue</span>
        </NavLink>
        <NavLink to="/account" className={({ isActive }) =>
          `flex flex-col items-center ${isActive ? 'sidebar-icon-active' : 'text-muted-foreground'}`
        }>
          <User className="h-6 w-6 mb-1" />
          <span className="text-xs">Account</span>
        </NavLink>
      </div>
    </div>
  );
};
