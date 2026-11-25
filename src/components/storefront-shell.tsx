"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatPrice, shopHref, type Category, type Product } from "@/lib/catalog";
import type { Contact } from "@/lib/data";
import { useSelection } from "@/lib/use-selection";
import { Logo, Arrow } from "./brand";
import { SliceGlitch } from "./slice-glitch";

type Panel = "shop" | "product" | "cart" | "menu" | null;
export type StorefrontPage = "home" | "shop" | "collections" | "magazine" | "stg" | "account";
const pageLinks: Record<StorefrontPage, string> = { home: "/", shop: "/shop", collections: "/colecoes", magazine: "/magazine", stg: "/stg", account: "/voce" };
type StorefrontActions = {
  products: Product[];
  openPanel: (next: Panel, category?: Category | "Tudo") => void;
  openProduct: (id: string) => void;
  navigate: (id: string) => void;
};
const StorefrontContext = createContext<StorefrontActions | null>(null);

export function useStorefront() {
  const context = useContext(StorefrontContext);
  if (!context) throw new Error("Use storefront actions within StorefrontShell");
  return context;
}

export function SiteHeader({ active }: { active: StorefrontPage }) {
  const { cart } = useSelection();
  const { openPanel } = useStorefront();
  return (
    <header className="site-header">
      <Link href="/" className="header-brand" aria-label="STG Studio — início"><Logo /></Link>
      <nav className="desktop-nav" aria-label="Navegação principal">
        <Link href="/" className={`nav-link ${active === "home" ? "active" : ""}`} aria-current={active === "home" ? "page" : undefined}>início</Link>
        <Link href="/shop" className={`nav-link ${active === "shop" ? "active" : ""}`} aria-current={active === "shop" ? "page" : undefined}>shop</Link>
        <Link href="/colecoes" className={`nav-link ${active === "collections" ? "active" : ""}`} aria-current={active === "collections" ? "page" : undefined}>coleções</Link>
        <Link href="/stg" className={`nav-link ${active === "stg" ? "active" : ""}`} aria-current={active === "stg" ? "page" : undefined}>stg</Link>
        <Link href="/magazine" className={`nav-link ${active === "magazine" ? "active" : ""}`} aria-current={active === "magazine" ? "page" : undefined}>magazine</Link>
      </nav>
      <div className="header-actions">
        <button className="nav-link cart-link" onClick={() => openPanel("cart")}>carrinho<span className="cart-count">[{String(cart.length).padStart(2, "0")}]</span></button>
        <Link href="/voce" className={`nav-link you-link ${active === "account" ? "active" : ""}`} aria-current={active === "account" ? "page" : undefined}>você</Link>
        <button className="menu-toggle" aria-label="Abrir menu" onClick={() => openPanel("menu")}><span /><span /></button>
      </div>
    </header>
  );
}

export function StorefrontShellClient({ children, page, products, contact }: { children: ReactNode; page: StorefrontPage; products: Product[]; contact: Contact }) {
  const channels = ([["Instagram", "instagram"], ["TikTok", "tiktok"], ["WhatsApp", "whatsapp"]] as const).filter(([, key]) => contact[key]);
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const [panel, setPanel] = useState<Panel>(null);
  const [selected, setSelected] = useState<Product | null>(null);
  const [size, setSize] = useState("A definir");
  const [status, setStatus] = useState("");
  const { cart, favorites, setCart, setFavorites } = useSelection();

  useEffect(() => {
    const modal = dialog.current;
    if (!modal || !panel) return;
    if (!modal.open) modal.showModal();
    const previousOverflow = document.documentElement.style.overflow;
    const previousPadding = document.documentElement.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.paddingRight = `${scrollbarWidth}px`;
    return () => {
      modal.close();
      document.documentElement.style.overflow = previousOverflow;
      document.documentElement.style.paddingRight = previousPadding;
      if (trigger.current?.isConnected) trigger.current.focus({ preventScroll: true });
    };
  }, [panel]);

  const closePanel = () => { setPanel(null); setSelected(null); setStatus(""); };
  const openPanel = (next: Panel, category: Category | "Tudo" = "Tudo") => {
    if (next === "shop") {
      closePanel();
      router.push(shopHref(category));
      return;
    }
    if (!panel) trigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setSelected(null); setStatus(""); setPanel(next);
  };
  const openProduct = (id: string) => {
    const product = products.find((item) => item.id === id);
    if (!product) return;
    if (!panel) trigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setPanel("product"); setSelected(product); setSize("A definir"); setStatus("");
  };
  const navigate = (id: string) => {
    closePanel();
    if (page !== "home") { router.push(`/#${id}`); return; }
    requestAnimationFrame(() => {
      const destination = document.getElementById(id);
      if (!destination) return;
      window.scrollTo({ top: window.scrollY + destination.getBoundingClientRect().top, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
    });
  };
  const toggleFavorite = (id: string) => setFavorites((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
  const addToCart = (product: Product) => {
    if (!cart.some((item) => item.id === product.id && item.size === size)) setCart((items) => [...items, { id: product.id, size }]);
    setStatus("Peça adicionada à sua seleção.");
  };
  const checkoutHref = () => {
    const items = cart.flatMap((item) => { const product = products.find((entry) => entry.id === item.id); return product ? [{ ...item, product }] : []; });
    const priced = items.filter((item) => item.product.price !== null);
    const total = priced.reduce((sum, item) => sum + (item.product.price ?? 0), 0);
    const lines = items.map((item, index) => `${index + 1}. ${item.product.name} (${item.product.category})\n   Tamanho: ${item.size}\n   Valor: ${formatPrice(item.product.price)}`);
    const summary = !priced.length ? [] : priced.length === items.length ? [`Total: ${formatPrice(total)}`] : [`Subtotal das peças com preço: ${formatPrice(total)} (as demais sob consulta)`];
    const message = ["Olá, STG Studio! Quero concluir esta compra:", "", ...lines, "", ...summary, ...(summary.length ? [""] : []), "Pode me confirmar disponibilidade, prazo e frete?"].join("\n");
    return `https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent(message)}`;
  };

  return (
    <StorefrontContext.Provider value={{ products, openPanel, openProduct, navigate }}>
      <div className={`stg-site ${page === "home" ? "" : `catalog-page ${page}-page`}`}>
        <a href={page === "home" ? "#manifesto" : `#${page}-main`} className="skip-link">Pular para o conteúdo</a>
        {children}
      {page === "home" ? <footer className="site-footer">
        <div className="footer-main"><div className="footer-statement"><Link href="/" aria-label="STG Studio — voltar ao início"><Logo /></Link><p>UM NOVO OLHAR<br />SOBRE O QUE<br />JÁ EXISTE.</p><span>STG STUDIO™</span></div>
          {channels.length > 0 && <div className="footer-right"><div className="social-links">{channels.map(([name, key]) => <a key={key} href={contact[key]} target="_blank" rel="noopener noreferrer" aria-label={`${name} da STG Studio`}><Image src={`/brand/${key}.svg`} alt="" width={40} height={40} /></a>)}</div></div>}
        </div>
        <div className="footer-bottom"><div><p>© 2026 STG Studio — Todos os direitos reservados.</p></div></div>
      </footer> : <footer className="site-footer site-footer-compact">
        <Link className="footer-signature" href="/">© 2026 STG Studio</Link>
        {channels.length > 0 && <div className="social-links">{channels.map(([name, key]) => <a key={key} href={contact[key]} target="_blank" rel="noopener noreferrer" aria-label={`${name} da STG Studio`}><Image src={`/brand/${key}.svg`} alt="" width={24} height={24} /></a>)}</div>}
      </footer>}

      <dialog ref={dialog} className={`studio-dialog ${panel === "menu" ? "menu-dialog" : ""}`} aria-labelledby="dialog-title" onCancel={closePanel} onClick={(event) => { if (event.target === event.currentTarget) closePanel(); }}>
        <div className="dialog-surface">
          <div className="dialog-header"><Logo /><button className="close-button" aria-label="Fechar painel" onClick={closePanel}><span /><span /></button></div>
          <div className="dialog-body">
            {panel === "menu" && <><h2 id="dialog-title" className="sr-only">Menu</h2><nav className="mobile-nav" aria-label="Navegação mobile">{[{ title: "início", href: "/" }, { title: "shop", href: "/shop" }, { title: "coleções", href: "/colecoes" }, { title: "stg", href: "/stg" }, { title: "magazine", href: "/magazine" }, { title: "você", href: "/voce" }].map((item, index) => <Link key={item.title} href={item.href} aria-current={item.href === pageLinks[page] ? "page" : undefined} onClick={closePanel}><span>0{index + 1}</span>{item.title}<Arrow diagonal /></Link>)}</nav></>}

            {panel === "product" && selected && <>
              <button className="text-link mb-8" onClick={() => { if (page === "shop") closePanel(); else openPanel("shop"); }}>← VOLTAR À COLEÇÃO</button>
              <div className="product-detail"><div className="detail-image"><SliceGlitch src={selected.image} position={selected.position} trigger={selected.id}><Image src={selected.image} alt={selected.name} fill sizes="(min-width: 768px) 35vw, 85vw" className="object-cover" style={{ objectPosition: selected.position }} /></SliceGlitch></div><div className="detail-copy"><p className="overline">COLLECTION #001 · {selected.category.toUpperCase()}</p><h2 id="dialog-title" className="dialog-title">{selected.name}</h2><p>{selected.description}</p><p className="detail-availability">{formatPrice(selected.price)} · disponibilidade sob consulta</p><label className="size-label" htmlFor="preferred-size">Seu tamanho de preferência</label><select id="preferred-size" value={size} onChange={(event) => setSize(event.target.value)}>{["A definir", "PP", "P", "M", "G", "GG", "Único"].map((value) => <option key={value}>{value}</option>)}</select><button className="solid-button" onClick={() => addToCart(selected)}>ADICIONAR À SELEÇÃO <Arrow diagonal /></button><button className="outline-button" onClick={() => toggleFavorite(selected.id)}>{favorites.includes(selected.id) ? "♥ SALVO NOS FAVORITOS" : "♡ SALVAR NOS FAVORITOS"}</button><p className="detail-note">A seleção fica salva neste navegador e não reserva estoque. As imagens apresentam a direção criativa da coleção.</p></div></div>
            </>}

            {panel === "cart" && <>
              <h2 id="dialog-title" className="dialog-title">Sua seleção <sup>({cart.length})</sup></h2>
              {cart.length === 0 ? <div className="empty-state"><p>Sua seleção está vazia.</p><button className="solid-button" onClick={() => openPanel("shop")}>EXPLORAR A COLEÇÃO <Arrow /></button></div> : <><div className="saved-list">{cart.map((item) => { const product = products.find((entry) => entry.id === item.id); if (!product) return null; return <article key={`${item.id}-${item.size}`} className="saved-item"><button className="saved-image" onClick={() => openProduct(product.id)} aria-label={`Ver ${product.name}`}><Image src={product.image} alt={product.name} fill sizes="110px" className="object-cover" /></button><div><span className="overline">{product.category}</span><h3>{product.name}</h3><p>Tamanho de preferência: {item.size}</p><p>{formatPrice(product.price)}</p></div><button className="remove-button" aria-label={`Remover ${product.name}`} onClick={() => { setCart((items) => items.filter((entry) => entry.id !== item.id || entry.size !== item.size)); setStatus(""); }}>REMOVER</button></article>; })}</div><a className="solid-button checkout-button" href={checkoutHref()} target="_blank" rel="noopener noreferrer">CONCLUIR COMPRA <Arrow diagonal /></a><p className="detail-note">Você vai para o WhatsApp da STG com o pedido pronto para enviar.</p></>}
            </>}

            <p className="status-message" role="status" aria-live="polite">{status}</p>
          </div>
        </div>
      </dialog>
      </div>
    </StorefrontContext.Provider>
  );
}
