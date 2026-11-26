// Camada de dados do frontend. Produtos, home e contato vêm de content/*.json, editados no Pages CMS (/admin).
// Ao reconectar um backend, mantenha estas assinaturas e troque só a origem dos dados.
import { categories, type Category, type GarmentModel, type Product } from "./catalog";
import type { Unit } from "./digital-passport";
import type { MagazinePost } from "./magazine";
import catalog from "../../content/products.json";
import settings from "../../content/settings.json";

const categoryModels: Record<Category, GarmentModel> = { Saias: "skirt", Jaquetas: "jacket", Calças: "pants", Acessórios: "pendant", Bolsas: "bag" };
type ProductEntry = { id: string; name: string; category: string; image: string; position?: string; description?: string; price?: number | string | null };

// The CMS list order is the shop order. Entries with an unknown category or no photo are skipped instead of breaking the build.
const products: Product[] = (catalog as ProductEntry[]).flatMap((entry, index) => {
  const category = categories.find((item) => item === entry.category);
  if (!entry.id || !entry.name || !entry.image || !category) return [];
  const price = entry.price === null || entry.price === undefined || entry.price === "" ? null : Number(entry.price);
  const initials = entry.name.normalize("NFD").replace(/[^A-Za-z\s]/g, "").split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0].toUpperCase()).join("");
  return [{
    id: entry.id, name: entry.name, category, image: entry.image, position: entry.position || "50% 50%",
    description: entry.description ?? "", price: Number.isFinite(price) ? price : null,
    serialPrefix: initials || "ST", model: categoryModels[category], sort: index + 1,
  }];
});
const posts: MagazinePost[] = [];

export async function getProducts(): Promise<Product[]> { return products; }
export async function getProduct(id: string): Promise<Product | null> { return products.find((product) => product.id === id) ?? null; }

export type BrandImage = { src: string; alt: string; position?: string };
export type BrandProfile = {
  banner: BrandImage | null;
  introduction: string[] | null;
  timeline: { id: string; title: string | null; date: string | null; description: string | null }[];
  team: { name: string; role: string; initials: string; photo: BrandImage | null }[];
};
const brand: BrandProfile = {
  banner: null,
  introduction: null,
  timeline: [],
  team: [
    { name: "Renata Santiago", role: "CEO e Fundadora", initials: "RS", photo: null },
    { name: "Victor Costa", role: "Diretor Criativo", initials: "VC", photo: null },
    { name: "Thiago", role: "Estrategista", initials: "T", photo: null },
  ],
};
export async function getBrandProfile(): Promise<BrandProfile> { return brand; }

// whatsapp is the wa.me link shown in the footer; whatsappNumber receives the cart order.
export type Contact = { instagram: string; tiktok: string; whatsapp: string; whatsappNumber: string };
export async function getContact(): Promise<Contact> {
  // The CMS may save an empty field as null or drop it.
  const { whatsapp, instagram, tiktok } = settings as Partial<Record<"whatsapp" | "instagram" | "tiktok", string | null>>;
  const whatsappNumber = (whatsapp ?? "").replace(/\D/g, "");
  return { instagram: (instagram ?? "").trim(), tiktok: (tiktok ?? "").trim(), whatsapp: whatsappNumber ? `https://wa.me/${whatsappNumber}` : "", whatsappNumber };
}

export async function getMagazinePosts(): Promise<MagazinePost[]> { return posts; }
export async function getMagazinePost(slug: string): Promise<MagazinePost | null> { return posts.find((post) => post.slug === slug) ?? null; }

// Conta e vestuário digital: sem backend ainda. Sem sessão, /voce leva a /entrar e /pecas/[code] responde 404.
export type SessionUser = { id: string; email: string };
export type Profile = { name: string; size: string; role: "customer" | "admin" };
export async function getSessionUser(): Promise<SessionUser | null> { return null; }
export async function getProfile(): Promise<Profile | null> { return null; }
export async function getWardrobe(...args: [string]): Promise<Unit[]> { void args; return []; }
export async function getUnit(...args: [string]): Promise<Unit | null> { void args; return null; }
