import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopCatalog } from "@/components/shop-catalog";
import { SiteHeader, StorefrontShell } from "@/components/storefront";

export const metadata: Metadata = {
  title: "Shop — STG Studio™",
  description: "Explore as peças da STG Studio. Denim, upcycling e streetwear: saias, jaquetas, calças, acessórios e bolsas.",
};

export default function ShopPage() {
  return (
    <StorefrontShell page="shop">
      <SiteHeader active="shop" />
      <main id="shop-main" className="shop-main">
        <div className="shop-intro"><h1>SHOP</h1></div>
        <Suspense fallback={<div className="shop-loading" role="status">Carregando peças…</div>}>
          <ShopCatalog />
        </Suspense>
      </main>
    </StorefrontShell>
  );
}
