import type { Metadata } from "next";
import { RegisterPiece } from "@/components/register-piece";
import { SiteHeader, StorefrontShell } from "@/components/storefront";

export const metadata: Metadata = { title: "Registrar peça — STG Studio™", robots: { index: false, follow: true } };
export default function RegisterPage() {
  return <StorefrontShell page="account"><SiteHeader active="account" /><main id="account-main" className="account-main"><RegisterPiece /></main></StorefrontShell>;
}
