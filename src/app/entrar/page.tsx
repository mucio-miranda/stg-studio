import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
import { SiteHeader, StorefrontShell } from "@/components/storefront";
import { safeNext } from "@/lib/navigation";

export const metadata: Metadata = { title: "Entrar — STG Studio™", robots: { index: false, follow: true } };
export default async function SignInPage({ searchParams }: { searchParams: Promise<{ next?: string; erro?: string }> }) {
  const params = await searchParams;
  const next = safeNext(params.next ?? null);
  const error = params.erro === "confirmacao" ? "Não foi possível confirmar o e-mail. Tente entrar ou crie a conta de novo." : undefined;
  return <StorefrontShell page="account"><SiteHeader active="account" /><main id="account-main" className="account-main auth-main"><AuthForm next={next} error={error} /></main></StorefrontShell>;
}
