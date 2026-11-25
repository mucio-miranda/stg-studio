// Only same-origin relative destinations; never trust an incoming next parameter.
export function safeNext(value: string | null, fallback = "/voce"): string {
  if (!value || value.length > 1500 || !value.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u0020]/.test(value)) return fallback;
  try {
    const url = new URL(value, "https://stg.invalid");
    return url.origin === "https://stg.invalid" ? url.pathname + url.search : fallback;
  } catch { return fallback; }
}
