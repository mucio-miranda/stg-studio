import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";
import type { GarmentModel } from "./catalog";

export type GarmentScene = { dispose: () => void; rotate: (delta: number) => void; reset: () => void };

// Geometric studies, NOT scans or exact replicas of catalog products.
export async function createGarmentScene(host: HTMLDivElement, kind: GarmentModel, signal: AbortSignal, onLost: () => void): Promise<GarmentScene> {
  let logoShapes: THREE.Shape[] = [];
  if (kind === "pendant") {
    const response = await fetch("/brand/logo.svg", { signal });
    if (!response.ok) throw new Error("Logo indisponível.");
    logoShapes = new SVGLoader().parse(await response.text()).paths.flatMap((path) => path.toShapes());
  }
  if (signal.aborted) throw new DOMException("Cancelled", "AbortError");
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
  const scene = new THREE.Scene();
  const root = new THREE.Group();
  scene.add(root);
  const materials = new Set<THREE.Material>();
  const geometries = new Set<THREE.BufferGeometry>();
  let texture: THREE.CanvasTexture | undefined;
  let environment: RoomEnvironment | undefined;
  let pmrem: THREE.PMREMGenerator | undefined;
  let environmentMap: THREE.WebGLRenderTarget | undefined;
  let controls: OrbitControls | undefined;
  let resize: ResizeObserver | undefined;
  let observer: IntersectionObserver | undefined;
  let disposed = false;
  let frame = 0;
  let visible = true;
  const camera = new THREE.PerspectiveCamera(36, 1, .1, 100);
  const render = () => { frame = 0; if (!disposed && visible && !document.hidden) renderer.render(scene, camera); };
  const schedule = () => { if (!disposed && !frame) frame = requestAnimationFrame(render); };
  const lost = (event: Event) => { event.preventDefault(); onLost(); };
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    resize?.disconnect(); observer?.disconnect();
    controls?.dispose();
    document.removeEventListener("visibilitychange", schedule);
    renderer.domElement.removeEventListener("webglcontextlost", lost);
    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((material) => material.dispose());
    texture?.dispose(); environmentMap?.dispose(); environment?.dispose(); pmrem?.dispose();
    renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove();
  };
  try {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setClearColor(0x161211, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.domElement.setAttribute("aria-hidden", "true");
    host.appendChild(renderer.domElement);
    environment = new RoomEnvironment();
    pmrem = new THREE.PMREMGenerator(renderer);
    environmentMap = pmrem.fromScene(environment, .04);
    scene.environment = environmentMap.texture;

    const weave = document.createElement("canvas");
    weave.width = weave.height = 128;
    const context = weave.getContext("2d");
    if (context) {
      context.fillStyle = "#636b74"; context.fillRect(0, 0, 128, 128);
      for (let index = -128; index < 256; index += 4) {
        context.strokeStyle = index % 8 === 0 ? "#9da5ab" : "#3c4652";
        context.lineWidth = 1;
        context.beginPath(); context.moveTo(index, 0); context.lineTo(index + 128, 128); context.stroke();
      }
      texture = new THREE.CanvasTexture(weave);
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(4, 4);
      texture.colorSpace = THREE.SRGBColorSpace;
    }
    const denim = new THREE.MeshStandardMaterial({ color: 0x69798c, map: texture, roughness: .91, metalness: .04, side: THREE.DoubleSide });
    const dark = new THREE.MeshStandardMaterial({ color: 0x283340, map: texture, roughness: .9, side: THREE.DoubleSide });
    const silver = new THREE.MeshStandardMaterial({ color: 0xc7c9cc, metalness: .95, roughness: .23 });
    const stitch = new THREE.LineBasicMaterial({ color: 0xa99d8a, transparent: true, opacity: .55 });
    [denim, dark, silver, stitch].forEach((material) => materials.add(material));
    const add = (geometry: THREE.BufferGeometry, material: THREE.Material, x = 0, y = 0, z = 0) => {
      geometries.add(geometry);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, y, z);
      root.add(mesh);
      return mesh;
    };
    const box = (w: number, h: number, d: number, x = 0, y = 0, z = 0, material: THREE.Material = denim) => add(new RoundedBoxGeometry(w, h, d, 3, Math.min(.065, d / 3)), material, x, y, z);
    const line = (points: number[][]) => {
      const geometry = new THREE.BufferGeometry().setFromPoints(points.map((point) => new THREE.Vector3(...point as [number, number, number])));
      geometries.add(geometry); root.add(new THREE.Line(geometry, stitch));
    };
    const button = (x: number, y: number, z: number, radius = .035) => { const item = add(new THREE.CylinderGeometry(radius, radius, .025, 16), silver, x, y, z); item.rotation.x = Math.PI / 2; };
    const pocket = (x: number, y: number, z: number, width = .38) => {
      box(width, .34, .055, x, y, z, dark);
      line([[x - width / 2 + .035, y + .12, z + .034], [x - width / 2 + .035, y - .13, z + .034], [x + width / 2 - .035, y - .13, z + .034], [x + width / 2 - .035, y + .12, z + .034]]);
      button(x, y + .12, z + .055, .025);
    };

    if (kind === "jacket") {
      box(1.42, 1.46, .38, 0, -.02);
      box(.09, 1.41, .055, 0, -.02, .22, dark);
      for (const side of [-1, 1]) {
        const sleeve = box(.43, 1.34, .35, side * .96, .01);
        sleeve.rotation.z = side * .28;
        box(.47, .17, .37, side * 1.13, -.56, 0, dark).rotation.z = side * .28;
        pocket(side * .38, .28, .218);
        const collar = new THREE.Shape();
        collar.moveTo(0, 0); collar.lineTo(side * .36, .2); collar.lineTo(side * .3, -.24); collar.closePath();
        add(new THREE.ExtrudeGeometry(collar, { depth: .035, bevelEnabled: false }), dark, side * .025, .58, .19);
      }
      for (let index = 0; index < 6; index++) button(.015, .53 - index * .21, .264);
      box(1.42, .15, .41, 0, -.68, 0, dark);
      line([[-.59, -.55, .203], [-.59, -.02, .203]]);
      line([[.59, -.55, .203], [.59, -.02, .203]]);
    } else if (kind === "pants") {
      box(1.2, .5, .42, 0, .8);
      box(1.22, .13, .46, 0, 1.02, 0, dark);
      for (const side of [-1, 1]) {
        box(.54, 1.6, .38, side * .32, -.17).rotation.z = side * -.025;
        box(.56, .16, .41, side * .34, -.91, 0, dark);
        pocket(side * .32, .76, -.23, .38);
        line([[side * .5, .74, .228], [side * .51, -.79, .21]]);
      }
      box(.065, .43, .03, .04, .76, .236, dark); button(.04, 1.025, .254);
    } else if (kind === "skirt") {
      const geometry = new THREE.CylinderGeometry(.51, .86, 1.45, 64, 12, true);
      const positions = geometry.getAttribute("position");
      for (let index = 0; index < positions.count; index++) {
        const y = positions.getY(index), angle = Math.atan2(positions.getZ(index), positions.getX(index));
        const wave = 1 + Math.sin(angle * 11) * .025 * (.8 - y);
        positions.setX(index, positions.getX(index) * wave); positions.setZ(index, positions.getZ(index) * wave);
      }
      geometry.computeVertexNormals(); add(geometry, denim);
      add(new THREE.CylinderGeometry(.51, .54, .14, 64, 1, true), dark, 0, .66);
      pocket(-.27, .27, .54, .29);
      line([[.02, .6, .525], [.02, -.66, .86]]); button(.02, .67, .545);
    } else if (kind === "bag") {
      box(1.3, 1.04, .46, 0, -.18);
      box(1.18, .12, .49, 0, .34, 0, dark);
      for (const z of [-.18, .18]) add(new THREE.TorusGeometry(.42, .055, 12, 48, Math.PI), dark, 0, .32, z);
      pocket(0, -.2, .26, .8);
      for (const side of [-1, 1]) button(side * .44, .29, .267);
    } else {
      for (const shape of logoShapes) {
        const geometry = new THREE.ExtrudeGeometry(shape, { depth: 3, bevelEnabled: true, bevelSegments: 3, bevelSize: .5, bevelThickness: .6, curveSegments: 18 });
        geometry.translate(-95.145, -37.61, -1.5); geometry.scale(.014, -.021, .025);
        add(geometry, silver);
      }
      add(new THREE.TorusGeometry(.10, .023, 10, 30), silver, 0, .86);
    }
    const bounds = new THREE.Box3().setFromObject(root);
    const center = bounds.getCenter(new THREE.Vector3());
    const size = bounds.getSize(new THREE.Vector3());
    root.position.sub(center);
    const fit = 2.7 / Math.max(size.x, size.y, size.z);
    root.scale.setScalar(fit);
    root.position.multiplyScalar(fit);
    root.rotation.y = -.32;
    scene.add(new THREE.HemisphereLight(0xe8edf6, 0x241c17, 2));
    const key = new THREE.DirectionalLight(0xfff5e8, 3);
    key.position.set(-3, 4, 5); scene.add(key);
    const rim = new THREE.DirectionalLight(0xadbdda, 2);
    rim.position.set(4, 1, -2); scene.add(rim);
    camera.position.set(0, .2, 6.4);
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false; controls.enableZoom = false; controls.enableDamping = false;
    controls.minPolarAngle = .35; controls.maxPolarAngle = Math.PI - .35;
    controls.addEventListener("change", schedule);
    controls.saveState();
    const onResize = () => {
      if (disposed) return;
      const { width, height } = host.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.position.z = camera.aspect < .8 ? 7.5 : 6.4;
      camera.updateProjectionMatrix(); schedule();
    };
    resize = new ResizeObserver(onResize); resize.observe(host);
    observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) schedule(); });
    observer.observe(host);
    renderer.domElement.addEventListener("webglcontextlost", lost);
    document.addEventListener("visibilitychange", schedule);
    onResize(); renderer.render(scene, camera);
    return { dispose, rotate: (delta) => { root.rotation.y += delta; schedule(); }, reset: () => { root.rotation.y = -.32; controls?.reset(); onResize(); } };
  } catch (error) { dispose(); throw error; }
}
