// Camada de dados do frontend. Hoje serve conteúdo estático; o backend foi removido e será refeito.
// Ao reconectar um backend, mantenha estas assinaturas e troque só a origem dos dados.
import type { Product } from "./catalog";
import type { Unit } from "./digital-passport";
import type { MagazinePost } from "./magazine";

const products: Product[] = [
  { id: "denim-rework", name: "Denim rework", category: "Saias", image: "/images/collection-01.webp", position: "50% 50%", description: "Texturas, recortes e novas possibilidades para o denim. Uma leitura do universo da Collection #001.", price: null, serialPrefix: "DR", model: "skirt", sort: 1 },
  { id: "jacket-studs", name: "Jaqueta de atitude", category: "Jaquetas", image: "/images/collection-04.webp", position: "50% 50%", description: "O encontro entre o jeans e o metal. Detalhes que transformam a forma de vestir.", price: null, serialPrefix: "JA", model: "jacket", sort: 2 },
  { id: "denim-eye", name: "Denim, outro olhar", category: "Calças", image: "/images/collection-03.webp", position: "50% 50%", description: "Linhas conhecidas, novos sentidos. O olhar STG encontra o denim do dia a dia.", price: null, serialPrefix: "DO", model: "pants", sort: 3 },
  { id: "silver-eye", name: "Olhar de prata", category: "Acessórios", image: "/images/collection-02.webp", position: "50% 50%", description: "Um detalhe que diz tudo. A estrela e o olho da STG em uma composição de metal e textura.", price: null, serialPrefix: "OP", model: "pendant", sort: 4 },
  { id: "bag-reconstructed", name: "Bolsa reconstruída", category: "Bolsas", image: "/images/bag.webp", position: "50% 50%", description: "Fragmentos que encontram uma nova forma. Uma bolsa com a linguagem da reconstrução.", price: null, serialPrefix: "BR", model: "bag", sort: 5 },
];
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

export type Contact = { instagram: string; tiktok: string; whatsapp: string };
export async function getContact(): Promise<Contact> { return { instagram: "", tiktok: "", whatsapp: "" }; }

export async function getMagazinePosts(): Promise<MagazinePost[]> { return posts; }
export async function getMagazinePost(slug: string): Promise<MagazinePost | null> { return posts.find((post) => post.slug === slug) ?? null; }

// Conta e vestuário digital: sem backend ainda. Sem sessão, /voce leva a /entrar e /pecas/[code] responde 404.
export type SessionUser = { id: string; email: string };
export type Profile = { name: string; size: string; role: "customer" | "admin" };
export async function getSessionUser(): Promise<SessionUser | null> { return null; }
export async function getProfile(): Promise<Profile | null> { return null; }
export async function getWardrobe(...args: [string]): Promise<Unit[]> { void args; return []; }
export async function getUnit(...args: [string]): Promise<Unit | null> { void args; return null; }
