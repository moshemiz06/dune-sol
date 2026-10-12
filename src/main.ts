import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { createLandscape, createPlanet, rng } from "./world";
import { locations } from "./locations";
import type { LocationId } from "./locations";
import { icon } from "./icons";
import "./style.css";

import { mountLayout } from "./layout";

mountLayout(document.querySelector<HTMLDivElement>("#app")!);

const el = <T extends HTMLElement = HTMLElement>(id: string) =>
  document.getElementById(id) as T;
const viewer = el("viewer"),
  container = el("scene");
let renderer: THREE.WebGLRenderer;
try {
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
} catch {
  el("loader").remove();
  container.innerHTML = `<div class="fallback"><div><h2>Your world is ready.</h2><p>This browser couldn’t start a 3D renderer. You can still download the complete models and open them in Blender or another 3D viewer.</p><a href="/models/arrakis-landscape.glb" download>Download the landscape model</a></div></div>`;
  renderer = null!;
}
let currentId: LocationId = "arrakeen",
  mode: "landscape" | "planet" = "landscape",
  labelsOn = true,
  autoOrbit = false,
  storyExpanded = false;
function renderCard() {
  const l = locations.find((l) => l.id === currentId)!;
  if (mode === "planet") {
    el("info-card").innerHTML =
      `<div class="card-top"><span class="category">PLANETARY SURVEY · ARRAKIS</span><span class="card-index">DUNE</span></div><h2>A world of sand.</h2><p>The source of the spice melange. Arrakis is an arid world with two moons, immense deserts, and settlements sheltered by rock in its far north.</p><div class="facts"><span>Two moons</span><span>Home of the spice</span></div>`;
    return;
  }
  el("info-card").innerHTML =
    `<div class="card-top"><span class="category">${l.category}</span><span class="card-index">${l.number} / 05</span></div><h2>${l.name}</h2><p>${l.description}</p><div class="facts">${l.facts.map((f) => `<span>${f}</span>`).join("")}</div><button class="story-toggle" aria-expanded="${storyExpanded}" id="story-toggle">A moment from the book ${icon("chevron", 11)}</button>${storyExpanded ? `<p class="story-note">${l.note}</p>` : ""}`;
  el("story-toggle").addEventListener("click", () => {
    storyExpanded = !storyExpanded;
    renderCard();
  });
}
renderCard();
const about = el<HTMLDialogElement>("about-dialog"),
  exportDialog = el<HTMLDialogElement>("export-dialog");
el("about-btn").addEventListener("click", () => about.showModal());
el("export-btn").addEventListener("click", () => exportDialog.showModal());
document.querySelectorAll<HTMLDialogElement>("dialog").forEach((d) => {
  d.querySelector("[data-close]")!.addEventListener("click", () => d.close());
  d.addEventListener("click", (e) => {
    if (e.target === d) {
      const r = d.getBoundingClientRect();
      if (
        e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom
      )
        d.close();
    }
  });
});
let toastTimer: ReturnType<typeof setTimeout>;
function toast(message: string) {
  el("toast").textContent = message;
  el("toast").classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el("toast").classList.remove("show"), 2500);
}

if (renderer) initScene();
function initScene() {
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.28;
  renderer.domElement.setAttribute(
    "aria-label",
    "3D Arrakis model. Drag to orbit, scroll to zoom, or use the location buttons.",
  );
  renderer.domElement.setAttribute("role", "img");
  container.prepend(renderer.domElement);
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog("#23271c", 260, 570);
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 1500);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.065;
  controls.minDistance = 14;
  controls.maxDistance = 440;
  controls.maxPolarAngle = Math.PI * 0.47;
  controls.minPolarAngle = 0.1;
  controls.autoRotateSpeed = 0.45;
  controls.zoomSpeed = 0.7;
  controls.panSpeed = 0.6;
  const hemisphere = new THREE.HemisphereLight("#dce0d0", "#6a5e4a", 1.5);
  scene.add(hemisphere);
  const sun = new THREE.DirectionalLight("#fff0d5", 2.7);
  sun.position.set(-100, 120, 80);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -145;
  sun.shadow.camera.right = 145;
  sun.shadow.camera.top = 115;
  sun.shadow.camera.bottom = -115;
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 450;
  sun.shadow.normalBias = 0.16;
  sun.shadow.bias = -0.00008;
  sun.shadow.radius = 3;
  scene.add(sun);
  const fill = new THREE.DirectionalLight("#c3cbad", 0.7);
  fill.position.set(80, 50, -90);
  scene.add(fill);
  const { root, flight } = createLandscape();
  const planet = createPlanet();
  planet.visible = false;
  scene.add(root, planet);
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(650, 650),
    new THREE.ShadowMaterial({ opacity: 0.14 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -5.4;
  floor.receiveShadow = true;
  scene.add(floor);
  const gridPoints = [];
  for (let i = -165; i <= 165; i += 15) {
    gridPoints.push(
      new THREE.Vector3(-165, -5.5, i),
      new THREE.Vector3(165, -5.5, i),
      new THREE.Vector3(i, -5.5, -165),
      new THREE.Vector3(i, -5.5, 165),
    );
  }
  const grid = new THREE.LineSegments(
    new THREE.BufferGeometry().setFromPoints(gridPoints),
    new THREE.LineBasicMaterial({
      color: "#9ca279",
      transparent: true,
      opacity: 0.07,
    }),
  );
  scene.add(grid);
  // A fine veil of still dust gives scale without hiding the geometry.
  const random = rng(199),
    dustPos = [];
  for (let i = 0; i < 500; i++)
    dustPos.push(
      (random() - 0.5) * 225,
      random() * 50 + 2,
      (random() - 0.5) * 160,
    );
  const dust = new THREE.Points(
    new THREE.BufferGeometry().setAttribute(
      "position",
      new THREE.Float32BufferAttribute(dustPos, 3),
    ),
    new THREE.PointsMaterial({
      color: "#dec297",
      size: 0.12,
      transparent: true,
      opacity: 0.32,
      depthWrite: false,
    }),
  );
  scene.add(dust);
  const selection = new THREE.Mesh(
    new THREE.RingGeometry(2.8, 2.86, 64),
    new THREE.MeshBasicMaterial({
      color: "#ead3a1",
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  selection.rotation.x = -Math.PI / 2;
  selection.position.set(-24, 1.9, -7);
  scene.add(selection);
  let animation: {
    from: THREE.Vector3;
    to: THREE.Vector3;
    targetFrom: THREE.Vector3;
    targetTo: THREE.Vector3;
    start: number;
    duration: number;
  } | null = null;
  let fitDistance = 1;
  function homePosition() {
    return mode === "planet"
      ? new THREE.Vector3(100, 43, 198)
      : new THREE.Vector3(173, 156, 205).multiplyScalar(fitDistance);
  }
  function moveTo(
    position: THREE.Vector3,
    target: THREE.Vector3,
    duration = 1150,
  ) {
    animation = {
      from: camera.position.clone(),
      to: position,
      targetFrom: controls.target.clone(),
      targetTo: target,
      start: performance.now(),
      duration,
    };
  }
  function reset(instant = false) {
    const target = new THREE.Vector3(0, mode === "planet" ? 0 : -2, 0);
    if (instant) {
      camera.position.copy(homePosition());
      controls.target.copy(target);
      controls.update();
    } else moveTo(homePosition(), target);
  }
  function resize() {
    const rect = container.getBoundingClientRect();
    const aspect = rect.width / rect.height;
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    renderer.setSize(rect.width, rect.height);
    fitDistance = aspect < 0.9 ? 1.4 : aspect < 1.3 ? 1.1 : 1;
  }
  new ResizeObserver(resize).observe(container);
  resize();
  reset(true);
  controls.addEventListener("start", () => {
    animation = null;
  });
  const labelNodes = Array.from(
    document.querySelectorAll<HTMLButtonElement>("[data-landmark]"),
  );
  const labelOffsets: Record<LocationId, [number, number]> = {
    arrakeen: [7, -12],
    residence: [-110, -28],
    shield: [-28, -22],
    spice: [10, -13],
    spaceport: [9, 11],
  };
  const projected = new THREE.Vector3();
  function updateLabels() {
    const cr = container.getBoundingClientRect(),
      vr = viewer.getBoundingClientRect();
    labelNodes.forEach((label, i) => {
      const l = locations[i];
      projected.set(l.point[0], l.point[1], l.point[2]).project(camera);
      const dx =
          cr.width * 0.5 * (projected.x + 1) +
          cr.left -
          vr.left +
          labelOffsets[l.id][0],
        dy =
          cr.height * 0.5 * (1 - projected.y) +
          cr.top -
          vr.top +
          labelOffsets[l.id][1];
      label.style.transform = `translate(${dx}px,${dy}px)`;
      label.style.visibility =
        projected.z > 1 ||
        dx < -150 ||
        dx > vr.width - 25 ||
        dy < 0 ||
        dy > vr.height - 210
          ? "hidden"
          : "visible";
    });
    const angle = Math.atan2(
      camera.position.x - controls.target.x,
      camera.position.z - controls.target.z,
    );
    el("compass-needle").style.transform =
      `rotate(${(-angle * 180) / Math.PI}deg)`;
  }
  function setMode(next: "landscape" | "planet", fly = true) {
    if (next === mode) return;
    mode = next;
    applyLighting();
    root.visible = mode === "landscape";
    planet.visible = mode === "planet";
    grid.visible =
      floor.visible =
      dust.visible =
      selection.visible =
        mode === "landscape";
    viewer.classList.toggle("planet", mode === "planet");
    controls.maxDistance = mode === "planet" ? 350 : 440;
    controls.minDistance = mode === "planet" ? 75 : 14;
    el("stage-meta").innerHTML =
      mode === "planet"
        ? "THIRD PLANET · CANOPUS SYSTEM<br><b>ARRAKIS & ITS TWO MOONS</b>"
        : "NORTHERN HEMISPHERE<br><b>ARRAKEEN & SURROUNDING DESERT</b>";
    document.querySelectorAll<HTMLButtonElement>("[data-mode]").forEach((b) => {
      const active = b.dataset.mode === mode;
      b.classList.toggle("active", active);
      b.setAttribute("aria-pressed", String(active));
    });
    el<HTMLButtonElement>("labels-toggle").disabled = mode === "planet";
    renderCard();
    if (fly) reset();
  }
  function selectLocation(id: LocationId, fly = true) {
    if (mode === "planet") setMode("landscape", false);
    currentId = id;
    storyExpanded = false;
    const l = locations.find((l) => l.id === id)!;
    document
      .querySelectorAll<HTMLButtonElement>("[data-location]")
      .forEach((b) => {
        const active = b.dataset.location === id;
        b.classList.toggle("active", active);
        b.setAttribute("aria-pressed", String(active));
      });
    labelNodes.forEach((b) =>
      b.classList.toggle("active", b.dataset.landmark === id),
    );
    renderCard();
    const target = new THREE.Vector3(...l.target);
    const offset = new THREE.Vector3(...l.offset).multiplyScalar(
      camera.aspect < 0.85 ? 1.6 : camera.aspect < 1.1 ? 1.2 : 1,
    );
    if (fly) moveTo(target.clone().add(offset), target);
    selection.position.set(
      l.target[0],
      ground(l.target[0], l.target[2]),
      l.target[2],
    );
    const mapPositions: Record<LocationId, [number, number]> = {
      arrakeen: [49, 52],
      residence: [42, 47],
      shield: [75, 32],
      spice: [99, 70],
      spaceport: [65, 56],
    };
    const [mx, my] = mapPositions[id];
    for (const name of ["map-marker", "map-halo"]) {
      document.getElementById(name)!.setAttribute("cx", String(mx));
      document.getElementById(name)!.setAttribute("cy", String(my));
    }
  }
  function ground(x: number, z: number) {
    return x === -24 && z === -7
      ? 1.9
      : (locations.find((l) => l.target[0] === x && l.target[2] === z)
          ?.target[1] ?? 2.5);
  }
  function zoom(factor: number) {
    animation = null;
    const displacement = camera.position.clone().sub(controls.target);
    const distance = THREE.MathUtils.clamp(
      displacement.length() * factor,
      controls.minDistance,
      controls.maxDistance,
    );
    moveTo(
      controls.target.clone().add(displacement.setLength(distance)),
      controls.target.clone(),
      450,
    );
  }
  function toggleLabels() {
    labelsOn = !labelsOn;
    el("labels").style.display = labelsOn ? "" : "none";
    el("labels-toggle").classList.toggle("active", labelsOn);
    el("labels-toggle").setAttribute("aria-pressed", String(labelsOn));
  }
  function toggleOrbit() {
    autoOrbit = !autoOrbit;
    controls.autoRotate = autoOrbit;
    el("orbit-toggle").classList.toggle("active", autoOrbit);
    el("orbit-toggle").setAttribute("aria-pressed", String(autoOrbit));
    el("orbit-toggle").innerHTML =
      `${icon(autoOrbit ? "pause" : "play", 13)}Auto orbit`;
  }
  document
    .querySelectorAll<HTMLButtonElement>("[data-location],[data-landmark]")
    .forEach((b) =>
      b.addEventListener("click", () =>
        selectLocation(
          (b.dataset.location ?? b.dataset.landmark) as LocationId,
        ),
      ),
    );
  document
    .querySelectorAll<HTMLButtonElement>("[data-mode]")
    .forEach((b) =>
      b.addEventListener("click", () => setMode(b.dataset.mode as typeof mode)),
    );
  let currentTime = "day";
  function applyLighting() {
    const orbital = mode === "planet";
    if (currentTime === "day") {
      sun.color.set("#fff0d5");
      sun.intensity = 2.7;
      sun.position.set(-100, 120, 80);
      hemisphere.color.set("#dce0d0");
      hemisphere.intensity = orbital ? 0.4 : 1.5;
      fill.intensity = orbital ? 0.1 : 0.7;
      renderer.toneMappingExposure = 1.28;
    } else if (currentTime === "dawn") {
      sun.color.set("#ffc38a");
      sun.intensity = 3.1;
      sun.position.set(-130, 42, 60);
      hemisphere.color.set("#c8c1ad");
      hemisphere.intensity = orbital ? 0.3 : 1.3;
      fill.intensity = orbital ? 0.1 : 0.7;
      renderer.toneMappingExposure = 1.25;
    } else {
      sun.color.set("#ee9e69");
      sun.intensity = 2.6;
      sun.position.set(100, 24, 70);
      hemisphere.color.set("#8c9aa5");
      hemisphere.intensity = orbital ? 0.25 : 1.2;
      fill.intensity = orbital ? 0.08 : 0.45;
      renderer.toneMappingExposure = 1.08;
    }
    sun.shadow.needsUpdate = true;
  }
  document.querySelectorAll<HTMLButtonElement>("[data-time]").forEach((b) =>
    b.addEventListener("click", () => {
      currentTime = b.dataset.time!;
      document
        .querySelectorAll<HTMLButtonElement>("[data-time]")
        .forEach((n) => {
          n.classList.toggle("active", n === b);
          n.setAttribute("aria-pressed", String(n === b));
        });
      applyLighting();
    }),
  );
  el("zoom-in").addEventListener("click", () => zoom(0.82));
  el("zoom-out").addEventListener("click", () => zoom(1.22));
  el("reset").addEventListener("click", () => reset());
  el("labels-toggle").addEventListener("click", toggleLabels);
  el("orbit-toggle").addEventListener("click", toggleOrbit);
  el("fullscreen").addEventListener("click", async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await viewer.requestFullscreen();
    } catch {
      toast("Full screen isn’t available in this browser.");
    }
  });
  document.addEventListener("keydown", (e) => {
    if (
      about.open ||
      exportDialog.open ||
      e.ctrlKey ||
      e.metaKey ||
      e.altKey ||
      e.target instanceof HTMLInputElement
    )
      return;
    const i = Number(e.key) - 1;
    if (i >= 0 && i < locations.length) selectLocation(locations[i].id);
    else if (e.key.toLowerCase() === "r") reset();
    else if (e.key.toLowerCase() === "l" && mode === "landscape")
      toggleLabels();
    else if (e.key === "+" || e.key === "=") zoom(0.82);
    else if (e.key === "-") zoom(1.22);
  });
  let dragging = false,
    pointerStart = new THREE.Vector2();
  renderer.domElement.addEventListener("pointerdown", (e) => {
    pointerStart.set(e.clientX, e.clientY);
    dragging = false;
  });
  renderer.domElement.addEventListener("pointermove", (e) => {
    if (pointerStart.distanceTo(new THREE.Vector2(e.clientX, e.clientY)) > 5)
      dragging = true;
  });
  renderer.domElement.addEventListener("click", (e) => {
    if (dragging || mode === "planet") return;
    const rect = renderer.domElement.getBoundingClientRect();
    let closest: (typeof locations)[number] | null = null,
      distance = 26;
    for (const l of locations) {
      projected.set(l.point[0], l.point[1], l.point[2]).project(camera);
      const x = ((projected.x + 1) * rect.width) / 2 + rect.left,
        y = ((1 - projected.y) * rect.height) / 2 + rect.top,
        d = Math.hypot(x - e.clientX, y - e.clientY);
      if (d < distance) {
        closest = l;
        distance = d;
      }
    }
    if (closest) selectLocation(closest.id);
  });
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) controls.enableDamping = false;
  let lastTime = performance.now(),
    running = true;
  document.addEventListener("visibilitychange", () => {
    running = !document.hidden;
    if (running) {
      lastTime = performance.now();
      requestAnimationFrame(frame);
    }
  });
  function frame(now: number) {
    if (!running) return;
    requestAnimationFrame(frame);
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    if (animation) {
      const t = Math.min((now - animation.start) / animation.duration, 1),
        ease = 1 - Math.pow(1 - t, 3);
      camera.position.lerpVectors(animation.from, animation.to, ease);
      controls.target.lerpVectors(
        animation.targetFrom,
        animation.targetTo,
        ease,
      );
      if (t >= 1) animation = null;
    }
    controls.update(dt);
    if (!reduced && mode === "landscape") {
      flight.position.y = 18 + Math.sin(now * 0.0006) * 0.22;
      const wings = flight.getObjectByName("Wing assembly");
      if (wings) wings.rotation.z = Math.sin(now * 0.018) * 0.03;
    }
    updateLabels();
    renderer.render(scene, camera);
  }
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
  el("loader").classList.add("hidden");
  setTimeout(() => el("loader")?.remove(), 800);
  // Exposed only for inspection; all public controls operate through the same state.
  (window as unknown as { arrakis: unknown }).arrakis = {
    scene,
    camera,
    controls,
    renderer,
    root,
    planet,
    getState: () => ({
      mode,
      currentId,
      labelsOn,
      autoOrbit,
      currentTime,
      meshes: renderer.info.render.calls,
      triangles: renderer.info.render.triangles,
    }),
    selectLocation,
    setMode,
    reset,
  };
}
