import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "404 — STG Studio™",
  description: "A página que você acessou não existe.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main className="not-found-page" aria-labelledby="not-found-title">
      <div className="not-found-content">
        <Image
          src="/images/broken-stg.png"
          alt="Logo cromada da STG Studio quebrada em fragmentos"
          width={1254}
          height={1254}
          sizes="(max-width: 600px) 86vw, 520px"
          preload
          className="not-found-art"
        />
        <h1 id="not-found-title">Opss. Você acabou se perdendo.</h1>
        <p>A página que você acessou não existe.</p>
        <Link href="/" className="bracket-link not-found-return">
          [ <span>VOLTAR PRO INÍCIO</span> ]
        </Link>
      </div>
    </main>
  );
}
