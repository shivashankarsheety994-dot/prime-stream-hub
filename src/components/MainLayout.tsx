
import { useLocation } from "react-router-dom";
import { DesktopSidebar } from "./DesktopSidebar";
import { BottomNav } from "./BottomNav";

export const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const noNavPaths = ["/login"];

  const showNav = !noNavPaths.includes(location.pathname);

  return (
    <div className="flex min-h-screen">
      {showNav && <DesktopSidebar />}
      <main className={`flex-1 ${showNav ? 'md:ml-20' : ''} ${showNav ? 'pb-16 md:pb-0' : ''}`}>
        {children}
      </main>
      {showNav && (
        <div className="md:hidden">
          <BottomNav />
        </div>
      )}
    </div>
  );
};
