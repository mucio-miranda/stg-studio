import Image from "next/image";
import Link from "next/link";
import { Arrow } from "./brand";
import { formatMagazineDate, type MagazinePost } from "@/lib/magazine";

export function MagazineCard({ post, featured = false }: { post: MagazinePost; featured?: boolean }) {
  return (
    <article className={`magazine-card ${featured ? "magazine-card-featured" : ""}`}>
      <Link href={`/magazine/${post.slug}`} className="magazine-card-link" aria-labelledby={`title-${post.slug}`}>
        <div className="magazine-card-image">
          <Image src={post.cover.src} alt={post.cover.alt} fill sizes={featured ? "(max-width: 767px) calc(100vw - 48px), 52vw" : "(max-width: 767px) calc(100vw - 48px), 44vw"} preload={featured} className="object-cover" style={{ objectPosition: post.cover.position }} />
        </div>
        <div className="magazine-card-copy">
          <div className="magazine-meta"><span>{post.category}</span>{post.publishedAt && <time dateTime={post.publishedAt}>{formatMagazineDate(post.publishedAt)}</time>}</div>
          <h2 id={`title-${post.slug}`}>{post.title}</h2>
          {featured && <p className="magazine-card-excerpt">{post.excerpt}</p>}
          <span className="magazine-read-link">LER MATÉRIA <Arrow diagonal /></span>
        </div>
      </Link>
    </article>
  );
}
