import { createContext, useContext, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { VideoPlayer } from "@/components/VideoPlayer";
import { useAuth } from "./AuthContext";
import { buildStreamUrl, VodStream } from "@/lib/xtream";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";

interface PlayerCtx {
  play: (movie: VodStream) => void;
}

const Ctx = createContext<PlayerCtx | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const { user, credentials } = useAuth();
  const [current, setCurrent] = useState<VodStream | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const play = (movie: VodStream) => {
    if (user?.exp_date) {
      const expDate = new Date(Number(user.exp_date) * 1000);
      const now = new Date();
      if (expDate.getTime() < now.getTime()) {
        toast({
          title: "Subscription Expired",
          description: "Please subscribe to watch this movie.",
          action: <ToastAction altText="Subscribe" onClick={() => navigate("/plans")}>Subscribe Now</ToastAction>,
        });
        return;
      }
    }
    setCurrent(movie);
  };

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
          movie={current}
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
