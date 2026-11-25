export const categories = ["Saias", "Jaquetas", "Calças", "Acessórios", "Bolsas"] as const;
export type Category = (typeof categories)[number];
export type GarmentModel = "skirt" | "jacket" | "pants" | "pendant" | "bag";
export const models: Record<GarmentModel, string> = { skirt: "Saia", jacket: "Jaqueta", pants: "Calça", pendant: "Pingente", bag: "Bolsa" };
// Admin-facing names for CSS object-position values used by product photos, covers and the brand banner.
export const positions: Record<string, string> = { Centro: "50% 50%", Topo: "50% 15%", Base: "50% 85%", Esquerda: "20% 50%", Direita: "80% 50%" };
export const positionLabel = (value: string | undefined) => Object.keys(positions).find((key) => positions[key] === value) ?? "Centro";

// Inventory comes from src/lib/data.ts (static for now; a backend will replace it). No stock or size availability is implied.
export type Product = { id: string; name: string; category: Category; image: string; position: string; description: string; price: number | null; serialPrefix: string; model: GarmentModel; sort: number };

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
export function formatPrice(price: number | null) { return price === null ? "Sob consulta" : currency.format(price); }
export function shopHref(category: Category | "Tudo" = "Tudo") {
  return category === "Tudo" ? "/shop" : `/shop?categoria=${encodeURIComponent(category)}`;
}

// Home editorial art direction from the Figma layout, independent of inventory.
export const collectionImages = [
  { image: "/images/collection-01.webp", alt: "Editorial STG: modelo com peça de denim desfiado", caption: "RECONSTRUIR", product: "denim-rework" },
  { image: "/images/collection-02.webp", alt: "Editorial STG: detalhe de acessório metálico em forma de estrela", caption: "RESSIGNIFICAR", product: "silver-eye" },
  { image: "/images/collection-03.webp", alt: "Editorial STG: jeans com detalhe do olho da marca", caption: "REINTERPRETAR", product: "denim-eye" },
  { image: "/images/collection-04.webp", alt: "Editorial STG: textura de denim escuro com aplicações metálicas", caption: "REEXISTIR", product: "jacket-studs" },
];
export const categoryImages: Record<Category, string> = { Saias: "/images/collection-01.webp", Jaquetas: "/images/collection-04.webp", Calças: "/images/collection-03.webp", Acessórios: "/images/collection-02.webp", Bolsas: "/images/bag.webp" };
