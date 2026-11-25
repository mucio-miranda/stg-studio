import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { TubeTransition } from "@/components/tube-transition";

const generalSans = localFont({
  src: [
    { path: "../../public/fonts/GeneralSans-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/GeneralSans-Medium.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/GeneralSans-Semibold.woff2", weight: "600", style: "normal" },
    { path: "../../public/fonts/GeneralSans-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-general",
  display: "swap",
});

export const metadata: Metadata = {
  title: "STG Studio™ — Um novo olhar sobre o que já existe.",
  description: "Upcycling e streetwear de João Pessoa para o Brasil. Conheça o universo STG Studio e a Collection #001.",
  icons: { icon: "/brand/logo.svg" },
  openGraph: {
    title: "STG Studio™ — Collection #001",
    description: "Um novo olhar sobre o que já existe. Nordeste, Brazil.",
    locale: "pt_BR",
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#0d0909" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR" className={generalSans.variable}><body>{children}<TubeTransition /></body></html>;
}
