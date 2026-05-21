import { VodStream } from "./xtream";

const KEY = "prime-cinema-watch-progress";
const MAX_ENTRIES = 30;

export interface WatchEntry {
  movie: VodStream;
  position: number; // seconds
  duration: number; // seconds
  updatedAt: number; // ms epoch
  completed?: boolean;
}

export function getAllProgress(): WatchEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as WatchEntry[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function getProgress(streamId: number): WatchEntry | undefined {
  return getAllProgress().find((e) => e.movie.stream_id === streamId);
}

export function saveProgress(movie: VodStream, position: number, duration: number) {
  if (!duration || position < 5) return;
  const completed = duration > 0 && position / duration >= 0.95;
  const all = getAllProgress().filter((e) => e.movie.stream_id !== movie.stream_id);
  all.unshift({ movie, position, duration, updatedAt: Date.now(), completed });
  const trimmed = all.slice(0, MAX_ENTRIES);
  try {
    localStorage.setItem(KEY, JSON.stringify(trimmed));
    window.dispatchEvent(new CustomEvent("watch-progress-updated"));
  } catch { /* ignore */ }
}

export function removeProgress(streamId: number) {
  const all = getAllProgress().filter((e) => e.movie.stream_id !== streamId);
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
    window.dispatchEvent(new CustomEvent("watch-progress-updated"));
  } catch { /* ignore */ }
}

export function getContinueWatching(): WatchEntry[] {
  return getAllProgress()
    .filter((e) => !e.completed && e.movie?.stream_id && e.movie?.name)
    .sort((a, b) => b.updatedAt - a.updatedAt);
}