import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CinemaLoader } from "@/components/CinemaLoader";
import { useAuth } from "@/context/AuthContext";
import { Header } from "@/components/Header";
import { MovieCard } from "@/components/MovieCard";
import {
  getVodStreams,
  getVodCategories,
  getStreamCategoryIds,
  VodStream,
  VodCategory,
  getVodInfo,
  getAllGenres,
  parseGenres,
  VodInfo,
  getVodLanguage,
} from "@/lib/xtream";
import { Hero } from "@/components/Hero";

export default function Index() {
  const { user, credentials, loading } = useAuth();
  const [streams, setStreams] = useState<VodStream[]>([]);
  const [categories, setCategories] = useState<VodCategory[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [vodInfoMap, setVodInfoMap] = useState<Map<number, VodInfo | null>>(new Map());
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!credentials) return;
    let cancelled = false;
    (async () => {
      setDataLoading(true);
      try {
        const [cats, vods] = await Promise.all([
          getVodCategories(credentials.username, credentials.password),
          getVodStreams(credentials.username, credentials.password),
        ]);

        if (!cancelled) {
          setCategories(cats);
          setStreams(vods);

          // Fetch genre and language data from all VOD info
          const infoMap = new Map<number, VodInfo | null>();
          const vodInfos = await Promise.all(
            vods.map(async (stream) => {
              const info = await getVodInfo(
                credentials.username,
                credentials.password,
                stream.stream_id
              );
              infoMap.set(stream.stream_id, info);
              return info;
            })
          );

          if (!cancelled) {
            setVodInfoMap(infoMap);
            const allGenres = getAllGenres(vodInfos);
            setGenres(allGenres);
            setDataLoading(false);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        if (!cancelled) {
          setDataLoading(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [credentials]);

  const sortedStreams = useMemo(() => {
    return [...streams].sort((a, b) => {
      const aT = a.added ? parseInt(a.added, 10) : 0;
      const bT = b.added ? parseInt(b.added, 10) : 0;
      return bT - aT;
    });
  }, [streams]);

  const heroMovies = useMemo(() => {
    return sortedStreams.slice(0, 5);
  }, [sortedStreams]);

  const genreScrollRef = useRef<HTMLDivElement | null>(null);
  const [showGenreArrows, setShowGenreArrows] = useState(false);

  useEffect(() => {
    const updateArrowVisibility = () => {
      const element = genreScrollRef.current;
      if (!element) {
        setShowGenreArrows(false);
        return;
      }
      setShowGenreArrows(element.scrollWidth > element.clientWidth + 8);
    };

    updateArrowVisibility();
    window.addEventListener("resize", updateArrowVisibility);
    return () => window.removeEventListener("resize", updateArrowVisibility);
  }, [genres]);

  const categoriesWithMovies = useMemo(() => {
    return categories
      .map((category) => ({
        category,
        count: sortedStreams.filter((stream) => getStreamCategoryIds(stream).includes(category.category_id)).length,
      }))
      .filter((item) => item.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [categories, sortedStreams]);

  const scrollGenres = (direction: number) => {
    if (!genreScrollRef.current) return;
    genreScrollRef.current.scrollBy({
      left: direction * 280,
      behavior: "smooth",
    });
  };

  if (loading) {
    return <CinemaLoader fullscreen />;
  }
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen min-w-0 bg-background overflow-x-hidden">
      <Header />
      <main className="relative z-10 min-w-0 max-w-full">
        {dataLoading ? (
          <CinemaLoader label="Loading movies" />
        ) : streams.length === 0 ? (
          <div className="text-center py-32 px-4">
            <h2 className="text-2xl font-bold mb-2">No movies available</h2>
            <p className="text-muted-foreground">Your account is signed in, but no movie catalog was returned by the API.</p>
          </div>
        ) : (
          <>
            {heroMovies.length > 0 && <Hero movies={heroMovies} />}
            {genres.length > 0 && (
              <section className="mt-6 min-w-0">
                <div className="flex items-center justify-between gap-3 mb-3 px-2 sm:px-4 min-w-0">
                  <div>
                    <h2 className="text-xl font-bold">Browse by Genre</h2>
                    <div className="mt-1 text-xs text-muted-foreground md:hidden flex items-center gap-1">
                      <ChevronLeft className="h-3 w-3" />
                      Swipe left/right
                      <ChevronRight className="h-3 w-3" />
                    </div>
                  </div>
                </div>
                <div className="relative md:overflow-hidden min-w-0">
                  {showGenreArrows && (
                    <button
                      type="button"
                      onClick={() => scrollGenres(-1)}
                      className="absolute left-2 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-[#dca250] text-black shadow-lg shadow-[#dca250]/30 transition hover:bg-[#c7994a] focus:outline-none md:flex hidden"
                      aria-label="Scroll genres left"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                  )}
                  <div
                    ref={genreScrollRef}
                    className="flex min-w-0 gap-2 sm:gap-3 overflow-x-auto overflow-y-hidden scrollbar-hide pb-2 snap-x snap-mandatory scroll-pl-2 sm:scroll-pl-4 px-2 sm:px-4"
                    style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-x" }}
                  >
                    {genres.map((genre) => (
                      <Link
                        key={genre}
                        to={`/genre/${encodeURIComponent(genre)}`}
                        className="snap-start inline-flex min-w-max flex-shrink-0 items-center justify-center gap-2 rounded-lg border border-[#b18644] bg-gradient-to-br from-[#dca250] via-[#d7a64f] to-[#bd8f43] px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold text-white shadow-[0_12px_25px_-10px_rgba(220,162,80,0.8)] transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-[0_16px_30px_-12px_rgba(220,162,80,0.95)] active:translate-y-0.5 active:shadow-[0_8px_15px_-8px_rgba(220,162,80,0.7)]"
                      >
                        <span className="capitalize">{genre}</span>
                      </Link>
                    ))}
                  </div>
                  {showGenreArrows && (
                    <button
                      type="button"
                      onClick={() => scrollGenres(1)}
                      className="absolute right-2 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-[#dca250] text-black shadow-lg shadow-[#dca250]/30 transition hover:bg-[#c7994a] focus:outline-none md:flex hidden"
                      aria-label="Scroll genres right"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </section>
            )}
            <div className="px-4 mt-6">
              <h2 className="text-xl font-bold">Latest Releases</h2>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 p-4">
              {sortedStreams.map((movie) => (
                <MovieCard 
                  key={movie.stream_id} 
                  movie={movie} 
                  categories={categories}
                  vodLanguage={getVodLanguage(vodInfoMap.get(movie.stream_id))}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
