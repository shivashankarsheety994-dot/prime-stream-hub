import { NavLink } from "react-router-dom";
import { Home, Play, User, Tv } from "lucide-react";

export const BottomNavBar = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-muted-foreground/20 p-2 flex justify-around z-50">
      <NavLink to="/" className="flex flex-col items-center text-muted-foreground">
        <Home />
        <span className="text-xs">Home</span>
      </NavLink>
      <NavLink to="/continue" className="flex flex-col items-center text-muted-foreground">
        <Play />
        <span className="text-xs">Continue</span>
      </NavLink>
      <NavLink to="/web-series" className="flex flex-col items-center text-muted-foreground">
        <Tv />
        <span className="text-xs">Web Series</span>
      </NavLink>
      <NavLink to="/account" className="flex flex-col items-center text-muted-foreground">
        <User />
        <span className="text-xs">Account</span>
      </NavLink>
    </div>
  );
};
