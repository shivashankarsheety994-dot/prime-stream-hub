import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VodStream } from "@/lib/xtream";
import { MovieCard } from "./MovieCard";

interface Props { title: string; movies: VodStream[]; }

export function GenreRow({ title, movies }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  if (!movies.length) return null;

  const scroll = (dir: "l" | "r") => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir === "l" ? -el.clientWidth * 0.8 : el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <section className="py-4 md:py-6 group/row">
      <h3 className="px-4 md:px-8 text-xl md:text-2xl font-bold mb-3 tracking-wide">
        {title} <span className="text-muted-foreground text-sm font-normal">({movies.length})</span>
      </h3>
      <div className="relative">
        <Button
          variant="ghost" size="icon"
          onClick={() => scroll("l")}
          className="absolute left-1 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-background/80 hover:bg-background opacity-0 group-hover/row:opacity-100 transition-opacity hidden md:flex"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <div ref={ref} className="flex gap-3 overflow-x-auto scrollbar-hide px-4 md:px-8 pb-4">
          {movies.map((m) => <MovieCard key={m.stream_id} movie={m} />)}
        </div>
        <Button
          variant="ghost" size="icon"
          onClick={() => scroll("r")}
          className="absolute right-1 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-background/80 hover:bg-background opacity-0 group-hover/row:opacity-100 transition-opacity hidden md:flex"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>
    </section>
  );
}