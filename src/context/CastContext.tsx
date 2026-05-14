import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { VodStream } from "@/lib/xtream";

declare global {
  interface Window {
    __onGCastApiAvailable?: (available: boolean) => void;
    cast?: any;
    chrome?: any;
  }
}

interface CastMediaPayload {
  movie: VodStream;
  src: string;
  title: string;
  poster?: string;
  startTime?: number;
}

interface CastCtx {
  available: boolean;
  connected: boolean;
  deviceName: string | null;
  connect: () => Promise<void>;
  castMovie: (payload: CastMediaPayload) => Promise<boolean>;
  playRemote: () => void;
  pauseRemote: () => void;
  seekRemote: (time: number) => void;
}

const Ctx = createContext<CastCtx | undefined>(undefined);

export function CastProvider({ children }: { children: ReactNode }) {
  const [available, setAvailable] = useState(false);
  const [connected, setConnected] = useState(false);
  const [deviceName, setDeviceName] = useState<string | null>(null);

  const refreshSession = useCallback(() => {
    const castContext = window.cast?.framework?.CastContext?.getInstance?.();
    const session = castContext?.getCurrentSession?.();
    setConnected(Boolean(session));
    setDeviceName(session?.getCastDevice?.()?.friendlyName || session?.getSessionObj?.()?.receiver?.friendlyName || null);
  }, []);

  useEffect(() => {
    if (window.cast?.framework) {
      setAvailable(true);
      refreshSession();
      return;
    }

    window.__onGCastApiAvailable = (isAvailable: boolean) => {
      if (!isAvailable || !window.cast?.framework || !window.chrome?.cast) return;
      const castContext = window.cast.framework.CastContext.getInstance();
      castContext.setOptions({
        receiverApplicationId: window.chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
        autoJoinPolicy: window.chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
      });
      castContext.addEventListener(
        window.cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
        refreshSession,
      );
      setAvailable(true);
      refreshSession();
    };

    const existing = document.querySelector<HTMLScriptElement>('script[src*="gstatic.com/cv/js/sender"]');
    if (!existing) {
      const script = document.createElement("script");
      script.src = "https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1";
      script.async = true;
      document.body.appendChild(script);
    }
  }, [refreshSession]);

  const connect = useCallback(async () => {
    const castContext = window.cast?.framework?.CastContext?.getInstance?.();
    if (!castContext) return;
    await castContext.requestSession();
    refreshSession();
  }, [refreshSession]);

  const getMediaSession = useCallback(() => {
    const castContext = window.cast?.framework?.CastContext?.getInstance?.();
    return castContext?.getCurrentSession?.()?.getMediaSession?.();
  }, []);

  const castMovie = useCallback(async ({ movie, src, title, poster, startTime = 0 }: CastMediaPayload) => {
    const castContext = window.cast?.framework?.CastContext?.getInstance?.();
    if (!castContext || !window.chrome?.cast?.media) return false;
    const session = castContext.getCurrentSession?.() || await castContext.requestSession();
    if (!session) return false;

    const ext = (movie.container_extension || src.split(".").pop() || "mp4").toLowerCase().split("?")[0];
    const contentType = ext === "m3u8" ? "application/x-mpegURL" : ext === "webm" ? "video/webm" : "video/mp4";
    const mediaInfo = new window.chrome.cast.media.MediaInfo(src, contentType);
    const metadata = new window.chrome.cast.media.MovieMediaMetadata();
    metadata.title = title;
    if (poster) metadata.images = [new window.chrome.cast.Image(poster)];
    mediaInfo.metadata = metadata;
    mediaInfo.streamType = window.chrome.cast.media.StreamType.BUFFERED;

    const request = new window.chrome.cast.media.LoadRequest(mediaInfo);
    request.autoplay = true;
    request.currentTime = Math.max(0, startTime);

    await session.loadMedia(request);
    refreshSession();
    return true;
  }, [refreshSession]);

  const playRemote = useCallback(() => {
    getMediaSession()?.play?.(null, undefined, undefined);
  }, [getMediaSession]);

  const pauseRemote = useCallback(() => {
    getMediaSession()?.pause?.(null, undefined, undefined);
  }, [getMediaSession]);

  const seekRemote = useCallback((time: number) => {
    const media = getMediaSession();
    if (!media || !window.chrome?.cast?.media) return;
    const request = new window.chrome.cast.media.SeekRequest();
    request.currentTime = Math.max(0, time);
    media.seek(request, undefined, undefined);
  }, [getMediaSession]);

  const value = useMemo(() => ({
    available,
    connected,
    deviceName,
    connect,
    castMovie,
    playRemote,
    pauseRemote,
    seekRemote,
  }), [available, connected, deviceName, connect, castMovie, playRemote, pauseRemote, seekRemote]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCast must be used within CastProvider");
  return ctx;
}