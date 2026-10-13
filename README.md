# Arrakis — A Dune Atlas

An interactive 3D interpretation of Arrakis during the opening of Frank Herbert’s *Dune*, before Paul and Jessica’s escape into the desert.

[Open the live atlas](https://moshemiz06.github.io/dune-sol/). GitHub Pages automatically rebuilds and publishes the site when changes land on `main`.

Explore Arrakeen, the Atreides residence, the natural Shield Wall, a spice crawler with its carryall, and the city’s landing field. A separate orbital view includes Arrakis and both moons. Architecture, spatial arrangement, planetary markings, and scale are illustrative.

## Run locally

Requires Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev
```

Open the URL printed by Vite. Drag to orbit, scroll or pinch to zoom, and select a location to move the camera. Lighting, labels, automatic orbit, and full screen have their own controls. Keyboard shortcuts: **1–5** select a location, **R** resets the view, **L** toggles labels, and **+/−** zoom.

## 3D files

The standalone GLB files contain their geometry and materials and can be imported into Blender or another glTF 2.0 viewer:

- [Northern landscape](public/models/arrakis-landscape.glb)
- [Arrakis and its moons](public/models/arrakis-planet.glb)

Regenerate them from the shared procedural scene:

```sh
npm run export:all
```

The regional landscape includes twenty date palms and a sealed conservatory at the residence. Viewer overlays, camera controls, survey grids, and the orbital guide are excluded from the downloaded models. The files are intended for 3D viewing, rather than manufacturing or print.

## Build and verify

```sh
npm run build
npm run test:models
npx playwright install chromium
npm run test:browser
```

Model checks load both GLBs, verify finite geometry and meaningful 3D bounds, confirm both moons, and check the residence’s twenty palms and terrain normals. Browser checks exercise the five locations, view and lighting controls, keyboard navigation, dialogs, file downloads, and mobile layout.

## Structure

- `src/world.ts`: deterministic terrain and geometry shared by the viewer and exporter.
- `src/locations.ts`: location metadata and book context, kept within the reading cutoff.
- `src/layout.ts`: accessible interface markup.
- `src/main.ts`: rendering, camera navigation, lighting, and interaction state.
- `src/style.css`: responsive interface and self-hosted fonts.
- `scripts/export-model.ts`: standalone GLB generation.
- `scripts/export-inline.ts`: builds the standalone HTML preview from the same geometry source.

The standalone `public/arrakis-viewer.html` preview loads Three.js from a CDN and requires an internet connection. The main app serves its dependencies locally, and the GLB models have no external dependencies.

The interface lists its reference pages in **About the atlas**. External reference pages can contain later-book spoilers. This is an original fan interpretation, not an official Dune map or asset.
