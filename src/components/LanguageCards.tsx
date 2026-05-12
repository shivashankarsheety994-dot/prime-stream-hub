import { Link } from "react-router-dom";
import { LANGUAGES, LanguageDef } from "@/lib/languages";
import { VodStream, VodCategory } from "@/lib/xtream";
import { filterByLanguage } from "@/lib/languages";

interface Props {
  streams: VodStream[];
  categories: VodCategory[];
}

export function LanguageCards({ streams, categories }: Props) {
  const available = LANGUAGES.map((l) => ({
    lang: l,
    count: filterByLanguage(l, streams, categories).length,
  })).filter((x) => x.count > 0);

  if (!available.length) return null;

  return (
    <section className="py-4 md:py-6 px-4 md:px-8">
      <h3 className="text-xl md:text-2xl font-bold mb-3 tracking-wide">Browse by Language</h3>
      <div className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-4 md:-mx-8 px-4 md:px-8 snap-x snap-mandatory">
        {available.map(({ lang, count }) => (
          <div key={lang.slug} className="snap-start flex-shrink-0 w-40 md:w-48">
            <LanguageCard lang={lang} count={count} />
          </div>
        ))}
      </div>
    </section>
  );
}

function LanguageCard({ lang, count }: { lang: LanguageDef; count: number }) {
  return (
    <Link
      to={`/language/${lang.slug}`}
      className="group relative aspect-square w-full rounded-lg overflow-hidden bg-white shadow-md hover:shadow-xl transition-all hover:scale-[1.03] flex flex-col items-center justify-center p-4 text-center"
      aria-label={`Browse ${lang.english} movies`}
    >
      <span
        className="text-3xl md:text-4xl font-bold leading-tight"
        style={{ color: "hsl(0 0% 25%)" }}
      >
        {lang.native}
      </span>
      {lang.native !== lang.english && (
        <span className="mt-2 text-sm md:text-base font-medium" style={{ color: "hsl(0 0% 40%)" }}>
          {lang.english}
        </span>
      )}
      <span className="mt-2 text-xs" style={{ color: "hsl(0 0% 50%)" }}>
        {count} {count === 1 ? "movie" : "movies"}
      </span>
    </Link>
  );
}