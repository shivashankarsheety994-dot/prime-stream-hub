import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VodStream } from "@/lib/xtream";
import { MovieCard } from "./MovieCard";
import { PosterCard } from "./PosterCard";

interface Props {
  title: string;
  movies: VodStream[];
  variant?: "card" | "poster";
}

export function GenreRow({ title, movies, variant = "card" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  if (!movies.length) return null;

  const Card = variant === "poster" ? PosterCard : MovieCard;

  const scroll = (dir: "l" | "r") => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir === "l" ? -el.clientWidth : el.clientWidth, behavior: "smooth" });
  };

  return (
    <section className="py-4 md:py-6 group/row">
      <div className="px-4 md:px-8 flex items-center justify-between">
        <h3 className="text-xl md:text-2xl font-bold tracking-wide">
          {title} <span className="text-muted-foreground text-sm font-normal">({movies.length})</span>
        </h3>
        <div className="hidden md:flex items-center gap-1">
          <Button
            variant="ghost" size="icon"
            onClick={() => scroll("l")}
            className="h-8 w-8 rounded-full bg-background/80 hover:bg-background opacity-0 group-hover/row:opacity-100 transition-opacity"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost" size="icon"
            onClick={() => scroll("r")}
            className="h-8 w-8 rounded-full bg-background/80 hover:bg-background opacity-0 group-hover/row:opacity-100 transition-opacity"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <div ref={ref} className="flex gap-3 overflow-x-auto scrollbar-hide px-4 md:px-8 py-4 snap-x snap-mandatory scroll-pl-4">
        {movies.map((m) => (
          <div key={m.stream_id} className="snap-start">
            <Card movie={m} />
          </div>
        ))}
      </div>
    </section>
  );
}
