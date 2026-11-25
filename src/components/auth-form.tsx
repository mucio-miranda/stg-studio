"use client";
import { useActionState, useState } from "react";
import { Arrow } from "./brand";
import { signIn, signUp, type AuthState } from "@/lib/actions";

type Mode = "in" | "up";
function Form({ mode, next, initial, toggle }: { mode: Mode; next: string; initial: AuthState; toggle: () => void }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(mode === "in" ? signIn : signUp, initial);
  return <form className="account-register-form" action={action}>
    <h1>{mode === "in" ? "Entrar." : "Criar conta."}</h1>
    <input type="hidden" name="next" value={next} />
    {mode === "up" && <label htmlFor="auth-name">Nome<input id="auth-name" name="name" maxLength={80} autoComplete="name" placeholder="Como podemos chamar você?" /></label>}
    <label htmlFor="auth-email">E-mail<input id="auth-email" name="email" type="email" maxLength={254} autoComplete="email" placeholder="voce@exemplo.com" required /></label>
    <label htmlFor="auth-password">Senha<input id="auth-password" name="password" type="password" minLength={8} autoComplete={mode === "in" ? "current-password" : "new-password"} placeholder={mode === "up" ? "Mínimo de 8 caracteres" : undefined} required /></label>
    <p className="account-feedback" role={state.error ? "alert" : "status"}>{state.error ?? state.notice ?? ""}</p>
    <button className="account-action account-action-filled" type="submit" disabled={pending}>{mode === "in" ? "ENTRAR" : "CRIAR CONTA"} <Arrow diagonal /></button>
    <button className="account-text-button" type="button" onClick={toggle}>{mode === "in" ? "Ainda não tem conta? Criar agora" : "Já tem conta? Entrar"} <Arrow /></button>
  </form>;
}

export function AuthForm({ next, error }: { next: string; error?: string }) {
  const [mode, setMode] = useState<Mode>("in");
  return <div className="auth-panel">
    <Form key={mode} mode={mode} next={next} initial={mode === "in" && error ? { error } : {}} toggle={() => setMode(mode === "in" ? "up" : "in")} />
  </div>;
}
