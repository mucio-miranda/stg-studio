"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { categories, categoryImages, collectionImages, home, shopHref } from "@/lib/catalog";
import { Logo, Arrow } from "./brand";
import { SiteHeader, useStorefront } from "./storefront-shell";

const ChromeLogo = dynamic(() => import("./chrome-logo"), { ssr: false });
function SideMarks() {
  return <div className="side-marks" aria-hidden="true">{[0, 1, 2].map((index) => <Image key={index} src="/brand/stg.svg" alt="" width={63} height={30} />)}</div>;
}

export function StudioHome() {
  const root = useRef<HTMLDivElement>(null);
  const collection = useRef<HTMLElement>(null);
  const categorySection = useRef<HTMLElement>(null);
  const categoryTimeline = useRef<gsap.core.Timeline | null>(null);
  const { openProduct, navigate } = useStorefront();
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [collectionIndex, setCollectionIndex] = useState(0);
  const [collectionHover, setCollectionHover] = useState<number | null>(null);
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    const scope = root.current;
    if (!scope) return;
    const context = gsap.context(() => {
      media.add({ motion: "(prefers-reduced-motion: no-preference)", reduced: "(prefers-reduced-motion: reduce)" }, ({ conditions }) => {
        if (!conditions?.motion) return;
        const entrance = gsap.timeline({ defaults: { ease: "power3.out" } });
        entrance.from(".site-header", { y: -15, opacity: 0, duration: 0.8 }, 0.15)
          .from(".hero-line > span", { yPercent: 115, rotate: 2, stagger: 0.12, duration: 1.05 }, 0.3)
          .from(".hero-reveal", { y: 12, opacity: 0, stagger: 0.12, duration: 0.8 }, 0.7);

        gsap.fromTo(".manifesto-word", { color: "#363131" }, {
          color: "#e2ddd5", stagger: 0.22, ease: "none",
          scrollTrigger: { trigger: ".manifesto", start: "top 65%", end: "bottom 65%", scrub: 0.65 },
        });
        gsap.fromTo(".manifesto-ghost", { rotate: -17, scale: 0.95 }, {
          rotate: -6, scale: 1.06, ease: "none",
          scrollTrigger: { trigger: ".manifesto", start: "top bottom", end: "bottom top", scrub: 1.1 },
        });

        const cards = gsap.utils.toArray<HTMLElement>(".collection-card");
        gsap.from(cards, {
          x: (index, target) => window.innerWidth - (target as HTMLElement).offsetLeft + 80,
          stagger: 0.16,
          ease: "power3.out",
          scrollTrigger: {
            trigger: collection.current, start: "top 92%", end: "top 16%",
            scrub: 0.85, invalidateOnRefresh: true,
            onUpdate: (self) => setCollectionIndex(Math.min(collectionImages.length - 1, Math.floor(self.progress * collectionImages.length))),
          },
        });

        gsap.from(".studio-object", {
          y: 100, opacity: 0, rotate: -16, scale: 0.7, duration: 1.6, ease: "power3.out",
          scrollTrigger: { trigger: ".studio", start: "top 75%", toggleActions: "play none none reverse" },
        });
        gsap.from(".studio-copy > *", {
          y: 26, opacity: 0, duration: 0.9, stagger: 0.12,
          scrollTrigger: { trigger: ".studio-copy", start: "top 85%", toggleActions: "play none none reverse" },
        });

        const frames = gsap.utils.toArray<HTMLElement>(".category-frame");
        const sequence = gsap.timeline({
          scrollTrigger: {
            trigger: categorySection.current, start: "top top", end: () => `+=${window.innerHeight * 3.3}`,
            pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true,
            onUpdate: (self) => setCategoryIndex(Math.min(4, Math.floor(self.progress * 5))),
          },
        });
        frames.forEach((frame, index) => {
          if (!index) return;
          sequence.fromTo(frame, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.8, ease: "power2.inOut" }, index - 0.15)
            .fromTo(frame.querySelector("img"), { scale: 1.15 }, { scale: 1, duration: 1, ease: "power2.out" }, index - 0.15);
        });
        sequence.to({}, { duration: 0.15 });
        categoryTimeline.current = sequence;
        const refresh = () => ScrollTrigger.refresh();
        document.fonts.ready.then(refresh);
        window.addEventListener("load", refresh);
        return () => { categoryTimeline.current = null; window.removeEventListener("load", refresh); };
      });
    }, scope);
    return () => { media.revert(); context.revert(); };
  }, []);

  const chooseCategory = (index: number) => {
    setCategoryIndex(index);
    const scroll = categoryTimeline.current?.scrollTrigger;
    if (scroll) window.scrollTo({ top: scroll.start + (scroll.end - scroll.start) * ((index + 0.8) / categories.length), behavior: "smooth" });
    else {
      root.current?.querySelectorAll<HTMLElement>(".category-frame").forEach((frame, frameIndex) => {
        frame.style.clipPath = frameIndex <= index ? "inset(0% 0% 0% 0%)" : "inset(100% 0% 0% 0%)";
      });
    }
  };
  const collectionLayout = (index: number) => {
    if (collectionHover === null) return { left: `${index * 25}%`, width: "27.2%", zIndex: index + 1 };
    const activeSpace = 36;
    const restingSpace = (100 - activeSpace) / (collectionImages.length - 1);
    const spaces = collectionImages.map((_, itemIndex) => itemIndex === collectionHover ? activeSpace : restingSpace);
    const left = spaces.slice(0, index).reduce((total, value) => total + value, 0);
    return { left: `${left}%`, width: `${spaces[index] + 2.2}%`, zIndex: index === collectionHover ? 10 : index + 1 };
  };
  return (
    <div ref={root}>
      <main id="inicio">
        <section className="hero" aria-label="STG Studio — Collection 001">
          <div className="hero-image"><Image src={home.hero.image} alt={home.hero.alt} fill preload sizes="100vw" className="object-cover" /></div>
          <SiteHeader active="home" />
          <div className="hero-content">
            <h1>{home.hero.lines.map((line) => <span className="hero-line" key={line}><span>{line}</span></span>)}</h1>
            <button className="bracket-link hero-reveal" onClick={() => navigate("colecoes")}>[ <span>VEJA AGORA</span> ]</button>
          </div>
          <div className="hero-bottom hero-reveal"><span>JOÃO PESSOA, PB<br />07°06′ S &nbsp; 34°51′ W</span><button className="scroll-cue" onClick={() => navigate("manifesto")} aria-label="Rolar para o manifesto"><svg viewBox="0 0 18 48" fill="none" aria-hidden="true"><path d="M9 0v45M2.5 37.5 9 45l6.5-7.5" stroke="currentColor" strokeWidth="1.15" /></svg></button><span className="hero-edition">UPCYCLING & STREETWEAR<br />EST. NORDESTE</span></div>
        </section>

        <section id="manifesto" className="manifesto" aria-labelledby="manifesto-title">
          <div className="manifesto-ghost" aria-hidden="true"><Logo outline /></div>
          <SideMarks />
          <div className="manifesto-content">
            <Logo />
            <h2 id="manifesto-title" aria-label={home.manifesto.join(" ")}>{home.manifesto.map((line) => <span className="manifesto-line" key={line} aria-hidden="true">{line.split(" ").map((word, index) => <span className="manifesto-word" key={`${word}-${index}`}>{word} </span>)}</span>)}</h2>
            <p>STG STUDIO™</p>
          </div>
          <SideMarks />
        </section>

        <section ref={collection} id="colecoes" className="collection" aria-labelledby="collection-title">
          <div className={`collection-deck ${collectionHover !== null ? "has-highlight" : ""}`} onMouseLeave={() => setCollectionHover(null)}>
            {collectionImages.map((item, index) => <div key={index} className={`collection-card ${collectionHover === index ? "is-highlighted" : collectionHover !== null ? "is-muted" : ""}`} style={collectionLayout(index)} tabIndex={0} aria-label={`${item.alt}. Passe o mouse ou use o foco para destacar.`} onMouseEnter={() => { setCollectionHover(index); setCollectionIndex(index); }} onFocus={() => { setCollectionHover(index); setCollectionIndex(index); }} onBlur={() => setCollectionHover(null)}>
              <Image src={item.image} alt={item.alt} fill sizes="(min-width: 768px) 40vw, 30vw" className="object-cover" />
              <div className="collection-shade" />
            </div>)}
          </div>
          <div className="collection-heading"><h2 id="collection-title">{home.collection.title}</h2><Link href="/shop" className="text-link">VER TUDO <Arrow /></Link></div>
          <div className="collection-bottom">
            <div className="collection-counter"><span>{String(collectionIndex + 1).padStart(2, "0")}</span><div className="collection-progress">{collectionImages.map((_, index) => <span className={index <= collectionIndex ? "filled" : ""} key={index} />)}</div><span>{String(collectionImages.length).padStart(2, "0")}</span></div>
            <button className="collection-caption" onClick={() => openProduct(collectionImages[collectionHover ?? collectionIndex].product)}><span key={collectionHover ?? collectionIndex}>{collectionImages[collectionHover ?? collectionIndex].caption}</span><Arrow diagonal /></button>
          </div>
        </section>

        <section id="stg" className="studio" aria-labelledby="studio-title">
          <div className="studio-object"><div className="chrome-glow" /><ChromeLogo /></div>
          <div className="studio-copy">
            <Logo />
            <h2 id="studio-title">{home.studio.quote.map((line, index) => <Fragment key={index}>{index > 0 && <><br className="desktop-break" /> </>}{line}</Fragment>)}</h2>
            <p className="studio-signature">{home.studio.signature}</p>
          </div>
        </section>

        <section id="categorias" ref={categorySection} className="categories" aria-labelledby="categories-title">
          <h2 id="categories-title" className="sr-only">Explore as categorias</h2>
          <span className="corner top-left" aria-hidden="true">stg</span><span className="corner top-right" aria-hidden="true">stg</span><span className="corner bottom-left" aria-hidden="true">stg</span><span className="corner bottom-right" aria-hidden="true">stg</span>
          <div className="category-content">
            <div className="category-list">{categories.map((category, index) => <button key={category} className={`category-name ${categoryIndex === index ? "is-active" : ""}`} onClick={() => chooseCategory(index)} aria-pressed={categoryIndex === index}><span className="category-number">0{index + 1}</span>{category.toUpperCase()}<span className="category-indicator" aria-hidden="true"><Arrow diagonal /></span></button>)}</div>
            <div className="category-visual">
              {categories.map((category, index) => <div className="category-frame" key={category} style={{ zIndex: index + 1, clipPath: index === 0 ? "inset(0% 0% 0% 0%)" : "inset(100% 0% 0% 0%)" }} aria-hidden={categoryIndex !== index}><Image src={categoryImages[category]} alt={`${category} — editorial STG Studio`} fill sizes="(min-width: 768px) 48vw, 75vw" className="object-cover" /><div className="category-photo-shade" /></div>)}
              <Link href={shopHref(categories[categoryIndex])} className="category-explore"><span>EXPLORAR {categories[categoryIndex].toUpperCase()}</span><Arrow diagonal /></Link>
            </div>
          </div>
          <span className="category-bottom-label">[ {String(categoryIndex + 1).padStart(2, "0")} / 05 ]</span>
        </section>

        <section className="static-banner" aria-label="Textura de denim com a estrela STG"><Image src={home.banner.image} alt={home.banner.alt} fill sizes="100vw" className="object-cover" /></section>
      </main>

    </div>
  );
}
