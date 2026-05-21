import { Link } from "react-router-dom";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-background via-background/90 to-transparent">
      <div className="container mx-auto h-16 relative px-4 md:px-8">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Link to="/" aria-label="Primeflix home">
            <h1 className="text-2xl md:text-3xl font-bold tracking-[0.2em] text-primary">
              PRIMEFLIX
            </h1>
          </Link>
        </div>
      </div>
    </header>
  );
}
