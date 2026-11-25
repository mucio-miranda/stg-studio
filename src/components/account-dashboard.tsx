"use client";

import { useState, useTransition, type KeyboardEvent, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { Arrow } from "./brand";
import { shortSerial, type Unit } from "@/lib/digital-passport";
import { saveProfile, signOut } from "@/lib/actions";
import type { Profile } from "@/lib/data";

const tabs = [{ id: "wardrobe", label: "Vestuário digital" }, { id: "profile", label: "Perfil" }] as const;
type Tab = (typeof tabs)[number]["id"];
const sizes = ["", "PP", "P", "M", "G", "GG", "Único"] as const;

function ProfileForm({ profile, email }: { profile: Profile; email: string }) {
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    start(async () => { const { error } = await saveProfile(data); setMessage(error ?? "Perfil salvo."); });
  }
  return <form className="account-profile-form" onSubmit={submit}>
    <h2 className="sr-only">Seu perfil</h2>
    <div className="account-form-grid">
      <label>Nome de exibição<input name="name" autoComplete="name" maxLength={80} placeholder="Como podemos chamar você?" defaultValue={profile.name} /></label>
      <label>E-mail<input name="email" type="email" value={email} readOnly /></label>
      <label>Tamanho de preferência<select name="size" defaultValue={profile.size}>{sizes.map((size) => <option value={size} key={size}>{size || "Não informado"}</option>)}</select></label>
    </div>
    <button className="account-action account-action-filled" type="submit" disabled={pending}>SALVAR PERFIL <Arrow diagonal /></button>
    <p className="account-feedback" role="status">{message}</p>
    <div className="account-security"><button className="account-text-button" type="button" onClick={() => signOut()}>Sair da conta <Arrow /></button></div>
  </form>;
}

export function AccountDashboard({ profile, email, pieces }: { profile: Profile; email: string; pieces: Unit[] }) {
  const [tab, setTab] = useState<Tab>("wardrobe");
  function moveTab(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
    else if (event.key === "ArrowLeft") next = (index + tabs.length - 1) % tabs.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tabs.length - 1;
    else return;
    event.preventDefault();
    setTab(tabs[next].id);
    document.getElementById("account-tab-" + tabs[next].id)?.focus();
  }
  return <>
    <header className="account-intro"><h1>VOCÊ</h1></header>
    <div className="account-navigation"><div className="account-tabs" role="tablist" aria-label="Sua área STG">{tabs.map((item, index) => <button key={item.id} id={"account-tab-" + item.id} role="tab" type="button" aria-selected={tab === item.id} aria-controls={"account-panel-" + item.id} tabIndex={tab === item.id ? 0 : -1} onClick={() => setTab(item.id)} onKeyDown={(event) => moveTab(event, index)}>{item.label}{item.id === "wardrobe" && <span>{String(pieces.length).padStart(2, "0")}</span>}</button>)}</div>{tab === "wardrobe" && <Link href="/registrar" className="account-action">REGISTRAR PEÇA <Arrow diagonal /></Link>}</div>
    <section id="account-panel-wardrobe" role="tabpanel" aria-labelledby="account-tab-wardrobe" hidden={tab !== "wardrobe"} tabIndex={0}>
      <h2 className="sr-only">Suas peças</h2>
      {pieces.length ? <div className="wardrobe-grid">{pieces.map((unit) => <article className="wardrobe-piece" key={unit.code}><Link href={`/pecas/${unit.code}`} aria-label={`Abrir passaporte de ${unit.product.name}, ${shortSerial(unit.code)}`}><div className="wardrobe-piece-image"><Image src={unit.product.image} alt={unit.product.name} fill sizes="(max-width: 767px) 43vw, 28vw" className="object-cover" /></div><div className="wardrobe-piece-meta"><h3>{unit.product.name}</h3><Arrow diagonal /></div></Link></article>)}</div>
        : <div className="account-empty"><h3>Seu vestuário ainda está vazio.</h3><p>Registre sua primeira peça pelo código da tag.</p></div>}
    </section>
    <section id="account-panel-profile" role="tabpanel" aria-labelledby="account-tab-profile" hidden={tab !== "profile"} tabIndex={0}>{tab === "profile" && <ProfileForm profile={profile} email={email} />}</section>
  </>;
}
