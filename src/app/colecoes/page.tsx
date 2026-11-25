import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Arrow } from "@/components/brand";
import { SiteHeader, StorefrontShell } from "@/components/storefront";

export const metadata: Metadata = {
  title: "Coleções — STG Studio™",
  description: "Conheça a Collection #001 e explore as peças da STG Studio.",
};

export default function CollectionsPage() {
  return (
    <StorefrontShell page="collections">
      <SiteHeader active="collections" />
      <main id="collections-main" className="collections-main">
        <h1>COLEÇÕES</h1>
        <article className="collection-entry">
          <Link href="/shop" className="collection-entry-link" aria-labelledby="collection-001-title collection-001-action">
            <div className="collection-entry-banner">
              <Image
                src="/images/banner.webp"
                alt="Estrela STG sobre denim com textura gráfica em preto e branco"
                fill
                sizes="(max-width: 767px) calc(100vw - 48px), 89vw"
                preload
                className="object-cover"
              />
            </div>
            <div className="collection-entry-caption">
              <h2 id="collection-001-title">COLLECTION #001</h2>
              <span id="collection-001-action" className="collection-entry-action">VER PEÇAS <Arrow diagonal /></span>
            </div>
          </Link>
        </article>
      </main>
    </StorefrontShell>
  );
}
