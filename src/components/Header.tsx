import { User } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import logo from "@/assets/prime-cinema-logo.png";

export function Header() {
  const { user } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-background via-background/90 to-transparent">
      <div className="container mx-auto flex h-16 items-center px-4 md:px-8">
        <div className="w-32 hidden md:block" />
        <div className="flex-1 flex items-center justify-center gap-2">
          <Link to="/" aria-label="Prime Cinema home" className="group inline-flex items-center">
            <img
              src={logo}
              alt="Prime Cinema"
              width={1536}
              height={1024}
              className="h-9 md:h-12 w-auto object-contain drop-shadow-[0_0_18px_hsl(var(--primary)/0.55)] transition-transform duration-500 group-hover:scale-[1.04] animate-fade-in"
            />
            <h1 className="sr-only">Prime Cinema</h1>
          </Link>
        </div>
        <div className="w-32 flex justify-end">
          {user && (
            <Button asChild variant="ghost" size="icon" className="rounded-full" aria-label="Account">
              <Link to="/account">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}