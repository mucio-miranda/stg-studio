"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { gsap } from "gsap";
import { categories, formatPrice, type Category } from "@/lib/catalog";
import { useSelection } from "@/lib/use-selection";
import { Arrow } from "./brand";
import { useStorefront } from "./storefront-shell";

type Control = "search" | "category" | "filters";
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
const orders = [
  { value: "", label: "Seleção STG" },
  { value: "name-asc", label: "Nome: A–Z" },
  { value: "name-desc", label: "Nome: Z–A" },
  { value: "price-asc", label: "Menor preço" },
  { value: "price-desc", label: "Maior preço" },
];

function ControlIcon({ type }: { type: Control }) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
    {type === "search" ? <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.5 15.5 5 5" /></> : type === "category" ? <path d="m6 9 6 6 6-6" /> : <><path d="M4 7h7m4 0h5M4 17h3m4 0h9" /><circle cx="13" cy="7" r="2" /><circle cx="9" cy="17" r="2" /></>}
  </svg>;
}

export function ShopCatalog() {
  const params = useSearchParams();
  const { favorites } = useSelection();
  const { products, openProduct } = useStorefront();
  const [control, setControl] = useState<Control | null>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const controls = useRef<HTMLDivElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const query = params.get("q") ?? "";
  const categoryParam = params.get("categoria");
  const category = categories.find((item) => normalize(item) === normalize(categoryParam ?? "")) ?? "Tudo";
  const order = orders.find((item) => item.value === params.get("ordem"))?.value ?? "";
  const onlyFavorites = params.get("favoritos") === "1";
  const hasPrices = products.some((product) => product.price !== null);
  const activeFilters = Number(onlyFavorites) + Number(order !== "");

  const visible = products.filter((product) =>
    (category === "Tudo" || product.category === category) &&
    (!onlyFavorites || favorites.includes(product.id)) &&
    normalize(`${product.name} ${product.category}`).includes(normalize(query.trim()))
  ).sort((a, b) => {
    if (order.startsWith("name")) return a.name.localeCompare(b.name, "pt-BR") * (order === "name-desc" ? -1 : 1);
    if (order.startsWith("price")) {
      if (a.price === null) return b.price === null ? 0 : 1;
      if (b.price === null) return -1;
      return (a.price - b.price) * (order === "price-desc" ? -1 : 1);
    }
    return 0;
  });
  const resultKey = visible.map((product) => product.id).join(",");
  const hasCriteria = Boolean(query || category !== "Tudo" || activeFilters);

  useEffect(() => {
    if (control === "search") searchInput.current?.focus();
  }, [control]);

  useEffect(() => {
    if (!resultKey) return;
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const context = gsap.context(() => {
        gsap.fromTo(".shop-product", { y: 18, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.055, duration: 0.65, ease: "power2.out", clearProps: "transform,opacity" });
      }, grid);
      return () => context.revert();
    });
    return () => media.revert();
  }, [resultKey]);

  function update(values: Record<string, string>, replace = false) {
    const next = new URLSearchParams(window.location.search);
    Object.entries(values).forEach(([key, value]) => value ? next.set(key, value) : next.delete(key));
    const url = `/shop${next.size ? `?${next.toString()}` : ""}`;
    if (replace) window.history.replaceState(null, "", url);
    else window.history.pushState(null, "", url);
  }
  function closeControl() {
    if (control) controls.current?.querySelector<HTMLButtonElement>(`[data-control="${control}"]`)?.focus();
    setControl(null);
  }
  function chooseCategory(next: Category | "Tudo") {
    update({ categoria: next === "Tudo" ? "" : next });
    closeControl();
  }
  function reset() {
    update({ q: "", categoria: "", ordem: "", favoritos: "" });
    closeControl();
  }

  return (
    <section className="shop-catalog" aria-label="Peças da STG Studio">
      <div className="shop-tools" ref={controls} onKeyDown={(event) => { if (event.key === "Escape" && control) { event.preventDefault(); closeControl(); } }}>
        <div className="shop-toolbar" aria-label="Buscar e filtrar peças">
          <button data-control="filters" aria-expanded={control === "filters"} aria-controls="shop-filters" onClick={() => setControl(control === "filters" ? null : "filters")}><ControlIcon type="filters" /><span>filtrar{activeFilters ? ` (${activeFilters})` : ""}</span></button>
          <button data-control="category" aria-expanded={control === "category"} aria-controls="shop-categories" onClick={() => setControl(control === "category" ? null : "category")}><span>{category === "Tudo" ? "categorias" : category.toLocaleLowerCase("pt-BR")}</span><ControlIcon type="category" /></button>
          <button data-control="search" aria-expanded={control === "search"} aria-controls="shop-search" onClick={() => setControl(control === "search" ? null : "search")}><span>pesquisar{query ? " (1)" : ""}</span><ControlIcon type="search" /></button>
        </div>
        <div id="shop-search" className="shop-control-panel" hidden={control !== "search"}>
          <form role="search" onSubmit={(event) => { event.preventDefault(); closeControl(); }}>
            <label className="sr-only" htmlFor="shop-query">Pesquisar peças</label>
            <input ref={searchInput} id="shop-query" type="search" autoComplete="off" placeholder="O que você procura?" value={query} onChange={(event) => update({ q: event.target.value }, true)} />
            {query && <button type="button" className="shop-clear" onClick={() => { update({ q: "" }, true); searchInput.current?.focus(); }}>limpar</button>}
            <button type="submit" className="shop-search-submit" aria-label="Concluir pesquisa">↵</button>
          </form>
        </div>
        <div id="shop-categories" className="shop-control-panel" hidden={control !== "category"}>
          <fieldset className="shop-category-options">
            <legend className="sr-only">Selecionar categoria</legend>
            {(["Tudo", ...categories] as const).map((item) => <label key={item}>
              <input type="radio" name="shop-category" value={item} checked={category === item} onChange={() => chooseCategory(item)} />
              <span>{item === "Tudo" ? "Todas as peças" : item}<small>{String(item === "Tudo" ? products.length : products.filter((product) => product.category === item).length).padStart(2, "0")}</small></span>
            </label>)}
          </fieldset>
        </div>
        <div id="shop-filters" className="shop-control-panel" hidden={control !== "filters"}>
          <div className="shop-filter-options">
            <fieldset className="shop-order">
              <legend>Ordenar por</legend>
              {orders.filter((item) => hasPrices || !item.value.startsWith("price")).map((item) => <label key={item.value}>
                <input type="radio" name="shop-order" value={item.value} checked={order === item.value} onChange={() => update({ ordem: item.value })} />
                <span>{item.label}</span>
              </label>)}
            </fieldset>
            <fieldset className="shop-saved-filter">
              <legend>Seu olhar</legend>
              <label><input type="checkbox" checked={onlyFavorites} onChange={(event) => update({ favoritos: event.target.checked ? "1" : "" })} /><span>Apenas favoritos</span><small>{favorites.length}</small></label>
            </fieldset>
            <button className="shop-clear" onClick={() => { update({ ordem: "", favoritos: "" }); }}>limpar filtros</button>
          </div>
        </div>
      </div>

      <div className="shop-results-bar">
        <p role="status" aria-live="polite" aria-atomic="true">{String(visible.length).padStart(2, "0")} {visible.length === 1 ? "peça" : "peças"}</p>
        {hasCriteria && <div className="shop-active-filters">
          {query && <button aria-label="Remover pesquisa" onClick={() => update({ q: "" })}>“{query}” <span aria-hidden="true">×</span></button>}
          {category !== "Tudo" && <button aria-label="Remover categoria" onClick={() => update({ categoria: "" })}>{category} <span aria-hidden="true">×</span></button>}
          {onlyFavorites && <button aria-label="Remover filtro de favoritos" onClick={() => update({ favoritos: "" })}>favoritos <span aria-hidden="true">×</span></button>}
          <button className="shop-clear" onClick={reset}>limpar tudo</button>
        </div>}
      </div>

      <div className="shop-grid" ref={grid}>
        {visible.map((product, index) => <article key={product.id} className="shop-product">
          <button className="shop-product-link" onClick={() => openProduct(product.id)} aria-label={`Ver ${product.name}`}>
            <div className="shop-product-image">
              <Image src={product.image} alt={product.name} fill sizes="(max-width: 767px) 46vw, 30vw" loading={index < 3 ? "eager" : "lazy"} className="object-cover" style={{ objectPosition: product.position }} />
              <span className="shop-product-arrow" aria-hidden="true"><Arrow diagonal /></span>
            </div>
            <div className="shop-product-meta"><h2>{product.name}</h2><p>{formatPrice(product.price)}</p></div>
          </button>
        </article>)}
      </div>
      {visible.length === 0 && <div className="shop-no-results"><p>Nenhuma peça por aqui.</p><span>Tente outra busca ou ajuste os filtros.</span><button className="bracket-link" onClick={reset}>[ <span>VER TODAS AS PEÇAS</span> ]</button></div>}
    </section>
  );
}
