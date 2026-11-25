import Image from "next/image";

export function Logo({ className = "", outline = false }: { className?: string; outline?: boolean }) {
  return <Image src={outline ? "/brand/logo-outline.svg" : "/brand/logo.svg"} alt="" width={190} height={75} className={`brand-logo ${className}`} />;
}

export function Arrow({ diagonal = false, className = "" }: { diagonal?: boolean; className?: string }) {
  return <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={diagonal ? "M5 19 19 5M5 5h14v14" : "M4 12h16m-6-6 6 6-6 6"} stroke="currentColor" strokeWidth="1.3" /></svg>;
}
