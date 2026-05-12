const API_URL = "https://cbhcwfjiuwmpjdfimjwd.supabase.co/functions/v1/xtream-api";

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

export function formatTimestamp(ts?: string | number): string {
  if (!ts) return "—";
  const n = typeof ts === "string" ? parseInt(ts, 10) : ts;
  if (!n || isNaN(n)) return String(ts);
  const d = new Date(n * 1000);
  if (isNaN(d.getTime())) return String(ts);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export interface VodInfo {
  info?: {
    movie_image?: string;
    cover_big?: string;
    plot?: string;
    genre?: string;
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
  const base = API_URL.replace(/\/functions\/v1\/xtream-api\/?$/, "");
  return `${base}/movie/${encodeURIComponent(
    username,
  )}/${encodeURIComponent(password)}/${movie.stream_id}.${ext}`;
}
