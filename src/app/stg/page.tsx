import type { Metadata } from "next";
import Image from "next/image";
import { SiteHeader, StorefrontShell } from "@/components/storefront";
import { getBrandProfile } from "@/lib/data";

export const metadata: Metadata = {
  title: "Sobre a STG — STG Studio™",
  description: "Conheça a STG Studio e a equipe por trás da marca de upcycling e streetwear de João Pessoa.",
  openGraph: { title: "Sobre a STG — STG Studio™", description: "A marca, sua trajetória e quem faz a STG Studio.", type: "website" },
};

export default async function AboutPage() {
  const brand = await getBrandProfile();
  const timeline = brand.timeline.filter((milestone) => milestone.title || milestone.description);
  return (
    <StorefrontShell page="stg">
      <SiteHeader active="stg" />
      <main id="stg-main" className="about-main">
        <header className="about-intro"><h1>SOBRE A STG</h1></header>

        {brand.banner && <div className="about-banner">
          <Image src={brand.banner.src} alt={brand.banner.alt} fill sizes="(max-width: 767px) calc(100vw - 48px), 89vw" preload className="object-cover" style={{ objectPosition: brand.banner.position }} />
        </div>}

        {brand.introduction?.length ? <section className="about-story" aria-labelledby="about-story-title">
          <h2 id="about-story-title">Sobre a marca.</h2>
          <div className="about-story-copy">{brand.introduction.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
        </section> : null}

        {timeline.length ? <section className="about-journey" aria-labelledby="about-journey-title">
          <div className="about-section-heading"><h2 id="about-journey-title">Nossa trajetória.</h2></div>
          <ol className="about-timeline">
            {timeline.map((milestone) => <li key={milestone.id}>
              <span className="about-milestone-number" aria-hidden="true">{milestone.id}</span>
              {milestone.date && <p className="about-milestone-date">{milestone.date}</p>}
              <h3>{milestone.title ?? ""}</h3>
              {milestone.description && <p className="about-milestone-description">{milestone.description}</p>}
            </li>)}
          </ol>
        </section> : null}

        {brand.team.length ? <section className="about-team" aria-labelledby="about-team-title">
          <div className="about-section-heading"><h2 id="about-team-title">Quem faz a STG.</h2></div>
          <div className="about-team-grid">
            {brand.team.map((member) => <article className="about-team-member" key={member.name}>
              <div className="about-team-photo">
                {member.photo ? (
                  <Image src={member.photo.src} alt={member.photo.alt} fill sizes="(max-width: 767px) calc(100vw - 48px), 28vw" className="object-cover" style={{ objectPosition: member.photo.position }} />
                ) : (
                  <div className="about-portrait-placeholder" role="img" aria-label={member.name}><span className="about-member-initials" aria-hidden="true">{member.initials}</span></div>
                )}
              </div>
              <div className="about-team-caption"><h3>{member.name}</h3><p>{member.role}</p></div>
            </article>)}
          </div>
        </section> : null}
      </main>
    </StorefrontShell>
  );
}
