import type { Metadata } from "next";
import { MagazineCard } from "@/components/magazine-card";
import { SiteHeader, StorefrontShell } from "@/components/storefront";
import { getMagazinePosts } from "@/lib/data";

export const metadata: Metadata = {
  title: "Magazine — STG Studio™",
  description: "Dia a dia, produção e bastidores. Um olhar de perto para o universo STG Studio.",
  openGraph: { title: "Magazine — STG Studio™", description: "Dia a dia, produção e bastidores da STG Studio.", type: "website" },
};

export default async function MagazinePage() {
  const posts = await getMagazinePosts();
  return (
    <StorefrontShell page="magazine">
      <SiteHeader active="magazine" />
      <main id="magazine-main" className="magazine-main">
        <header className="magazine-intro">
          <h1>MAGAZINE</h1>
        </header>
        {posts.length ? <section className="magazine-grid" aria-label="Matérias da Magazine">
          {posts.map((post, index) => <MagazineCard key={post.slug} post={post} featured={index === 0} />)}
        </section> : <p className="magazine-empty">A primeira matéria está sendo escrita.</p>}
      </main>
    </StorefrontShell>
  );
}
