"use client";
import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Arrow } from "./brand";
import { GarmentViewer } from "./garment-viewer";
import { shortSerial, type Unit } from "@/lib/digital-passport";
import { claimUnit, type ClaimResult } from "@/lib/actions";

const feedback: Record<ClaimResult, string> = {
  added: "Peça registrada no seu vestuário.",
  existing: "Esta peça já está no seu vestuário.",
  taken: "Esta unidade já foi registrada por outra conta.",
  invalid: "Código inválido.",
  unauthenticated: "Entre na sua conta para registrar.",
  error: "Não foi possível registrar agora. Tente de novo.",
};

export function PiecePassport({ unit, viewer }: { unit: Unit; viewer: "guest" | "user" | "owner" }) {
  const { product, code } = unit;
  const [view, setView] = useState<"photo" | "3d">("photo");
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();
  const owned = viewer === "owner";
  const taken = !owned && unit.ownerId !== null;
  const claim = () => start(async () => setMessage(feedback[await claimUnit(code)]));
  return <>
    <Link className="account-back" href="/voce">← VOLTAR AO VESTUÁRIO</Link>
    <p className="account-demo-note passport-disclaimer">PASSAPORTE DIGITAL · NÃO É CERTIFICADO DE AUTENTICIDADE</p>
    <div className="passport-layout">
      <div className="passport-visual"><div className="passport-media">{view === "photo" ? <Image src={product.image} alt={product.name} fill preload sizes="(max-width: 767px) 88vw, 48vw" className="object-cover" /> : <GarmentViewer model={product.model} image={product.image} name={product.name} />}</div><div className="passport-view-switch" role="group" aria-label="Visualização da peça"><button aria-pressed={view === "photo"} onClick={() => setView("photo")}>FOTO</button><button aria-pressed={view === "3d"} onClick={() => setView("3d")}>ESTUDO 3D</button></div></div>
      <div className="passport-copy"><span className="account-edition">COLLECTION #001 · {product.category.toUpperCase()}</span><h1>{product.name}</h1><p>{product.description}</p><dl className="passport-facts"><div><dt>Identificação</dt><dd>{shortSerial(code)}</dd></div><div><dt>Registro</dt><dd>{owned ? "No seu vestuário" : taken ? "Registrada por outra conta" : "Disponível para registro"}</dd></div><div><dt>Modelo digital</dt><dd>Estudo conceitual, não réplica da peça</dd></div></dl><div className="passport-register">{owned ? <><p className="passport-registered">No seu vestuário digital.</p><Link className="account-action" href="/voce">VER MEU VESTUÁRIO <Arrow diagonal /></Link></> : taken ? <p className="passport-registered">Esta unidade pertence a outra conta.</p> : viewer === "guest" ? <Link className="account-action account-action-filled" href={`/entrar?next=/pecas/${code}`}>ENTRAR PARA REGISTRAR <Arrow diagonal /></Link> : <button className="account-action account-action-filled" onClick={claim} disabled={pending}>ADICIONAR AO VESTUÁRIO <Arrow diagonal /></button>}<p className="account-muted">A primeira conta a registrar fica com a unidade. Autenticidade da tag ainda não é verificada.</p><p className="account-feedback" role="status">{message}</p></div><details className="passport-code"><summary>Ver código completo</summary><code>{code}</code></details></div>
    </div>
  </>;
}
