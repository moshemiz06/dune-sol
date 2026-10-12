import { locations } from "./locations";
import { icon } from "./icons";
const placeIcons = ["city", "palace", "mountain", "spice", "aircraft"];
export function mountLayout(app: HTMLElement) {
  app.innerHTML = `
<div class="app-shell">
  <header class="header">
    <a class="brand" href="/" aria-label="Arrakis Atlas home">
      <svg class="brand-symbol" viewBox="0 0 38 43" fill="none" aria-hidden="true"><path d="M3 35 19 6l16 29M9.5 25h19" stroke="currentColor" stroke-width="1.3"/><path d="M12 35h14" stroke="currentColor" stroke-width="1"/><circle cx="19" cy="39" r="1.3" fill="currentColor"/></svg>
      <div><div class="brand-name">ARRAKIS</div><div class="brand-subtitle">AN EXPLORATION OF DUNE</div></div>
    </a>
    <nav class="top-nav" aria-label="Atlas actions">
      <span>INTERACTIVE PLANETARY ATLAS</span>
      <button class="about-btn" id="about-btn" title="About this atlas">${icon("info", 16)}<span class="about-label">About the atlas</span></button>
      <button class="export-btn" id="export-btn">${icon("download", 15)}Download model</button>
    </nav>
  </header>
  <main class="main">
    <aside class="sidebar">
      <div class="eyebrow"><span class="line"></span>IMPERIAL SURVEY · 01</div>
      <h1>The desert<br><em>planet.</em></h1>
      <p class="intro">A world of sand. A wealth of spice.<br>Explore Arrakis at the arrival of House Atreides, before the journey into the deep desert.</p>
      <div class="chapter-tag"><i></i>BOOK I · THE ATREIDES ARRIVAL</div>
      <div class="places-title"><span>EXPLORE THE LANDSCAPE</span><span>05 LOCATIONS</span></div>
      <nav class="places" aria-label="Arrakis locations">${locations.map((l, i) => `<button class="place ${i === 0 ? "active" : ""}" data-location="${l.id}" aria-label="${l.name}" aria-pressed="${i === 0}"><span class="place-number">${l.number}</span><span class="place-icon">${icon(placeIcons[i], 20)}</span><span class="place-text">${l.name}</span><span class="place-arrow">${icon("chevron", 14)}</span></button>`).join("")}</nav>
      <div class="sidebar-foot">${icon("layers", 17)}<div><strong>One world. Many perspectives.</strong><br>Choose a location to get a closer look.</div></div>
    </aside>
    <section class="viewer" id="viewer" aria-label="Interactive 3D Arrakis landscape">
      <div class="scene" id="scene"><div class="loader" id="loader"><span class="loader-orbit"></span>CHARTING ARRAKIS</div></div>
      <div class="viewer-top">
        <div class="mode-switch" role="group" aria-label="Model view"><button class="active" data-mode="landscape" aria-pressed="true">${icon("layers", 16)}Landscape</button><button data-mode="planet" aria-pressed="false">${icon("globe", 16)}Orbital view</button></div>
        <div class="time-control"><span>LIGHT</span><div class="time-options" role="group" aria-label="Lighting"><button data-time="dawn" title="Dawn light" aria-label="Dawn light" aria-pressed="false">${icon("sunrise", 17)}</button><button data-time="day" class="active" title="Daylight" aria-label="Daylight" aria-pressed="true">${icon("sun", 17)}</button><button data-time="dusk" title="Dusk light" aria-label="Dusk light" aria-pressed="false">${icon("moon", 17)}</button></div></div>
      </div>
      <div class="stage-meta" id="stage-meta">NORTHERN HEMISPHERE<br><b>ARRAKEEN & SURROUNDING DESERT</b></div>
      <div class="compass" aria-hidden="true"><span class="north">N</span><span class="needle" id="compass-needle"></span></div>
      <div class="landmark-labels" id="labels">${locations.map((l, i) => `<button class="landmark ${i === 0 ? "active" : ""}" data-landmark="${l.id}" aria-label="Explore ${l.name}"><span class="dot"></span>${l.id === "residence" ? "Atreides residence" : l.id === "spaceport" ? "Landing field" : l.id === "spice" ? "Spice crawler" : l.name}</button>`).join("")}</div>
      <div class="scene-center-caption" aria-hidden="true">The open desert<small>SPICE COUNTRY</small></div>
      <div class="scene-controls">
        <div class="control-group"><button id="zoom-in" aria-label="Zoom in" title="Zoom in (+)">${icon("plus", 18)}</button><button id="zoom-out" aria-label="Zoom out" title="Zoom out (−)">${icon("minus", 18)}</button></div>
        <div class="control-group"><button id="reset" aria-label="Reset view" title="Reset view (R)">${icon("fit", 18)}</button><button id="fullscreen" aria-label="Full screen" title="Full screen">${icon("fullscreen", 17)}</button></div>
      </div>
      <div class="viewer-bottom">
        <article class="info-card" aria-live="polite" id="info-card"></article>
        <div class="minimap" aria-hidden="true"><div class="map-frame"><svg viewBox="0 0 140 100" fill="none"><path d="M10 53C15 27 36 19 57 22c30-12 62 6 72 25-5 30-35 44-64 36C40 89 15 76 10 53Z" stroke="#9c927055" stroke-width=".7"/><path d="M17 45C30 21 55 33 72 27c25-3 44 9 46 23M20 47C37 27 56 36 74 31c22 0 34 6 40 17M25 48c11-10 26-14 46-12 18-1 27 4 35 12" stroke="#b6a17766" stroke-width=".8"/><path d="M36 46h27v17H36z" stroke="#a5a18055" stroke-dasharray="1 2"/><path d="M28 71c23-8 41 6 66-2m-68 7c24-7 44 5 69-2M74 55c23-3 28 10 40 7M77 60c18-3 22 9 34 7" stroke="#c0ac6e30" stroke-width=".6"/><path d="M17 10v8m-4-4h8" stroke="#b6a17755" stroke-width=".6"/><text x="119" y="15" fill="#939979" font-size="5" font-family="sans-serif">N</text><path d="m119 20 2 5h-4l2-5Z" fill="#a3a07a"/><circle id="map-marker" cx="49" cy="52" r="2.3" fill="#dbb27c"/><circle id="map-halo" cx="49" cy="52" r="6" stroke="#dbb27c55" stroke-width=".8"/><path d="M96 90h23m-23-2v4m23-4v4" stroke="#9d9e7755" stroke-width=".7"/></svg></div><div class="map-caption"><span>REGION OVERVIEW</span><span>↗</span></div></div>
      </div>
      <div class="viewer-toolbar"><div class="interaction-hint">${icon("rotate", 15)}<span>Drag to orbit</span><span class="divider">/</span><span class="scroll-hint">Scroll to explore</span></div><div class="toolbar-buttons"><button id="labels-toggle" class="active" aria-pressed="true">${icon("pin", 14)}Labels</button><button id="orbit-toggle" aria-pressed="false">${icon("play", 13)}Auto orbit</button></div></div>
    </section>
  </main>
  <footer class="footer"><span>INSPIRED BY <span class="book">FRANK HERBERT’S DUNE</span> <em>·</em> 1965</span><div class="footer-right"><span><i class="live-dot"></i>ARTISTIC INTERPRETATION</span><span>GEOGRAPHY & SCALE ARE ILLUSTRATIVE</span></div></footer>
</div>
<dialog id="about-dialog" aria-labelledby="about-title"><button class="dialog-close" data-close aria-label="Close about dialog">${icon("close", 20)}</button><span class="dialog-kicker">NOTES FROM THE CARTOGRAPHER</span><h2 id="about-title">A world, before the journey.</h2><p>This atlas imagines Arrakis during the opening of Frank Herbert’s <i>Dune</i>, before Paul and Jessica escape into the desert. Its five locations explore the setting already introduced in that part of the story.</p><p>The Shield Wall is a natural mountain range. The residence includes twenty date palms and a sealed conservatory. In the open desert, a spice crawler works beneath a waiting carryall.</p><p>The architecture, terrain, planetary surface, distances, and arrangement are artistic interpretations. This is a regional diorama and a conceptual globe, not a canonical or scientifically scaled map.</p><div class="dialog-separator"></div><div class="keyboard-guide"><span><kbd>1–5</kbd>Explore a location</span><span><kbd>R</kbd>Reset camera</span><span><kbd>+</kbd><kbd>−</kbd>Zoom</span><span><kbd>L</kbd>Toggle labels</span></div><div class="sources"><a href="https://dune.fandom.com/wiki/Arrakeen_governor%27s_palace" target="_blank" rel="noopener noreferrer">Residency reference ↗</a><a href="https://dune.fandom.com/wiki/Date_Palm" target="_blank" rel="noopener noreferrer">Date palm reference ↗</a></div><p style="font-size:9px;margin-bottom:0">External reference pages may discuss events beyond this atlas’s reading cutoff.</p></dialog>
<dialog id="export-dialog" aria-labelledby="export-title"><button class="dialog-close" data-close aria-label="Close download dialog">${icon("close", 20)}</button><span class="dialog-kicker">TAKE THE WORLD WITH YOU</span><h2 id="export-title">Download Arrakis.</h2><p>Choose a model in GLB format, with geometry and materials included. Open it in Blender, a 3D viewer, or any compatible design tool.</p><div class="export-options"><a href="/models/arrakis-landscape.glb" download="arrakis-landscape.glb">${icon("layers", 22)}<span>Northern landscape</span><small>Dunes, city, mountains & aircraft</small></a><a href="/models/arrakis-planet.glb" download="arrakis-planet.glb">${icon("globe", 22)}<span>Arrakis & its moons</span><small>Conceptual planetary model</small></a></div><p style="font-size:9px;margin-bottom:0">These models use illustrative scale and are original interpretations of the novel’s setting.</p></dialog>
<div class="toast" role="status" id="toast"></div>`;
}
