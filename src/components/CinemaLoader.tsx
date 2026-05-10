import { cn } from "@/lib/utils";

interface CinemaLoaderProps {
  fullscreen?: boolean;
  label?: string;
  className?: string;
}

/**
 * Dynamic cinema-themed loader: a glowing film reel with orbiting dots
 * and a pulsing core. Centered both vertically and horizontally.
 */
export function CinemaLoader({ fullscreen = false, label = "Loading", className }: CinemaLoaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center w-full",
        fullscreen ? "min-h-screen" : "py-32",
        className,
      )}
    >
      <div className="relative flex flex-col items-center justify-center">
        {/* Glow halo */}
        <div className="absolute inset-0 -z-10 m-auto h-32 w-32 rounded-full bg-primary/20 blur-3xl animate-pulse" />

        {/* Loader stack */}
        <div className="relative h-24 w-24">
          {/* Outer rotating ring */}
          <div
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary border-r-primary/40"
            style={{ animation: "spin 1.4s linear infinite" }}
          />
          {/* Inner counter-rotating ring */}
          <div
            className="absolute inset-2 rounded-full border-2 border-transparent border-b-primary/80 border-l-primary/30"
            style={{ animation: "spin 1.8s linear infinite reverse" }}
          />
          {/* Orbiting dots */}
          <div
            className="absolute inset-0"
            style={{ animation: "spin 2.2s linear infinite" }}
          >
            <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_12px_hsl(var(--primary))]" />
            <span className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 h-1.5 w-1.5 rounded-full bg-primary/70" />
          </div>
          {/* Pulsing core */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-3 w-3 rounded-full bg-primary animate-ping" />
            <div className="absolute h-2 w-2 rounded-full bg-primary" />
          </div>
        </div>

        {/* Label */}
        <div className="mt-6 flex items-center gap-1 text-sm font-medium tracking-[0.3em] uppercase text-muted-foreground">
          <span>{label}</span>
          <span className="inline-flex w-6 justify-start">
            <span className="animate-pulse" style={{ animationDelay: "0ms" }}>.</span>
            <span className="animate-pulse" style={{ animationDelay: "200ms" }}>.</span>
            <span className="animate-pulse" style={{ animationDelay: "400ms" }}>.</span>
          </span>
        </div>
      </div>
    </div>
  );
}