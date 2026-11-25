"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function ChromeLogo() {
  const host = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let disposed = false;
    let teardown: (() => void) | undefined;

    async function createScene() {
      const [THREE, { SVGLoader }, { RoomEnvironment }] = await Promise.all([
        import("three"),
        import("three/addons/loaders/SVGLoader.js"),
        import("three/addons/environments/RoomEnvironment.js"),
      ]);
      if (disposed || !element) return;
      const svg = await fetch("/brand/logo.svg").then((response) => {
        if (!response.ok) throw new Error("Logo unavailable");
        return response.text();
      });
      if (disposed) return;

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
      renderer.setClearColor(0x0d0909, 0);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.85;
      element.appendChild(renderer.domElement);
      renderer.domElement.setAttribute("aria-hidden", "true");

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
      camera.position.z = 12;
      const environment = new RoomEnvironment();
      const pmrem = new THREE.PMREMGenerator(renderer);
      const environmentMap = pmrem.fromScene(environment, 0.025);
      scene.environment = environmentMap.texture;
      const material = new THREE.MeshPhysicalMaterial({
        color: 0xe5e4e3, metalness: 1, roughness: 0.11,
        clearcoat: 1, clearcoatRoughness: 0.06, envMapIntensity: 1.1,
      });
      const logo = new THREE.Group();
      const geometries: InstanceType<typeof THREE.ExtrudeGeometry>[] = [];
      for (const path of new SVGLoader().parse(svg).paths) {
        for (const shape of path.toShapes()) {
          const geometry = new THREE.ExtrudeGeometry(shape, {
            depth: 2.8, bevelEnabled: true, bevelSegments: 5,
            steps: 1, bevelSize: 0.85, bevelThickness: 1, curveSegments: 24,
          });
          geometry.translate(-95.145, -37.61, -1.15);
          geometry.scale(0.047, -0.08, 0.13);
          // A gentle saddle gives the extruded mark curved metal reflections.
          const vertices = geometry.getAttribute("position");
          const normals = geometry.getAttribute("normal");
          const normal = new THREE.Vector3();
          for (let index = 0; index < vertices.count; index++) {
            const x = vertices.getX(index);
            const y = vertices.getY(index);
            vertices.setZ(index, vertices.getZ(index) + 0.05 * x * x - 0.06 * y * y);
            normal.set(normals.getX(index) - 0.1 * x * normals.getZ(index), normals.getY(index) + 0.12 * y * normals.getZ(index), normals.getZ(index)).normalize();
            normals.setXYZ(index, normal.x, normal.y, normal.z);
          }
          geometries.push(geometry);
          logo.add(new THREE.Mesh(geometry, material));
        }
      }
      scene.add(logo);
      const key = new THREE.DirectionalLight(0xffffff, 2.5);
      key.position.set(-3, 5, 7);
      const rim = new THREE.DirectionalLight(0xb8c6dc, 3);
      rim.position.set(4, -3, 2);
      scene.add(key, rim, new THREE.AmbientLight(0xffffff, 0.15));

      const pointer = { x: 0, y: 0 };
      let inView = false;
      let frame = 0;
      let time = 0;
      let last = 0;
      const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
      const resize = () => {
        const { width, height } = element.getBoundingClientRect();
        renderer.setSize(width, height);
        camera.aspect = width / Math.max(height, 1);
        camera.position.z = camera.aspect < 1 ? 16 : 12;
        camera.updateProjectionMatrix();
        if (!inView || preference.matches) renderer.render(scene, camera);
      };
      const draw = (now: number) => {
        if (disposed || !inView || document.hidden) { frame = 0; last = 0; return; }
        const delta = last ? Math.min((now - last) / 1000, 0.05) : 0;
        last = now;
        if (!preference.matches) time += delta;
        const section = element.closest("section")?.getBoundingClientRect();
        const scroll = section ? Math.max(-1, Math.min(1, (window.innerHeight / 2 - section.top - section.height / 2) / window.innerHeight)) : 0;
        logo.rotation.x += ((0.25 + pointer.y * 0.18 + scroll * 0.24) - logo.rotation.x) * 0.05;
        logo.rotation.y += ((-0.3 + pointer.x * 0.35 + scroll * 0.8) - logo.rotation.y) * 0.05;
        logo.rotation.z = -0.27 + (preference.matches ? 0 : Math.sin(time * 0.3) * 0.06);
        logo.position.y = preference.matches ? 0 : Math.sin(time * 0.7) * 0.12;
        renderer.render(scene, camera);
        if (!preference.matches) frame = requestAnimationFrame(draw);
        else frame = 0;
      };
      const start = () => { if (inView && !document.hidden && !frame) frame = requestAnimationFrame(draw); };
      const visibility = new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
        start();
      }, { rootMargin: "80px" });
      visibility.observe(element);
      const sizes = new ResizeObserver(resize);
      sizes.observe(element);
      const move = (event: PointerEvent) => {
        if (preference.matches) return;
        const rect = element.getBoundingClientRect();
        pointer.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
        pointer.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      };
      const leave = () => { pointer.x = 0; pointer.y = 0; };
      const contextLost = (event: Event) => { event.preventDefault(); setReady(false); cancelAnimationFrame(frame); frame = 0; };
      element.addEventListener("pointermove", move);
      element.addEventListener("pointerleave", leave);
      renderer.domElement.addEventListener("webglcontextlost", contextLost);
      document.addEventListener("visibilitychange", start);
      preference.addEventListener("change", start);
      logo.rotation.set(0.25, -0.3, -0.27);
      resize();
      renderer.render(scene, camera);
      setReady(true);
      teardown = () => {
        cancelAnimationFrame(frame);
        sizes.disconnect();
        visibility.disconnect();
        element.removeEventListener("pointermove", move);
        element.removeEventListener("pointerleave", leave);
        document.removeEventListener("visibilitychange", start);
        preference.removeEventListener("change", start);
        renderer.domElement.removeEventListener("webglcontextlost", contextLost);
        geometries.forEach((geometry) => geometry.dispose());
        material.dispose();
        environmentMap.dispose();
        environment.dispose();
        pmrem.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    }

    const loader = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      loader.disconnect();
      createScene().catch(() => { /* Keep the exact Figma image when WebGL is unavailable. */ });
    }, { rootMargin: "600px" });
    loader.observe(element);
    return () => { disposed = true; loader.disconnect(); teardown?.(); };
  }, []);

  return (
    <div ref={host} className={`chrome-logo ${ready ? "is-ready" : ""}`} role="img" aria-label="Estrela STG em metal cromado, com o olho da marca no centro">
      <Image src="/images/chrome-star.webp" alt="" fill sizes="(min-width: 768px) 50vw, 90vw" className="chrome-fallback object-contain" />
    </div>
  );
}
