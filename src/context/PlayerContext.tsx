import { createContext, useContext, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { VideoPlayer } from "@/components/VideoPlayer";
import { useAuth } from "./AuthContext";
import { buildStreamUrl, VodStream } from "@/lib/xtream";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";

interface PlayerCtx {
  play: (movie: VodStream, startTime?: number) => void;
}

interface CurrentStream extends VodStream {
  startTime?: number;
}

const Ctx = createContext<PlayerCtx | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const { user, credentials } = useAuth();
  const [current, setCurrent] = useState<CurrentStream | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const play = (movie: VodStream, startTime?: number) => {
    const normalizedStatus = user?.status?.toLowerCase().trim() ?? "";
    const accountClosed = normalizedStatus.includes("closed") || normalizedStatus.includes("inactive") || normalizedStatus.includes("cancelled") || normalizedStatus.includes("suspended");
    if (accountClosed) {
      toast({
        title: "Subscription Closed",
        description: "Your subscription is closed. Please renew to continue watching.",
        action: <ToastAction altText="Subscribe" onClick={() => navigate("/plans")}>Subscribe Now</ToastAction>,
      });
      return;
    }

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

    setCurrent({ ...movie, startTime });
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
          startTime={current.startTime}
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
