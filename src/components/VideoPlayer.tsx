import { useEffect, useRef, useState, useCallback } from "react";
import { X, Play, Pause, Volume2, VolumeX, Loader2, RotateCcw, RotateCw, Maximize2, Minimize2, Expand, Shrink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCast } from "@/context/CastContext";
import { VodStream } from "@/lib/xtream";
import { getProgress, saveProgress } from "@/lib/watchProgress";

interface Props {
  src: string;
  title: string;
  poster?: string;
  movie: VodStream;
  onClose: () => void;
}

export function VideoPlayer({ src, title, poster, movie, onClose }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { connected: castConnected, castMovie, playRemote, pauseRemote, seekRemote } = useCast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const hideTimer = useRef<number | null>(null);
  const [fitMode, setFitMode] = useState<"contain" | "cover">("contain");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const resumedRef = useRef(false);
  const castStartedRef = useRef(false);
  const castTimelineStartRef = useRef(0);
  const castStartPositionRef = useRef(0);
  const lastSaveRef = useRef(0);

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

  // ESC closes
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && !document.fullscreenElement) onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Track fullscreen state for the enlarge button
  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const toggleFullscreen = async () => {
    const el = containerRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) {
        const req = el.requestFullscreen?.bind(el) || (el as any).webkitRequestFullscreen?.bind(el);
        await req?.();
        const orientation = (screen as any).orientation;
        try { await orientation?.lock?.("landscape"); } catch { /* ignore */ }
      } else {
        await document.exitFullscreen?.();
      }
    } catch { /* ignore */ }
    bumpControls();
  };

  const handleClose = async () => {
    // Save current position before closing
    const v = videoRef.current;
    if (v && v.duration) {
      saveProgress(movie, v.currentTime, v.duration);
    }
    if (document.fullscreenElement) {
      try { await document.exitFullscreen?.(); } catch {/* ignore */}
    }
    const orientation = (screen as any).orientation;
    try { await orientation?.lock?.("portrait"); } catch { /* ignore */ }
    try { orientation?.unlock?.(); } catch { /* ignore */ }
    onClose();
  };

  // Save periodically while playing & on unmount
  useEffect(() => {
    return () => {
      const v = videoRef.current;
      if (v && v.duration) saveProgress(movie, v.currentTime, v.duration);
      const orientation = (screen as any).orientation;
      try { orientation?.lock?.("portrait").catch?.(() => {}); } catch { /* ignore */ }
      try { orientation?.unlock?.(); } catch { /* ignore */ }
      if (document.fullscreenElement) {
        try { document.exitFullscreen?.(); } catch { /* ignore */ }
      }
    };
  }, [movie]);

  useEffect(() => {
    const mediaSession = "mediaSession" in navigator ? navigator.mediaSession : undefined;
    if (!mediaSession) return;

    mediaSession.metadata = new MediaMetadata({
      title: castConnected ? `Casting ${title}` : title,
      artist: castConnected ? "Connected Chromecast" : "Primeflix",
      album: "Primeflix",
      artwork: poster ? [
        { src: poster, sizes: "96x96", type: "image/png" },
        { src: poster, sizes: "256x256", type: "image/png" },
        { src: poster, sizes: "512x512", type: "image/png" },
      ] : undefined,
    });

    mediaSession.setActionHandler("play", () => {
      if (castConnected && castStartedRef.current) playRemote();
      else videoRef.current?.play();
      setPlaying(true);
    });
    mediaSession.setActionHandler("pause", () => {
      if (castConnected && castStartedRef.current) pauseRemote();
      else videoRef.current?.pause();
      setPlaying(false);
    });
    mediaSession.setActionHandler("seekbackward", () => seek(-10));
    mediaSession.setActionHandler("seekforward", () => seek(10));
    mediaSession.setActionHandler("seekto", (details) => {
      if (typeof details.seekTime !== "number") return;
      if (castConnected && castStartedRef.current) seekRemote(details.seekTime);
      if (videoRef.current) videoRef.current.currentTime = details.seekTime;
    });

    return () => {
      mediaSession.metadata = null;
    };
  }, [castConnected, pauseRemote, playRemote, poster, seekRemote, title]);

  useEffect(() => {
    if (!castConnected || !src || castStartedRef.current) return;
    const startTime = videoRef.current?.currentTime || getProgress(movie.stream_id)?.position || 0;
    castMovie({ movie, src, title, poster, startTime })
      .then((started) => {
        if (!started) return;
        castStartedRef.current = true;
        videoRef.current?.pause();
        setPlaying(true);
        setLoading(false);
      })
      .catch(() => {});
  }, [castConnected, castMovie, movie, poster, src, title]);

  const togglePlay = () => {
    const v = videoRef.current; if (!v) return;
    if (castConnected && castStartedRef.current) {
      if (playing) {
        pauseRemote();
        setPlaying(false);
      } else {
        playRemote();
        setPlaying(true);
      }
      return;
    }
    if (v.paused) { v.play(); } else { v.pause(); }
  };

  const toggleMute = () => {
    const v = videoRef.current; if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const seek = (delta: number) => {
    const v = videoRef.current; if (!v) return;
    const nextTime = Math.max(0, Math.min((v.duration || duration || 0), v.currentTime + delta));
    if (castConnected && castStartedRef.current) seekRemote(nextTime);
    v.currentTime = nextTime;
  };

  const onSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current; if (!v || !v.duration) return;
    const pct = Number(e.target.value);
    const nextTime = (pct / 100) * v.duration;
    if (castConnected && castStartedRef.current) seekRemote(nextTime);
    v.currentTime = nextTime;
    setProgress(pct);
  };

  const onVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current; if (!v) return;
    const val = Number(e.target.value);
    v.volume = val;
    v.muted = val === 0;
    setVolume(val);
    setMuted(val === 0);
  };

  const bumpControls = useCallback(() => {
    setShowControls(true);
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setShowControls(false), 3000);
  }, []);

  useEffect(() => {
    bumpControls();
    return () => { if (hideTimer.current) window.clearTimeout(hideTimer.current); };
  }, [bumpControls]);

  const fmt = (s: number) => {
    if (!isFinite(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, "0");
    const h = Math.floor(m / 60);
    if (h > 0) return `${h}:${(m % 60).toString().padStart(2, "0")}:${sec}`;
    return `${m}:${sec}`;
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
      onMouseMove={bumpControls}
      onTouchStart={bumpControls}
    >
      <div ref={containerRef} className="relative w-full h-full bg-black flex items-center justify-center" onClick={bumpControls}>
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          autoPlay
          playsInline
          controlsList="nodownload noplaybackrate noremoteplayback"
          disablePictureInPicture
          className={`w-full h-full ${fitMode === "cover" ? "object-cover" : "object-contain"}`}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onVolumeChange={(e) => { const v = e.currentTarget; setMuted(v.muted); setVolume(v.volume); }}
          onTimeUpdate={(e) => {
            const v = e.currentTarget;
            if (v.duration) setProgress((v.currentTime / v.duration) * 100);
            if ("mediaSession" in navigator && v.duration) {
              try {
                navigator.mediaSession.setPositionState({ duration: v.duration, playbackRate: 1, position: v.currentTime });
              } catch { /* ignore */ }
            }
            // Save every 5 seconds
            const now = Date.now();
            if (v.duration && now - lastSaveRef.current > 5000) {
              lastSaveRef.current = now;
              saveProgress(movie, v.currentTime, v.duration);
            }
          }}
          onLoadedMetadata={(e) => {
            const v = e.currentTarget;
            setDuration(v.duration || 0);
            // Resume from saved position
            if (!resumedRef.current) {
              resumedRef.current = true;
              const saved = getProgress(movie.stream_id);
              if (saved && saved.position > 5 && (!v.duration || saved.position < v.duration - 10)) {
                try { v.currentTime = saved.position; } catch { /* ignore */ }
              }
            }
          }}
          onClick={(e) => { e.stopPropagation(); togglePlay(); bumpControls(); }}
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

        {/* Netflix-style overlay */}
        <div
          className={`absolute inset-0 flex flex-col justify-between transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          {/* Top bar */}
          <div className="p-4 md:p-6 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
            <button
              onClick={handleClose}
              className="flex items-center gap-2 text-white hover:text-primary transition-colors"
              aria-label="Close player"
            >
              <X className="h-7 w-7" />
              <span className="hidden md:inline text-sm font-medium">Back to browse</span>
            </button>
            <p className="text-white font-semibold truncate px-3 text-base md:text-lg drop-shadow-lg">{title}</p>
            <div className="w-7 md:w-32" />
          </div>

          {/* Center play/seek */}
          <div className="flex-1 flex items-center justify-center gap-8 md:gap-16" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => seek(-10)} className="text-white/90 hover:text-white hover:scale-110 transition-transform" aria-label="Rewind 10 seconds">
              <RotateCcw className="h-10 w-10 md:h-12 md:w-12" />
            </button>
            <button onClick={togglePlay} className="text-white hover:scale-110 transition-transform" aria-label={playing ? "Pause" : "Play"}>
              {playing ? <Pause className="h-16 w-16 md:h-20 md:w-20 fill-white" /> : <Play className="h-16 w-16 md:h-20 md:w-20 fill-white" />}
            </button>
            <button onClick={() => seek(10)} className="text-white/90 hover:text-white hover:scale-110 transition-transform" aria-label="Forward 10 seconds">
              <RotateCw className="h-10 w-10 md:h-12 md:w-12" />
            </button>
          </div>

          {/* Bottom bar */}
          <div className="p-4 md:p-6 bg-gradient-to-t from-black/90 to-transparent" onClick={(e) => e.stopPropagation()}>
            {/* Progress */}
            <div className="flex items-center gap-3 mb-3">
              <input
                type="range"
                min={0}
                max={100}
                step={0.1}
                value={progress}
                onChange={onSeekChange}
                className="flex-1 h-1 accent-primary cursor-pointer"
                aria-label="Seek"
              />
              <span className="text-xs md:text-sm text-white tabular-nums whitespace-nowrap">
                {fmt((progress / 100) * duration)} / {fmt(duration)}
              </span>
            </div>
            {/* Controls row */}
            <div className="flex items-center gap-4">
              <button onClick={togglePlay} className="text-white hover:text-primary transition-colors" aria-label={playing ? "Pause" : "Play"}>
                {playing ? <Pause className="h-6 w-6 fill-white" /> : <Play className="h-6 w-6 fill-white" />}
              </button>
              <div className="flex items-center gap-2 group/vol">
                <button onClick={toggleMute} className="text-white hover:text-primary transition-colors" aria-label={muted ? "Unmute" : "Mute"}>
                  {muted || volume === 0 ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={muted ? 0 : volume}
                  onChange={onVolumeChange}
                  className="w-0 group-hover/vol:w-24 transition-all h-1 accent-primary cursor-pointer"
                  aria-label="Volume"
                />
              </div>
              <p className="ml-auto text-white/90 text-sm md:text-base font-medium truncate max-w-[40%]">{title}</p>
              <button
                onClick={() => setFitMode((m) => (m === "contain" ? "cover" : "contain"))}
                className="text-white hover:text-primary transition-colors flex items-center gap-1.5"
                aria-label={fitMode === "contain" ? "Fit to screen" : "Original aspect"}
                title={fitMode === "contain" ? "Fit to screen (fill)" : "Original aspect"}
              >
                {fitMode === "contain" ? <Maximize2 className="h-6 w-6" /> : <Minimize2 className="h-6 w-6" />}
                <span className="hidden md:inline text-xs font-medium">
                  {fitMode === "contain" ? "Fit" : "Original"}
                </span>
              </button>
              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-primary transition-colors flex items-center gap-1.5"
                aria-label={isFullscreen ? "Exit fullscreen" : "Enlarge to fullscreen"}
                title={isFullscreen ? "Exit fullscreen" : "Enlarge"}
              >
                {isFullscreen ? <Shrink className="h-6 w-6" /> : <Expand className="h-6 w-6" />}
                <span className="hidden md:inline text-xs font-medium">
                  {isFullscreen ? "Exit" : "Enlarge"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}