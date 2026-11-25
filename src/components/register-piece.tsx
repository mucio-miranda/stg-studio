"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Arrow } from "./brand";
import { parsePassportInput } from "@/lib/digital-passport";

export function RegisterPiece() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = parsePassportInput(value, window.location.origin);
    if (!code) { setError("Código inválido. Cole o código STG da tag ou o link da peça."); return; }
    router.push("/pecas/" + code);
  }
  return <>
    <Link href="/voce" className="account-back">← VOLTAR AO VESTUÁRIO</Link>
    <div className="register-layout"><div><h1>Registrar peça.</h1><p>Cole o código ou o link da sua tag.</p></div>
      <form className="account-register-form" onSubmit={submit}><label htmlFor="piece-code">Código ou link da tag<input id="piece-code" value={value} maxLength={400} autoComplete="off" spellCheck={false} placeholder="STG-…" onChange={(event) => { setValue(event.target.value); setError(""); }} aria-describedby={error ? "piece-code-error" : undefined} aria-invalid={Boolean(error)} required /></label><p id="piece-code-error" className="account-feedback" role="alert">{error}</p><button className="account-action account-action-filled" type="submit">ABRIR PASSAPORTE <Arrow diagonal /></button><details className="account-register-note"><summary>Sobre o registro</summary><p>O registro vincula a unidade à sua conta. Ele não substitui a nota fiscal nem certifica autenticidade.</p></details></form>
    </div>
  </>;
}
