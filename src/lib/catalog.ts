import homeContent from "../../content/home.json";

export const categories =["Saias", "Jaquetas", "Calças", "Acessórios", "Bolsas"] as const;
export type Category = (typeof categories)[number];
export type GarmentModel = "skirt" | "jacket" | "pants" | "pendant" | "bag";
export const models: Record<GarmentModel, string> = { skirt: "Saia", jacket: "Jaqueta", pants: "Calça", pendant: "Pingente", bag: "Bolsa" };
// Admin-facing names for CSS object-position values used by product photos, covers and the brand banner.
export const positions: Record<string, string> = { Centro: "50% 50%", Topo: "50% 15%", Base: "50% 85%", Esquerda: "20% 50%", Direita: "80% 50%" };
export const positionLabel = (value: string | undefined) => Object.keys(positions).find((key) => positions[key] === value) ?? "Centro";

// Inventory comes from src/lib/data.ts, which reads content/products.json (edited in the CMS). No stock or size availability is implied.
export type Product = { id: string; name: string; category: Category; image: string; position: string; description: string; price: number | null; serialPrefix: string; model: GarmentModel; sort: number };

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
export function formatPrice(price: number | null) { return price === null ? "Sob consulta" : currency.format(price); }
export function shopHref(category: Category | "Tudo" = "Tudo") {
  return category === "Tudo" ? "/shop" : `/shop?categoria=${encodeURIComponent(category)}`;
}

// Home editorial art direction, edited in the CMS (/admin) and stored in content/home.json.
export const home = homeContent;
export const collectionImages = home.collection.cards;
export const categoryImages: Record<Category, string> = { Saias: home.categories.saias, Jaquetas: home.categories.jaquetas, Calças: home.categories.calcas, Acessórios: home.categories.acessorios, Bolsas: home.categories.bolsas };
