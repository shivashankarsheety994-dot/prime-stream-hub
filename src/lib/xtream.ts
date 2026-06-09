const API_URL = "https://dhceqootnfrrfddxsqdd.supabase.co/functions/v1/player_api";

export interface XtreamUserInfo {
  username: string;
  password?: string;
  message?: string;
  auth: number;
  status?: string;
  exp_date?: string | number;
  is_trial?: string;
  active_cons?: string;
  created_at?: string | number;
  max_connections?: string;
  allowed_output_formats?: string[];
}

export interface XtreamLoginResponse {
  user_info: XtreamUserInfo;
  server_info?: Record<string, unknown>;
}

export interface VodCategory {
  category_id: string;
  category_name: string;
  parent_id?: number;
}

export interface VodStream {
  num?: number;
  name: string;
  stream_id: number;
  stream_icon?: string;
  rating?: string | number;
  rating_5based?: number;
  added?: string;
  category_id?: string;
  container_extension?: string;
  custom_sid?: string;
  direct_source?: string;
}

async function call<T>(params: Record<string, string>): Promise<T> {
  const url = new URL(API_URL);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json() as Promise<T>;
}

export async function login(username: string, password: string): Promise<XtreamLoginResponse> {
  return call<XtreamLoginResponse>({ username, password });
}

export async function getVodCategories(username: string, password: string): Promise<VodCategory[]> {
  try {
    const data = await call<VodCategory[]>({ username, password, action: "get_vod_categories" });
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function getVodStreams(username: string, password: string, categoryId?: string): Promise<VodStream[]> {
  try {
    const params: Record<string, string> = { username, password, action: "get_vod_streams" };
    if (categoryId) params.category_id = categoryId;
    const data = await call<VodStream[]>(params);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function getStreamCategoryIds(stream: VodStream): string[] {
  if (!stream.category_id) return [];
  return stream.category_id
    .split(/[,|;]/)
    .map((id) => id.trim())
    .filter(Boolean);
}

export function formatTimestamp(ts?: string | number, options?: Intl.DateTimeFormatOptions): string {
  if (ts === undefined || ts === null || ts === "") return "—";

  let date: Date | null = null;
  if (typeof ts === "number") {
    date = ts < 1e12 ? new Date(ts * 1000) : new Date(ts);
  } else {
    const numeric = Number(ts);
    if (!Number.isNaN(numeric)) {
      date = numeric < 1e12 ? new Date(numeric * 1000) : new Date(numeric);
    } else {
      const parsed = Date.parse(ts);
      if (!Number.isNaN(parsed)) {
        date = new Date(parsed);
      }
    }
  }

  if (!date || isNaN(date.getTime())) {
    return String(ts);
  }

  return date.toLocaleDateString(undefined, options ?? { year: "numeric", month: "short", day: "numeric" });
}

export interface VodInfo {
  info?: {
    movie_image?: string;
    cover_big?: string;
    plot?: string;
    genre?: string;
    language?: string;
    duration?: string;
    releasedate?: string;
    rating?: string;
    director?: string;
    cast?: string;
    youtube_trailer?: string;
  };
  movie_data?: {
    stream_id: number;
    name: string;
    container_extension?: string;
  };
}

export interface GenreCategory extends VodCategory {
  isGenre: true;
}

export async function getVodInfo(
  username: string,
  password: string,
  vodId: number,
): Promise<VodInfo | null> {
  try {
    return await call<VodInfo>({
      username,
      password,
      action: "get_vod_info",
      vod_id: String(vodId),
    });
  } catch {
    return null;
  }
}

/**
 * Build a stream URL for an Xtream VOD item. The Xtream Codes spec serves VOD at:
 *   {server}/movie/{username}/{password}/{stream_id}.{ext}
 * Our edge function proxies the upstream API; if it also proxies media, callers
 * may need to swap the host. We return the canonical Xtream path — if the
 * `direct_source` field is provided we prefer that.
 */
export function buildStreamUrl(
  movie: VodStream,
  username: string,
  password: string,
): string {
  if (movie.direct_source && movie.direct_source.startsWith("http")) {
    return movie.direct_source;
  }
  const ext = movie.container_extension || "mp4";
  const base = API_URL.replace(/\/functions\/v1\/player_api\/?$/, "");
  return `${base}/movie/${encodeURIComponent(
    username,
  )}/${encodeURIComponent(password)}/${movie.stream_id}.${ext}`;
}

/**
 * Parse genres from genre string (comma or pipe separated)
 * Normalizes and removes duplicates
 */
export function parseGenres(genreString?: string): string[] {
  if (!genreString) return [];
  return genreString
    .split(/[,|;]/)
    .map((genre) => genre.trim())
    .filter(Boolean)
    .map((genre) => genre.toLowerCase());
}

/**
 * Get all unique genres from a collection of VOD info objects
 * Deduplicates and sorts alphabetically
 */
export function getAllGenres(vodInfos: (VodInfo | null)[]): string[] {
  const genreSet = new Set<string>();
  vodInfos.forEach((info) => {
    const genres = parseGenres(info?.info?.genre);
    genres.forEach((g) => genreSet.add(g));
  });
  return Array.from(genreSet).sort();
}

/**
 * Get language from a VOD info object
 */
export function getVodLanguage(info: VodInfo | null): string {
  return info?.info?.language?.trim() || "";
}

/**
 * Create genre categories from VOD information
 * Returns a deduplicated list of genre-based categories
 */
export async function getGenreCategories(
  username: string,
  password: string,
  streams: VodStream[],
): Promise<GenreCategory[]> {
  // Fetch info for all streams to extract genres
  const vodInfos = await Promise.all(
    streams.map((stream) => getVodInfo(username, password, stream.stream_id))
  );
  
  const genres = getAllGenres(vodInfos);
  
  return genres.map((genre, index) => ({
    category_id: `genre_${genre.replace(/\s+/g, "_")}`,
    category_name: genre.charAt(0).toUpperCase() + genre.slice(1),
    isGenre: true,
  }));
}

/**
 * Get streams that match a specific genre
 */
export function getStreamsByGenre(
  streams: VodStream[],
  vodInfoMap: Map<number, VodInfo | null>,
  genreName: string,
): VodStream[] {
  const targetGenre = genreName.toLowerCase();
  return streams.filter((stream) => {
    const info = vodInfoMap.get(stream.stream_id);
    const genres = parseGenres(info?.info?.genre);
    return genres.includes(targetGenre);
  });
}
