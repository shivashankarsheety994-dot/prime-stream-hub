
import { NavLink } from "react-router-dom";
import { Home, Play, User } from "lucide-react";

export const BottomNavBar = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-muted-foreground/20 p-4 flex sm:hidden justify-around">
      <NavLink to="/" className="flex flex-col items-center text-muted-foreground">
        <Home />
        <span>Home</span>
      </NavLink>
      <NavLink to="/continue" className="flex flex-col items-center text-muted-foreground">
        <Play />
        <span>Continue</span>
      </NavLink>
      <NavLink to="/account" className="flex flex-col items-center text-muted-foreground">
        <User />
        <span>Account</span>
      </NavLink>
    </div>
  );
};
