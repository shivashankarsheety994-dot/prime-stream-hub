import { NavLink } from "react-router-dom";
import { Home, Play, User } from "lucide-react";

const links = [
  { href: "/", label: "Home", icon: Home },
  { href: "/continue", label: "Continue", icon: Play },
  { href: "/account", label: "Account", icon: User },
];

export const DesktopSidebar = () => {
  return (
    <div className="hidden md:block fixed left-0 top-0 h-full bg-background border-r border-muted-foreground/20 p-4 flex flex-col items-center z-[99] w-28">
      <div className="flex flex-col items-center space-y-3 mt-20 w-full">
        {links.map(({ href, label, icon: Icon }) => (
          <NavLink
            key={href}
            to={href}
            end={href === "/"}
            className={({ isActive }) =>
              `flex w-full flex-col items-center gap-1 rounded-3xl px-3 py-3 text-xs transition-all duration-150 ${isActive ? 'bg-[#dca250] text-black shadow-[0_12px_24px_-10px_rgba(220,162,80,0.8)] hover:shadow-[0_16px_28px_-12px_rgba(220,162,80,0.95)] active:translate-y-0.5 active:shadow-[0_8px_14px_-8px_rgba(220,162,80,0.7)]' : 'bg-background/80 text-muted-foreground hover:bg-[#dca250]/20 hover:text-[#dca250]'}`
            }
          >
            <Icon className="h-6 w-6" />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
};
