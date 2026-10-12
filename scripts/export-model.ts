import { writeFile, mkdir } from "node:fs/promises";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";
import { createLandscape, createPlanet } from "../src/world.ts";

// GLTFExporter uses browser FileReader for its binary payload. Node's Blob
// provides the same bytes; this adapter also preserves the asynchronous event.
class NodeFileReader {
  result: ArrayBuffer | string | null = null;
  onloadend: (() => void) | null = null;
  onerror: ((error: unknown) => void) | null = null;
  async readAsArrayBuffer(blob: Blob) {
    try {
      this.result = await blob.arrayBuffer();
      this.onloadend?.();
    } catch (error) {
      this.onerror?.(error);
    }
  }
  async readAsDataURL(blob: Blob) {
    try {
      this.result = `data:${blob.type};base64,${Buffer.from(await blob.arrayBuffer()).toString("base64")}`;
      this.onloadend?.();
    } catch (error) {
      this.onerror?.(error);
    }
  }
}
Object.assign(globalThis, { FileReader: NodeFileReader });
await mkdir("public/models", { recursive: true });
const exporter = new GLTFExporter();
for (const [filename, model] of [
  ["arrakis-landscape", createLandscape().root],
  ["arrakis-planet", createPlanet()],
] as const) {
  // Survey guides belong to the viewer, not to the physical model.
  model.getObjectByName("Orbital guide")?.removeFromParent();
  model.updateMatrixWorld(true);
  const data = await exporter.parseAsync(model, {
    binary: true,
    onlyVisible: true,
  });
  if (!(data instanceof ArrayBuffer)) throw new Error("Expected a binary GLB.");
  await writeFile(`public/models/${filename}.glb`, Buffer.from(data));
  console.log(
    `${filename}.glb · ${(data.byteLength / 1024 / 1024).toFixed(2)} MB`,
  );
}
