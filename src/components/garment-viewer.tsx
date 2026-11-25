"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { GarmentModel } from "@/lib/catalog";
import type { GarmentScene } from "@/lib/garment-scene";

export function GarmentViewer({ model, image, name }: { model: GarmentModel; image: string; name: string }) {
  const host = useRef<HTMLDivElement>(null);
  const scene = useRef<GarmentScene | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    const controller = new AbortController();
    let active = true;
    let handle: GarmentScene | undefined;
    const fail = () => { if (active) { setFailed(true); setReady(false); } handle?.dispose(); scene.current = null; };
    const timeout = window.setTimeout(() => { controller.abort(); fail(); }, 15000);
    import("@/lib/garment-scene").then(async ({ createGarmentScene }) => {
      if (!active || controller.signal.aborted) return;
      handle = await createGarmentScene(element, model, controller.signal, fail);
      if (!active || controller.signal.aborted) { handle.dispose(); return; }
      window.clearTimeout(timeout); scene.current = handle; setReady(true);
    }).catch(() => { window.clearTimeout(timeout); fail(); });
    return () => { active = false; controller.abort(); window.clearTimeout(timeout); handle?.dispose(); scene.current = null; };
  }, [model]);
  return <div className="garment-viewer" data-ready={ready} data-failed={failed}>
    {!ready && <Image src={image} alt={name} fill sizes="(max-width: 767px) 88vw, 48vw" className="object-cover garment-fallback" />}
    <div ref={host} className="garment-stage" role="img" aria-label={`Estudo 3D conceitual de ${name}; não é réplica da peça real`} />
    <div className="garment-label">{failed ? "3D indisponível neste dispositivo. Foto preservada." : ready ? "ESTUDO CONCEITUAL · ARRASTE PARA GIRAR" : "Carregando estudo 3D…"}</div>
    <div className="garment-controls" aria-label="Controles do estudo 3D"><button disabled={!ready} aria-label="Girar peça para a esquerda" onClick={() => scene.current?.rotate(-Math.PI / 6)}>↶</button><button disabled={!ready} onClick={() => scene.current?.reset()}>REINICIAR</button><button disabled={!ready} aria-label="Girar peça para a direita" onClick={() => scene.current?.rotate(Math.PI / 6)}>↷</button></div>
  </div>;
}
