import { useEffect, useRef, useState } from "react";
import { X, Maximize, Minimize, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  src: string;
  title: string;
  poster?: string;
  onClose: () => void;
}

export function VideoPlayer({ src, title, poster, onClose }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lock scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Auto-enter fullscreen on mobile, lock to landscape if possible
  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    if (!isMobile) return;
    const el = containerRef.current;
    if (!el) return;
    const req = el.requestFullscreen?.bind(el)
      || (el as any).webkitRequestFullscreen?.bind(el);
    req?.()?.then(() => {
      const orientation = (screen as any).orientation;
      orientation?.lock?.("landscape").catch(() => {});
    }).catch(() => {});
  }, []);

  // Track fullscreen changes
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    document.addEventListener("webkitfullscreenchange", handler as EventListener);
    return () => {
      document.removeEventListener("fullscreenchange", handler);
      document.removeEventListener("webkitfullscreenchange", handler as EventListener);
    };
  }, []);

  // ESC closes
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && !document.fullscreenElement) onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const toggleFullscreen = async () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      try { await (el.requestFullscreen?.() ?? (el as any).webkitRequestFullscreen?.()); } catch {/* ignore */}
    } else {
      try { await (document.exitFullscreen?.() ?? (document as any).webkitExitFullscreen?.()); } catch {/* ignore */}
    }
  };

  const handleClose = async () => {
    if (document.fullscreenElement) {
      try { await document.exitFullscreen?.(); } catch {/* ignore */}
    }
    (screen as any).orientation?.unlock?.();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
      }}
    >
      <div ref={containerRef} className="relative w-full h-full bg-black flex items-center justify-center">
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          controls
          autoPlay
          playsInline
          className="w-full h-full object-contain"
          onLoadedData={() => setLoading(false)}
          onError={() => { setLoading(false); setError("Unable to play this video. The stream may not be available."); }}
        />

        {loading && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 pointer-events-none">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="mt-3 text-sm text-foreground">Loading {title}…</p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 px-6 text-center">
            <p className="text-foreground font-medium mb-2">{error}</p>
            <Button variant="secondary" onClick={handleClose}>Close</Button>
          </div>
        )}

        {/* Top controls */}
        <div className="absolute top-0 inset-x-0 p-3 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
          <p className="text-foreground font-semibold truncate pr-2 text-shadow-hero">{title}</p>
          <div className="flex gap-2 pointer-events-auto">
            <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="bg-black/40 hover:bg-black/60 text-foreground rounded-full h-10 w-10">
              {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={handleClose} className="bg-black/40 hover:bg-black/60 text-foreground rounded-full h-10 w-10">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}