import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

export function Header() {
  const [show, setShow] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const controlNavbar = () => {
      if (window.scrollY > 100) {
        if (window.scrollY > lastScrollY) {
          setShow(false);
        } else {
          setShow(true);
        }
      } else {
        setShow(true);
      }
      setLastScrollY(window.scrollY);
    };

    window.addEventListener("scroll", controlNavbar);

    return () => {
      window.removeEventListener("scroll", controlNavbar);
    };
  }, [lastScrollY]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
        show ? "translate-y-0" : "-translate-y-full"
      }`}
    >
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