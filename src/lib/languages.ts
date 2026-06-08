import { VodCategory, VodStream } from "./xtream";

export interface LanguageDef {
  slug: string;
  native: string;
  english: string;
  keywords: string[];
}

export const LANGUAGES: LanguageDef[] = [
  { slug: "kannada", native: "ಕನ್ನಡ", english: "Kannada", keywords: ["kannada"] },
  { slug: "tamil", native: "தமிழ்", english: "Tamil", keywords: ["tamil"] },
  { slug: "telugu", native: "తెలుగు", english: "Telugu", keywords: ["telugu"] },
  { slug: "hindi", native: "हिन्दी", english: "Hindi", keywords: ["hindi", "bollywood"] },
  { slug: "english", native: "English", english: "English", keywords: ["english", "hollywood"] },
  { slug: "malayalam", native: "മലയാളം", english: "Malayalam", keywords: ["malayalam"] },
];

export function filterByLanguage(
  lang: LanguageDef,
  streams: VodStream[],
  categories: VodCategory[],
): VodStream[] {
  const catNameById = new Map(categories.map((c) => [c.category_id, c.category_name.toLowerCase()]));
  const matches = streams.filter((s) => {
    const catName = s.category_id ? catNameById.get(s.category_id) ?? "" : "";
    const name = s.name.toLowerCase();
    return lang.keywords.some((k) => catName.includes(k) || name.includes(k));
  });
  matches.sort((a, b) => {
    const aT = a.added ? parseInt(a.added, 10) : 0;
    const bT = b.added ? parseInt(b.added, 10) : 0;
    return bT - aT;
  });
  return matches;
}

export function getStreamLanguages(
  stream: VodStream,
  categories: VodCategory[],
): LanguageDef[] {
  const catNameById = new Map(categories.map((c) => [c.category_id, c.category_name.toLowerCase()]));
  const catName = stream.category_id ? catNameById.get(stream.category_id) ?? "" : "";
  const name = stream.name.toLowerCase();
  
  return LANGUAGES.filter((lang) =>
    lang.keywords.some((k) => catName.includes(k) || name.includes(k))
  );
}