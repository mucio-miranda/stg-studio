import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PiecePassport } from "@/components/piece-passport";
import { SiteHeader, StorefrontShell } from "@/components/storefront";
import { getSessionUser, getUnit } from "@/lib/data";
import { normalizeCode } from "@/lib/digital-passport";

type Props = { params: Promise<{ code: string }> };
async function load(params: Props["params"]) {
  const code = normalizeCode(decodeURIComponent((await params).code));
  const unit = code && await getUnit(code);
  if (!unit) notFound();
  return unit;
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const unit = await load(params);
  return { title: `${unit.product.name} — Passaporte STG™`, description: "Passaporte digital da peça. Não é certificado de autenticidade.", robots: { index: false, follow: true } };
}
export default async function PassportPage({ params }: Props) {
  const [unit, user] = await Promise.all([load(params), getSessionUser()]);
  return <StorefrontShell page="account"><SiteHeader active="account" /><main id="account-main" className="account-main"><PiecePassport unit={unit} viewer={user ? (unit.ownerId === user.id ? "owner" : "user") : "guest"} /></main></StorefrontShell>;
}
