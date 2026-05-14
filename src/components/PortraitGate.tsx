import { Smartphone } from "lucide-react";

/**
 * Asks the user to rotate their phone to portrait when the app is on a small
 * screen in landscape. The video player escapes this overlay because it sits
 * at z-[100] (above z-90).
 */
export function PortraitGate() {
  return (
    <div className="portrait-only-overlay">
      <Smartphone className="h-12 w-12 text-primary animate-pulse" />
      <h2 className="text-xl font-bold tracking-wide">Please rotate to portrait</h2>
      <p className="text-sm text-muted-foreground max-w-xs">
        Primeflix is designed for portrait mode. Videos will automatically rotate to landscape when playing.
      </p>
    </div>
  );
}