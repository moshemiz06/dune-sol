export const icons: Record<string, string> = {
  globe:
    '<circle cx="12" cy="12" r="8.5"/><ellipse cx="12" cy="12" rx="3.7" ry="8.5"/><path d="M3.5 12h17"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5"/>',
  arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  chevron: '<path d="m9 6 6 6-6 6"/>',
  down: '<path d="m7 10 5 5 5-5"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4 19 5"/>',
  moon: '<path d="M20.5 13a8.5 8.5 0 0 1-9.5-9.5A8.5 8.5 0 1 0 20.5 13Z"/>',
  sunrise:
    '<path d="M3 17h18M5 21h14M12 3v4M4 8l3 3m13-3-3 3m-9 6a4 4 0 0 1 8 0"/>',
  rotate: '<path d="M20 8a8.5 8.5 0 1 0 .4 7M20 3v5h-5"/>',
  pin: '<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2"/>',
  fit: '<path d="M4 9V4h5m6 0h5v5M4 15v5h5m6 0h5v-5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.1"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  play: '<path d="m9 5 11 7-11 7V5Z"/>',
  pause: '<path d="M8 5v14M16 5v14"/>',
  mountain: '<path d="m2 20 8-14 4 7 3-5 5 12H2ZM7 11l3 2 2-2"/>',
  city: '<path d="M3 21V8h6v13m0-17h8v17m0-10h4v10M1 21h22M5 12h1m-1 4h1m6-9h2m-2 4h2m-2 4h2"/>',
  palace:
    '<path d="M3 21V9l4-3 5 3 5-3 4 3v12M3 13h18M9 21v-5h6v5M7 3v3m10-3v3"/>',
  spice: '<path d="M3 16h18v4H3zm2 0V9h14v7M8 9V5h8v4M7 20v2m10-2v2M9 12h6"/>',
  aircraft: '<path d="m12 3 2 7 8 4v2l-8-1v5l-2 2-2-2v-5l-8 1v-2l8-4 2-7Z"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  fullscreen: '<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',
};
export function icon(name: string, size = 20) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] ?? icons.info}</svg>`;
}
