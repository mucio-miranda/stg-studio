import type { Product } from "./catalog";

// A unit is one physical piece (one NFC tag). Knowing a code is not proof of authenticity or ownership.
export type Unit = { code: string; product: Product; ownerId: string | null; claimedAt: string | null };
const codePattern = /^STG-[A-Z0-9]{2,4}-[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/;

export function normalizeCode(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 60) return null;
  const code = value.trim().toUpperCase();
  return codePattern.test(code) ? code : null;
}

export function parsePassportInput(value: string, origin: string): string | null {
  const direct = normalizeCode(value);
  if (direct) return direct;
  try {
    const url = new URL(value.trim());
    if (![origin, "https://stg-studio.vercel.app"].includes(url.origin) || url.search || url.hash) return null;
    const match = url.pathname.match(/^\/pecas\/([^/]+)\/?$/);
    return match ? normalizeCode(decodeURIComponent(match[1])) : null;
  } catch { return null; }
}

export function shortSerial(code: string): string { return `${code.split("-")[1]} · ${code.slice(-8)}`; }
