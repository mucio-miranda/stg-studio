import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccountDashboard } from "@/components/account-dashboard";
import { SiteHeader, StorefrontShell } from "@/components/storefront";
import { getProfile, getSessionUser, getWardrobe } from "@/lib/data";

export const metadata: Metadata = {
  title: "Você — STG Studio™",
  description: "Seu vestuário digital, compras e perfil na STG Studio.",
  robots: { index: false, follow: true },
};
export default async function AccountPage() {
  const user = await getSessionUser();
  if (!user) redirect("/entrar?next=/voce");
  const [profile, pieces] = await Promise.all([getProfile(), getWardrobe(user.id)]);
  return <StorefrontShell page="account"><SiteHeader active="account" /><main id="account-main" className="account-main"><AccountDashboard email={user.email} profile={profile ?? { name: "", size: "", role: "customer" }} pieces={pieces} /></main></StorefrontShell>;
}
