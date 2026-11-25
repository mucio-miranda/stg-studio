import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Arrow } from "@/components/brand";
import { SiteHeader, StorefrontShell } from "@/components/storefront";
import { getMagazinePost, getMagazinePosts } from "@/lib/data";
import { formatMagazineDate, readingMinutes } from "@/lib/magazine";

type ArticleProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: ArticleProps): Promise<Metadata> {
  const post = await getMagazinePost((await params).slug);
  if (!post) notFound();
  return {
    title: `${post.title} — Magazine STG Studio™`,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt, type: "article", ...(post.publishedAt ? { publishedTime: post.publishedAt } : {}) },
  };
}

export default async function MagazineArticlePage({ params }: ArticleProps) {
  const post = await getMagazinePost((await params).slug);
  if (!post) notFound();
  const posts = await getMagazinePosts();
  const nextPost = posts.length > 1 ? posts[(posts.findIndex((item) => item.slug === post.slug) + 1) % posts.length] : undefined;

  return (
    <StorefrontShell page="magazine">
      <SiteHeader active="magazine" />
      <main id="magazine-main" className="magazine-article-main">
        <Link href="/magazine" className="magazine-back"><Arrow /> VOLTAR À MAGAZINE</Link>
        <article className="magazine-article" aria-labelledby="article-title">
          <header className="magazine-article-header">
            <div className="magazine-meta"><span>{post.category}</span><span>{readingMinutes(post)} min de leitura</span>{post.publishedAt && <time dateTime={post.publishedAt}>{formatMagazineDate(post.publishedAt)}</time>}</div>
            <h1 id="article-title">{post.title}</h1>
            <p className="magazine-article-excerpt">{post.excerpt}</p>
          </header>
          <div className="magazine-article-cover">
            <Image src={post.cover.src} alt={post.cover.alt} fill sizes="(max-width: 767px) calc(100vw - 48px), (max-width: 1200px) 89vw, 1060px" preload className="object-cover" style={{ objectPosition: post.cover.position }} />
          </div>
          <div className="magazine-article-body">
            {post.body.map((block, index) => {
              if (block.type === "heading") return <h2 key={index}>{block.text}</h2>;
              if (block.type === "quote") return <blockquote key={index}><p>{block.text}</p></blockquote>;
              return <p key={index}>{block.text}</p>;
            })}
          </div>
        </article>
        {nextPost && <nav className="magazine-next" aria-label="Continuar lendo">
          <Link href={`/magazine/${nextPost.slug}`}><div><span>PRÓXIMA MATÉRIA</span><h2>{nextPost.title}</h2></div><Arrow diagonal /></Link>
        </nav>}
      </main>
    </StorefrontShell>
  );
}
