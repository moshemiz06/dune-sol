import { readFile, writeFile } from "node:fs/promises";
import { build } from "esbuild";

const bundle = await build({
  entryPoints: ["src/world.ts"],
  bundle: true,
  external: ["three", "three/*"],
  format: "iife",
  globalName: "ArrakisWorld",
  minify: true,
  write: false,
});
const template = await readFile("scripts/inline-viewer.template.html", "utf8");
if (!template.includes("{{ARRAKIS_WORLD}}"))
  throw new Error("Viewer template is missing its geometry placeholder.");
const html = template.replace("{{ARRAKIS_WORLD}}", bundle.outputFiles[0].text);
await writeFile("public/arrakis-viewer.html", html);
console.log(
  `arrakis-viewer.html · ${(Buffer.byteLength(html) / 1024).toFixed(1)} KB`,
);
