import { Film, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

export function Header() {
  const { user } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-background via-background/90 to-transparent">
      <div className="container mx-auto flex h-16 items-center px-4 md:px-8">
        <div className="w-32 hidden md:block" />
        <div className="flex-1 flex items-center justify-center gap-2">
          <Link to="/" aria-label="Prime Cinema home" className="inline-flex items-center gap-2">
            <Film className="h-6 w-6 text-primary" strokeWidth={2.5} />
            <h1 className="text-2xl md:text-3xl font-bold tracking-[0.2em] text-foreground">
              PRIME <span className="text-primary">CINEMA</span>
            </h1>
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