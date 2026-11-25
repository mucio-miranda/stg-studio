import type { ReactNode } from "react";
import { getContact, getProducts } from "@/lib/data";
import { StorefrontShellClient, type StorefrontPage } from "./storefront-shell";

export { SiteHeader } from "./storefront-shell";

// Server wrapper: loads the catalog once per request and hands it to the client shell (context for panels, cart and pages).
export async function StorefrontShell({ children, page }: { children: ReactNode; page: StorefrontPage }) {
  const [products, contact] = await Promise.all([getProducts(), getContact()]);
  return <StorefrontShellClient page={page} products={products} contact={contact}>{children}</StorefrontShellClient>;
}
