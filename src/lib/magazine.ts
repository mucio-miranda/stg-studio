export type MagazineCategory = "Dia a dia" | "Produção" | "Bastidores";
export type MagazineBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "quote"; text: string };

export type MagazinePost = {
  slug: string;
  title: string;
  category: MagazineCategory;
  excerpt: string;
  cover: { src: string; alt: string; position: string };
  publishedAt: string | null;
  body: MagazineBlock[];
};

export function readingMinutes(post: MagazinePost): number {
  const words = [post.excerpt, ...post.body.map((block) => block.text)].join(" ").trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}
export function formatMagazineDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" }).format(new Date(value));
}

// Admin textarea format: blocks separated by blank lines; "## " starts a heading, "> " a quote.
export function parseBody(text: string): MagazineBlock[] {
  return text.replace(/\r/g, "").split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean).map((block) =>
    block.startsWith("## ") ? { type: "heading", text: block.slice(3).trim() } :
    block.startsWith("> ") ? { type: "quote", text: block.replace(/^> ?/gm, "").trim() } :
    { type: "paragraph", text: block.replace(/\n/g, " ") });
}
export function serializeBody(body: MagazineBlock[]): string {
  return body.map((block) => block.type === "heading" ? "## " + block.text : block.type === "quote" ? "> " + block.text : block.text).join("\n\n");
}
