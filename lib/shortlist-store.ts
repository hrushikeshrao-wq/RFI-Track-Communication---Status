import type { LoggedAnswer } from "@/lib/simulation";

export const SHORTLIST_STORAGE_KEY = "right-rail-shortlist-v0";

export type ShortlistSnapshot = {
  railAdded: string[];
  dismissed: string[];
  cleared: boolean;
  answers: LoggedAnswer[];
  query: string;
};

export function readShortlist(): ShortlistSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SHORTLIST_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ShortlistSnapshot;
    if (!parsed || !Array.isArray(parsed.railAdded) || !Array.isArray(parsed.answers)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeShortlist(snapshot: ShortlistSnapshot): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SHORTLIST_STORAGE_KEY, JSON.stringify(snapshot));
}

export function clearShortlistStore(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SHORTLIST_STORAGE_KEY);
}
