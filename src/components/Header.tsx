import { Film, LogOut, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { formatTimestamp } from "@/lib/xtream";

export function Header() {
  const { user, signOut } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-background via-background/90 to-transparent">
      <div className="container mx-auto flex h-16 items-center px-4 md:px-8">
        <div className="w-32 hidden md:block" />
        <div className="flex-1 flex items-center justify-center gap-2">
          <Film className="h-6 w-6 text-primary" strokeWidth={2.5} />
          <h1 className="text-2xl md:text-3xl font-bold tracking-[0.2em] text-foreground">
            PRIME <span className="text-primary">CINEMA</span>
          </h1>
        </div>
        <div className="w-32 flex justify-end">
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 bg-card border-border">
                <DropdownMenuLabel className="font-normal">
                  <div className="space-y-2 py-1">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Username</p>
                      <p className="font-semibold text-foreground">{user.username}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Status</p>
                        <p className="font-semibold text-primary capitalize">{user.status || "Active"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Trial</p>
                        <p className="font-semibold">{user.is_trial === "1" ? "Yes" : "No"}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Subscribed</p>
                      <p className="font-semibold">{formatTimestamp(user.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Expires</p>
                      <p className="font-semibold">{formatTimestamp(user.exp_date)}</p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}