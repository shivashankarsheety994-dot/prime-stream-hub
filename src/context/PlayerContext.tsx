import { createContext, useContext, useState, ReactNode } from "react";
import { VideoPlayer } from "@/components/VideoPlayer";
import { useAuth } from "./AuthContext";
import { buildStreamUrl, VodStream } from "@/lib/xtream";

interface PlayerCtx {
  play: (movie: VodStream) => void;
}

const Ctx = createContext<PlayerCtx | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const { credentials } = useAuth();
  const [current, setCurrent] = useState<VodStream | null>(null);

  const play = (movie: VodStream) => setCurrent(movie);
  const close = () => setCurrent(null);

  const src = current && credentials ? buildStreamUrl(current, credentials.username, credentials.password) : "";

  return (
    <Ctx.Provider value={{ play }}>
      {children}
      {current && (
        <VideoPlayer
          src={src}
          title={current.name}
          poster={current.stream_icon}
          onClose={close}
        />
      )}
    </Ctx.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}