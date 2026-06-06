import { cn } from "@/lib/utils";

interface CinemaLoaderProps {
  fullscreen?: boolean;
  label?: string;
  className?: string;
}

export function CinemaLoader({ fullscreen = false, label = "Loading", className }: CinemaLoaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center w-full",
        fullscreen ? "min-h-screen" : "py-32",
        className,
      )}
    >
      <div className="flex flex-col items-center justify-center gap-4 mx-auto">
        <div className="loader" />
        <span className="text-sm font-medium uppercase tracking-[0.35em] text-muted-foreground">
          {label}
        </span>
      </div>
      <style>{`
        .loader {
          width: 120px;
          height: 20px;
          -webkit-mask: linear-gradient(90deg,#000 70%,#0000 0) left/20% 100%;
          mask: linear-gradient(90deg,#000 70%,#0000 0) left/20% 100%;
          background:
            linear-gradient(#000 0 0) left -25% top 0 /20% 100% no-repeat
            #ddd;
          animation: l7 1s infinite steps(6);
          display: block;
          margin: 0 auto;
        }
        @keyframes l7 {
          100% {background-position: right -25% top 0}
        }
      `}</style>
    </div>
  );
}
