import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const mix = THREE.MathUtils.lerp;
const smooth = THREE.MathUtils.smoothstep;
function noise(x: number, z: number) {
  return (
    Math.sin(x * 0.19 + Math.cos(z * 0.11)) * Math.sin(z * 0.14 + 0.5) * 0.55 +
    Math.sin(x * 0.39 + z * 0.23) * 0.2 +
    Math.cos(x * 0.067 - z * 0.09) * 0.25
  );
}
export function groundHeight(x: number, z: number) {
  const basin = 1 - smooth(Math.hypot((x + 22) / 1.28, (z + 9) / 0.92), 28, 43);
  const wave =
    x * 0.16 +
    z * 0.14 +
    Math.sin(z * 0.06) * 2.2 +
    Math.sin(x * 0.045 + z * 0.038) * 2;
  const dunes =
    1.2 +
    Math.pow((Math.sin(wave) + 1) * 0.5, 2.5) *
      (6.3 + Math.sin(z * 0.041) * 2.6) +
    noise(x, z) * 0.65;
  return mix(dunes, 1.3 + noise(x, z) * 0.15, basin);
}

const stone = new THREE.MeshStandardMaterial({
  color: "#b7976b",
  roughness: 0.98,
});
const palaceStone = new THREE.MeshStandardMaterial({
  color: "#d1b88e",
  roughness: 0.88,
});
const dark = new THREE.MeshStandardMaterial({
  color: "#4f4535",
  roughness: 0.87,
});
const glass = new THREE.MeshStandardMaterial({
  color: "#78857a",
  roughness: 0.34,
  metalness: 0.38,
});
const rust = new THREE.MeshStandardMaterial({
  color: "#74654c",
  roughness: 0.78,
  metalness: 0.2,
});
const foliage = new THREE.MeshStandardMaterial({
  color: "#596047",
  roughness: 0.92,
  side: THREE.DoubleSide,
});
function mesh(
  geo: THREE.BufferGeometry,
  mat: THREE.Material,
  name: string,
  parent: THREE.Object3D,
  x = 0,
  y = 0,
  z = 0,
) {
  const m = new THREE.Mesh(geo, mat);
  m.name = name;
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}
function box(
  parent: THREE.Object3D,
  mat: THREE.Material,
  name: string,
  x: number,
  y: number,
  z: number,
  w: number,
  h: number,
  d: number,
) {
  return mesh(new THREE.BoxGeometry(w, h, d), mat, name, parent, x, y, z);
}
function batchBoxes(
  name: string,
  material: THREE.Material,
  entries: number[][],
  parent: THREE.Object3D,
) {
  const geometries = entries.map(([x, y, z, w, h, d, rot = 0]) =>
    new THREE.BoxGeometry(w, h, d).applyMatrix4(
      new THREE.Matrix4().compose(
        new THREE.Vector3(x, y, z),
        new THREE.Quaternion().setFromAxisAngle(
          new THREE.Vector3(0, 1, 0),
          rot,
        ),
        new THREE.Vector3(1, 1, 1),
      ),
    ),
  );
  if (geometries.length) {
    mesh(mergeGeometries(geometries), material, name, parent);
    geometries.forEach((g) => g.dispose());
  }
}

function makeTerrain() {
  const sectors = 360,
    rings = 170,
    positions: number[] = [],
    colors: number[] = [],
    indices: number[] = [];
  const sandA = new THREE.Color("#b69a74"),
    sandB = new THREE.Color("#d3b88e");
  function vertex(x: number, z: number) {
    positions.push(x, groundHeight(x, z), z);
    const c = sandA
      .clone()
      .lerp(
        sandB,
        0.45 + noise(x, z) * 0.32 + Math.sin(x * 0.7 + z * 0.3) * 0.06,
      );
    colors.push(c.r, c.g, c.b);
  }
  vertex(0, 0);
  for (let r = 1; r <= rings; r++)
    for (let s = 0; s <= sectors; s++) {
      const a = (s / sectors) * Math.PI * 2,
        rad = (r / rings) * 99;
      vertex(Math.cos(a) * rad * 1.17, Math.sin(a) * rad * 0.83);
      if (r === 1 && s < sectors) indices.push(0, s + 2, s + 1);
      if (r > 1 && s < sectors) {
        const i = 1 + (r - 2) * (sectors + 1) + s;
        indices.push(
          i,
          i + 1,
          i + sectors + 1,
          i + 1,
          i + sectors + 2,
          i + sectors + 1,
        );
      }
    }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

function makeBedrock() {
  const sectors = 360,
    levels = 8,
    positions: number[] = [],
    colors: number[] = [],
    indices: number[] = [];
  const shades = [
    "#9a815d",
    "#826a4d",
    "#8d7553",
    "#755f43",
    "#806849",
    "#6c5940",
    "#756144",
    "#594b37",
    "#574935",
  ].map((s) => new THREE.Color(s));
  for (let level = 0; level <= levels; level++)
    for (let s = 0; s <= sectors; s++) {
      const a = (s / sectors) * Math.PI * 2,
        t = level / levels,
        radius = 99 - t;
      const x = Math.cos(a) * radius * 1.17,
        z = Math.sin(a) * radius * 0.83;
      const top = groundHeight(
        Math.cos(a) * 99 * 1.17,
        Math.sin(a) * 99 * 0.83,
      );
      positions.push(x, mix(top, -4.7, t), z);
      const c = shades[level];
      colors.push(c.r, c.g, c.b);
      if (level < levels && s < sectors) {
        const i = level * (sectors + 1) + s;
        indices.push(
          i,
          i + 1,
          i + sectors + 1,
          i + 1,
          i + sectors + 2,
          i + sectors + 1,
        );
      }
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  g.setIndex(indices);
  g.computeVertexNormals();
  return g;
}

function makeMountains() {
  const nx = 280,
    nz = 46,
    positions: number[] = [],
    colors: number[] = [],
    indices: number[] = [];
  const shades = [
    "#a68e71",
    "#b29a7c",
    "#998269",
    "#bba385",
    "#aa9275",
    "#c0a887",
  ].map((s) => new THREE.Color(s));
  for (let i = 0; i <= nx; i++)
    for (let j = 0; j <= nz; j++) {
      const t = i / nx,
        x = -92 + t * 173,
        q = (j / nz) * 2 - 1;
      const center = -34 - Math.sin(t * Math.PI) * 21 + Math.sin(t * 19) * 1.7;
      const width = 14 + Math.sin(t * 8) * 3 + Math.sin(t * 23) * 1.5;
      const z = center + q * width;
      const edge = Math.pow(Math.max(0, 1 - Math.abs(q)), 0.67);
      const peaks =
        19 +
        Math.sin(x * 0.24) * 4 +
        Math.sin(x * 0.47 + 1.2) * 3 +
        Math.sin(x * 0.075) * 6;
      const erosion =
        (Math.sin(x * 0.95 + q * 6) + Math.cos(x * 1.7 - q * 9)) * 0.8;
      const crest = Math.min(1, edge * 1.15);
      const h =
        (peaks + erosion * 3) *
        crest *
        smooth(t, 0, 0.055) *
        (1 - smooth(t, 0.945, 1));
      const y = groundHeight(x, z) + Math.max(0, h) + noise(x, z) * edge * 1.1;
      positions.push(x + Math.sin(j * 2 + i * 0.8) * 0.19 * edge, y, z);
      const layer =
        ((Math.floor(y / 1.35) % shades.length) + shades.length) %
        shades.length;
      const c = shades[layer].clone().multiplyScalar(0.96 + noise(x, z) * 0.08);
      colors.push(c.r, c.g, c.b);
      if (i < nx && j < nz) {
        const k = i * (nz + 1) + j;
        indices.push(k, k + 1, k + nz + 1, k + 1, k + nz + 2, k + nz + 1);
      }
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  g.setIndex(indices);
  g.computeVertexNormals();
  return g;
}

function rockGeometry(
  width: number,
  height: number,
  depth: number,
  seed: number,
) {
  const random = rng(seed),
    sides = 12,
    levels = 12,
    positions: number[] = [],
    colors: number[] = [],
    indices: number[] = [];
  const factors = Array.from({ length: sides }, () => 0.76 + random() * 0.34);
  const shades = ["#987a53", "#b39063", "#a5875f", "#b99a6c", "#a48a68"].map(
    (c) => new THREE.Color(c),
  );
  for (let j = 0; j <= levels; j++) {
    const t = j / levels,
      f =
        (0.15 + Math.pow(1 - t, 0.52) * 0.85) * (1 + Math.sin(j * 1.9) * 0.065);
    for (let i = 0; i <= sides; i++) {
      const a = (i / sides) * Math.PI * 2,
        k = i % sides;
      const x =
        Math.cos(a) * width * 0.5 * f * factors[k] +
        Math.sin(t * 2) * width * 0.09;
      const z = Math.sin(a) * depth * 0.5 * f * factors[k];
      const y = t * height + (j === 0 ? 0 : Math.sin(i * 2.3 + j * 0.7) * 0.3);
      positions.push(x, y, z);
      const color = shades[j % shades.length]
        .clone()
        .multiplyScalar(0.9 + random() * 0.16);
      colors.push(color.r, color.g, color.b);
      if (j < levels && i < sides) {
        const k2 = j * (sides + 1) + i;
        indices.push(
          k2,
          k2 + sides + 1,
          k2 + 1,
          k2 + 1,
          k2 + sides + 1,
          k2 + sides + 2,
        );
      }
    }
  }
  const top = positions.length / 3;
  positions.push(width * 0.08, height, 0);
  colors.push(0.6, 0.47, 0.32);
  for (let i = 0; i < sides; i++)
    indices.push(top, levels * (sides + 1) + i + 1, levels * (sides + 1) + i);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function makeCity(parent: THREE.Object3D) {
  const city = new THREE.Group();
  city.name = "Arrakeen — sandstone city";
  parent.add(city);
  const random = rng(42),
    blocks: number[][] = [],
    roofs: number[][] = [],
    windows: number[][] = [];
  for (let ix = 0; ix < 19; ix++)
    for (let iz = 0; iz < 13; iz++) {
      const x = -53 + ix * 2.7,
        z = -24 + iz * 2.5;
      if (
        Math.hypot((x + 26) / 1.3, z + 8) > 25 ||
        (x > -46 && x < -29 && z > -23 && z < -5) ||
        ix % 5 === 0 ||
        iz % 4 === 0 ||
        random() < 0.07
      )
        continue;
      const w = 1.5 + random() * 0.65,
        d = 1.4 + random() * 0.7,
        h = 1.1 + random() * 3.1,
        base = groundHeight(x, z);
      blocks.push([x, base + h / 2, z, w, h, d]);
      roofs.push([x, base + h + 0.13, z, w + 0.16, 0.26, d + 0.16]);
      for (let k = 0; k < Math.floor(h / 0.7); k++) {
        windows.push(
          [
            x - 0.38,
            base + 0.5 + k * 0.7,
            z + d * 0.5 + 0.01,
            0.17,
            0.24,
            0.025,
          ],
          [
            x + 0.38,
            base + 0.5 + k * 0.7,
            z + d * 0.5 + 0.01,
            0.17,
            0.24,
            0.025,
          ],
        );
      }
      if (random() > 0.79) {
        const dome = mesh(
          new THREE.SphereGeometry(
            w * 0.45,
            12,
            6,
            0,
            Math.PI * 2,
            0,
            Math.PI / 2,
          ),
          stone,
          "Domed rooftop",
          city,
          x,
          base + h + 0.22,
          z,
        );
        dome.scale.y = 0.6;
      }
    }
  batchBoxes("City buildings", stone, blocks, city);
  batchBoxes("Parapets", palaceStone, roofs, city);
  batchBoxes("Recessed windows", dark, windows, city);
  // Outer wall, bastions, and the sheltered rock apron.
  const wall: number[][] = [],
    bastions: number[][] = [];
  for (let i = 0; i < 25; i++) {
    const a = (i / 24) * Math.PI * 1.43 + 0.25,
      x = -26 + Math.cos(a) * 29,
      z = -8 + Math.sin(a) * 22;
    const nx = -26 + Math.cos(a + 0.18) * 29,
      nz = -8 + Math.sin(a + 0.18) * 22;
    wall.push([
      (x + nx) / 2,
      groundHeight(x, z) + 1.1,
      (z + nz) / 2,
      Math.hypot(nx - x, nz - z) + 0.2,
      2.2,
      0.75,
      -Math.atan2(nz - z, nx - x),
    ]);
    if (i % 3 === 0)
      bastions.push([x, groundHeight(x, z) + 1.9, z, 1.5, 3.8, 1.5]);
  }
  batchBoxes("City perimeter", stone, wall, city);
  batchBoxes("Wall towers", palaceStone, bastions, city);
}

function palm(parent: THREE.Object3D, x: number, z: number, seed: number) {
  const random = rng(seed),
    h = 3.1 + random() * 0.8,
    y = groundHeight(x, z) + 0.1;
  mesh(
    new THREE.CylinderGeometry(0.07, 0.13, h, 7),
    stone,
    "Date palm trunk",
    parent,
    x,
    y + h * 0.5,
    z,
  );
  const positions: number[] = [],
    indices: number[] = [];
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + random() * 0.4,
      len = 1 + random() * 0.5;
    const index = positions.length / 3;
    positions.push(
      x,
      y + h,
      z,
      x + Math.cos(a + 0.13) * len * 0.65,
      y + h + 0.25,
      z + Math.sin(a + 0.13) * len * 0.65,
      x + Math.cos(a) * len,
      y + h - 0.45,
      z + Math.sin(a) * len,
      x + Math.cos(a - 0.13) * len * 0.65,
      y + h + 0.25,
      z + Math.sin(a - 0.13) * len * 0.65,
    );
    indices.push(index, index + 1, index + 2, index, index + 2, index + 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  mesh(geo, foliage, "Date palm fronds", parent);
}

function makeResidence(parent: THREE.Object3D) {
  const p = new THREE.Group();
  p.name = "Atreides residence, courtyard, twenty palms and conservatory";
  parent.add(p);
  const x = -37,
    z = -15,
    y = 1.45;
  box(p, palaceStone, "Residence foundation", x, y + 0.3, z, 16, 0.6, 16);
  box(p, palaceStone, "Main residence", x, y + 3.2, z - 3.2, 13, 6.4, 7.5);
  box(p, stone, "Stepped rooftop", x, y + 6.6, z - 3.2, 10.5, 0.7, 6.1);
  box(p, palaceStone, "Upper keep", x, y + 7.8, z - 4.1, 7.4, 2.4, 4.2);
  box(p, stone, "Keep crown", x, y + 9.1, z - 4.1, 7.9, 0.28, 4.6);
  box(p, palaceStone, "West wing", x - 6.6, y + 2, z + 1.5, 2.7, 4, 9);
  box(p, palaceStone, "East wing", x + 6.6, y + 2, z + 1.5, 2.7, 4, 9);
  box(p, stone, "Courtyard paving", x, y + 0.38, z + 3.2, 11, 0.12, 6);
  const slots: number[][] = [];
  for (let i = 0; i < 12; i++)
    slots.push([x - 5.5 + i, y + 4.2, z + 0.56, 0.28, 1.8, 0.04]);
  for (let i = 0; i < 6; i++)
    slots.push([x - 3 + i * 1.2, y + 7.8, z - 1.98, 0.28, 0.9, 0.03]);
  batchBoxes("Residence window recesses", dark, slots, p);
  box(p, dark, "Entrance portal", x, y + 1.3, z + 0.62, 1.7, 2.7, 0.08);
  // Glass-roofed chamber is closed to the outside atmosphere.
  box(p, glass, "Sealed conservatory", x + 6, y + 4.5, z - 4, 2.8, 1, 4.5);
  for (let i = 0; i < 10; i++) {
    palm(p, x - 4.2, z + 0.6 + i * 0.57, 120 + i);
    palm(p, x + 4.2, z + 0.6 + i * 0.57, 140 + i);
  }
  // Atreides pennants.
  for (const side of [-1, 1]) {
    mesh(
      new THREE.CylinderGeometry(0.035, 0.035, 4, 6),
      dark,
      "Flagstaff",
      p,
      x + side * 6,
      y + 6,
      z - 4,
    );
    box(
      p,
      new THREE.MeshStandardMaterial({
        color: "#42514a",
        side: THREE.DoubleSide,
        roughness: 1,
      }),
      "Atreides pennant",
      x + side * 6 + 0.42,
      y + 7.3,
      z - 4,
      0.85,
      1.3,
      0.03,
    );
  }
}

export function makeOrnithopter(scale = 1) {
  const o = new THREE.Group();
  o.name = "Ornithopter";
  const body = mesh(
    new THREE.SphereGeometry(0.65, 12, 8),
    rust,
    "Fuselage",
    o,
    0,
    0,
    0,
  );
  body.scale.set(0.8, 0.65, 2.3);
  const cockpit = mesh(
    new THREE.SphereGeometry(0.45, 10, 6),
    glass,
    "Cockpit",
    o,
    0,
    0.26,
    0.85,
  );
  cockpit.scale.set(0.75, 0.55, 1.3);
  box(o, rust, "Tail boom", 0, 0, -1.8, 0.16, 0.15, 2);
  const wings = new THREE.Group();
  wings.name = "Wing assembly";
  o.add(wings);
  for (const side of [-1, 1])
    for (let j = 0; j < 2; j++) {
      const wing = box(
        wings,
        dark,
        "Articulated wing",
        side * 2.1,
        0.15,
        -0.45 + j * 0.95,
        3.8,
        0.045,
        0.37,
      );
      wing.rotation.y = side * (j === 0 ? 0.15 : -0.28);
      box(
        o,
        rust,
        "Landing strut",
        side * 0.55,
        -0.55,
        -0.45,
        0.06,
        0.75,
        0.08,
      );
      box(o, dark, "Landing foot", side * 0.55, -0.89, -0.2, 0.13, 0.05, 1.1);
    }
  o.scale.setScalar(scale);
  return o;
}
function makeSpaceport(parent: THREE.Object3D) {
  const g = new THREE.Group();
  g.name = "Arrakeen landing field";
  parent.add(g);
  box(
    g,
    new THREE.MeshStandardMaterial({ color: "#a48d6b", roughness: 1 }),
    "Landing field",
    -2,
    groundHeight(-2, 4) + 0.15,
    4,
    16,
    0.2,
    11,
  );
  const markings: number[][] = [];
  for (let i = 0; i < 5; i++)
    markings.push([-8 + i * 3.1, groundHeight(-2, 4) + 0.27, 4, 1, 0.02, 0.12]);
  batchBoxes("Landing markers", palaceStone, markings, g);
  for (let i = 0; i < 3; i++) {
    const o = makeOrnithopter(0.75);
    o.position.set(-6 + i * 4, groundHeight(-2, 4) + 1, 4);
    o.rotation.y = Math.PI * 0.8;
    g.add(o);
  }
  box(g, stone, "Flight operations", -3, 2.5, -3, 10, 3, 3);
  box(g, stone, "Control tower", 5, 4.5, -3, 1.8, 6.5, 1.8);
  box(g, glass, "Tower observation", 5, 7.7, -3, 2.3, 0.8, 2.3);
}
function makeHarvester(parent: THREE.Object3D) {
  const g = new THREE.Group();
  g.name = "Spice crawler and carryall";
  g.position.set(43, groundHeight(43, 24), 24);
  g.rotation.y = 0.3;
  parent.add(g);
  box(g, rust, "Crawler body", 0, 1.3, 0, 4.8, 1.4, 7);
  box(g, stone, "Upper processing housing", 0, 2.35, -0.8, 3, 1, 3.5);
  box(g, glass, "Operator cab", 0, 2.7, 2.1, 2.1, 0.8, 1.1);
  for (const side of [-1, 1]) {
    box(g, dark, "Crawler tracks", side * 2.6, 0.75, 0, 0.8, 1.4, 7.5);
    for (let i = 0; i < 9; i++)
      box(
        g,
        rust,
        "Track plate",
        side * 2.6,
        1.48,
        -3.4 + i * 0.85,
        0.85,
        0.08,
        0.5,
      );
  }
  box(g, rust, "Harvest intake", 0, 0.5, 4.1, 5.8, 0.6, 1.5);
  for (let i = 0; i < 5; i++)
    mesh(
      new THREE.CylinderGeometry(0.11, 0.11, 1.3, 6),
      rust,
      "Vent stack",
      g,
      -0.9 + i * 0.45,
      3.4,
      -1.5,
    );
  const carryall = new THREE.Group();
  carryall.name = "Carryall";
  carryall.position.set(13, 15, -5);
  g.add(carryall);
  const body = mesh(
    new THREE.SphereGeometry(1, 12, 8),
    rust,
    "Carryall hull",
    carryall,
  );
  body.scale.set(1.5, 1, 3.3);
  for (const side of [-1, 1]) {
    box(carryall, rust, "Lift outrigger", side * 3.1, 0, 0, 4.5, 0.3, 0.8);
    mesh(
      new THREE.CylinderGeometry(1.4, 1.3, 0.35, 16),
      dark,
      "Lift fan",
      carryall,
      side * 4.5,
      0,
      0,
    );
    box(carryall, dark, "Suspension leg", side * 1.2, -1.3, 0, 0.15, 1.5, 0.15);
  }
}

export function createLandscape() {
  const root = new THREE.Group();
  root.name = "Arrakis — The Atreides Arrival";
  root.userData = {
    description:
      "An artistic interpretation of Arrakis in Book I of Dune. Spatial relationships and scale are illustrative, not a canonical map.",
    author: "Arrakis Atlas",
    units: "illustrative model units",
  };
  mesh(
    makeTerrain(),
    new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.98 }),
    "Sculpted dune terrain",
    root,
  );
  mesh(
    makeBedrock(),
    new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 }),
    "Cutaway bedrock strata",
    root,
  );
  const lowerGeo = new THREE.CylinderGeometry(98, 97.2, 0.7, 180);
  lowerGeo.scale(1.17, 1, 0.83);
  mesh(
    lowerGeo,
    new THREE.MeshStandardMaterial({ color: "#443a2c", roughness: 1 }),
    "Basal rock layer",
    root,
    0,
    -5.05,
    0,
  );
  const random = rng(819),
    rockMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 1,
      flatShading: true,
    });
  mesh(
    makeMountains(),
    new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 }),
    "Shield Wall — stratified mountain barrier",
    root,
  );
  const scatter: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 65; i++) {
    const x = (random() - 0.5) * 190,
      z = (random() - 0.5) * 122;
    if (Math.hypot((x + 22) / 1.2, z + 8) < 36 || z < -23) continue;
    const rock = rockGeometry(
      1 + random() * 4,
      0.7 + random() * 2,
      1.3 + random() * 3,
      600 + i,
    );
    rock.translate(x, groundHeight(x, z) - 0.15, z);
    scatter.push(rock);
  }
  mesh(mergeGeometries(scatter), rockMat, "Desert rock outcrops", root);
  scatter.forEach((g) => g.dispose());
  makeCity(root);
  makeResidence(root);
  makeSpaceport(root);
  makeHarvester(root);
  const flight = makeOrnithopter(1.1);
  flight.name = "Survey ornithopter";
  flight.position.set(14, 18, 18);
  flight.rotation.y = -0.8;
  root.add(flight);
  return { root, flight };
}

function noise3(x: number, y: number, z: number) {
  const ix = Math.floor(x),
    iy = Math.floor(y),
    iz = Math.floor(z);
  const fx = x - ix,
    fy = y - iy,
    fz = z - iz;
  const ux = fx * fx * (3 - 2 * fx),
    uy = fy * fy * (3 - 2 * fy),
    uz = fz * fz * (3 - 2 * fz);
  function hash(a: number, b: number, c: number) {
    const n = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453;
    return n - Math.floor(n);
  }
  const v0 = mix(
    mix(hash(ix, iy, iz), hash(ix + 1, iy, iz), ux),
    mix(hash(ix, iy + 1, iz), hash(ix + 1, iy + 1, iz), ux),
    uy,
  );
  const v1 = mix(
    mix(hash(ix, iy, iz + 1), hash(ix + 1, iy, iz + 1), ux),
    mix(hash(ix, iy + 1, iz + 1), hash(ix + 1, iy + 1, iz + 1), ux),
    uy,
  );
  return mix(v0, v1, uz);
}
function fbm3(x: number, y: number, z: number) {
  let n = 0,
    amp = 0.55;
  for (let i = 0; i < 5; i++) {
    n += noise3(x, y, z) * amp;
    x = x * 2.05 + 17.3;
    y = y * 2.05 + 9.2;
    z = z * 2.05 + 4.7;
    amp *= 0.48;
  }
  return n;
}
export function createPlanet() {
  const group = new THREE.Group();
  group.name = "Arrakis — orbital interpretation";
  const geometry = new THREE.SphereGeometry(50, 240, 160),
    p = geometry.attributes.position,
    colors: number[] = [];
  const rock = new THREE.Color("#776147"),
    sand = new THREE.Color("#d1b58a"),
    dust = new THREE.Color("#b49469");
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i) / 50,
      y = p.getY(i) / 50,
      z = p.getZ(i) / 50;
    const broad = fbm3(x * 3.5 + 12, y * 3.5, z * 3.5),
      detail = noise3(x * 75, y * 75, z * 75);
    const ridge = 1 - Math.abs(noise3(x * 26 + 4, y * 26, z * 26) * 2 - 1);
    const n = smooth(broad, 0.32, 0.68);
    const color = rock
      .clone()
      .lerp(sand, n)
      .lerp(dust, detail * 0.16)
      .multiplyScalar(0.87 + detail * 0.2 + ridge * 0.05);
    const h = 50 + (broad - 0.5) * 0.38 + ridge * 0.05;
    p.setXYZ(i, x * h, y * h, z * h);
    colors.push(color.r, color.g, color.b);
  }
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  const normals = geometry.attributes.normal;
  const direction = new THREE.Vector3();
  for (let i = 0; i < normals.count; i++) {
    direction.fromBufferAttribute(normals, i);
    if (direction.lengthSq() < 0.001)
      direction.fromBufferAttribute(p, i).normalize();
    else direction.normalize();
    normals.setXYZ(i, direction.x, direction.y, direction.z);
  }
  mesh(
    geometry,
    new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 }),
    "Arrakis planetary surface",
    group,
  );
  const ring = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(
      Array.from(
        { length: 181 },
        (_, i) =>
          new THREE.Vector3(
            Math.cos((i / 180) * Math.PI * 2) * 79,
            0,
            Math.sin((i / 180) * Math.PI * 2) * 79,
          ),
      ),
    ),
    new THREE.LineBasicMaterial({
      color: "#8f7855",
      transparent: true,
      opacity: 0.22,
    }),
  );
  ring.rotation.z = 0.32;
  ring.name = "Orbital guide";
  group.add(ring);
  for (let i = 0; i < 2; i++) {
    const geo = new THREE.IcosahedronGeometry(i === 0 ? 4.2 : 2.6, 3);
    const moon = mesh(
      geo,
      new THREE.MeshStandardMaterial({
        color: i === 0 ? "#978c76" : "#b8aa90",
        roughness: 1,
        flatShading: true,
      }),
      i === 0 ? "First moon" : "Second moon",
      group,
      i === 0 ? -75 : 77,
      i === 0 ? 28 : -17,
      i === 0 ? 25 : 22,
    );
    moon.rotation.set(0.5, 0.3, 0.9);
  }
  return group;
}
