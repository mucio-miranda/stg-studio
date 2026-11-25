"use client";

import { useMemo, useSyncExternalStore, type SetStateAction } from "react";

type SavedItem = { id: string; size: string };
type Selection = { cart: SavedItem[]; favorites: string[] };
const empty = '{"cart":[],"favorites":[]}';
const key = "stg-selection-v1";
const changed = "stg-selection-changed";
let memory = empty;

function read() {
  try { return localStorage.getItem(key) ?? memory; } catch { return memory; }
}

function parse(value: string): Selection {
  try {
    const stored = JSON.parse(value);
    return {
      cart: Array.isArray(stored?.cart) ? stored.cart.filter((item: SavedItem) => typeof item?.id === "string" && typeof item.size === "string").slice(0, 30) : [],
      favorites: Array.isArray(stored?.favorites) ? stored.favorites.filter((id: string) => typeof id === "string") : [],
    };
  } catch { return { cart: [], favorites: [] }; }
}

function subscribe(callback: () => void) {
  const storage = (event: StorageEvent) => { if (event.key === key || event.key === null) callback(); };
  window.addEventListener(changed, callback);
  window.addEventListener("storage", storage);
  return () => { window.removeEventListener(changed, callback); window.removeEventListener("storage", storage); };
}

function save(value: Selection) {
  memory = JSON.stringify(value);
  try { localStorage.setItem(key, memory); } catch { /* Keep the selection in memory if storage is unavailable. */ }
  window.dispatchEvent(new Event(changed));
}

export function useSelection() {
  const snapshot = useSyncExternalStore(subscribe, read, () => empty);
  const selection = useMemo(() => parse(snapshot), [snapshot]);
  return {
    ...selection,
    setCart: (next: SetStateAction<SavedItem[]>) => {
      const current = parse(read());
      save({ ...current, cart: typeof next === "function" ? next(current.cart) : next });
    },
    setFavorites: (next: SetStateAction<string[]>) => {
      const current = parse(read());
      save({ ...current, favorites: typeof next === "function" ? next(current.favorites) : next });
    },
  };
}
