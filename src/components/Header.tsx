import { Link } from "react-router-dom";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto flex h-16 items-center justify-start px-4 md:px-8">
        <Link to="/" aria-label="Primeflix home">
          <h1 className="text-2xl font-bold tracking-widest text-red-600">
            PRIMEFLIX
          </h1>
        </Link>
      </div>
    </header>
  );
}