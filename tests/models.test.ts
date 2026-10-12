import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { Box3, Mesh, Vector3 } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { createLandscape } from "../src/world.ts";

for (const name of ["arrakis-landscape", "arrakis-planet"]) {
  test(`${name} is a complete, loadable GLB with finite geometry`, async () => {
    const file = await readFile(`public/models/${name}.glb`);
    assert.equal(file.readUInt32LE(0), 0x46546c67, "GLB magic");
    assert.equal(file.readUInt32LE(4), 2, "glTF 2.0");
    assert.equal(file.readUInt32LE(8), file.length, "Complete binary payload");
    const gltf = await new GLTFLoader().parseAsync(
      file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength),
      "",
    );
    let meshes = 0,
      vertices = 0;
    gltf.scene.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      meshes++;
      const position = object.geometry.attributes.position;
      vertices += position.count;
      for (const value of position.array)
        assert.ok(
          Number.isFinite(value),
          `${object.name} has a nonfinite vertex`,
        );
      const normal = object.geometry.attributes.normal;
      if (normal)
        for (const value of normal.array)
          assert.ok(
            Number.isFinite(value),
            `${object.name} has a nonfinite normal`,
          );
    });
    assert.ok(meshes >= 3);
    assert.ok(vertices > 20_000);
    const size = new Box3().setFromObject(gltf.scene).getSize(new Vector3());
    assert.ok(
      size.x > 90 && size.y > 20 && size.z > 90,
      "Model has meaningful extent in three dimensions",
    );
    if (name === "arrakis-planet") {
      assert.ok(gltf.scene.getObjectByName("First_moon"));
      assert.ok(gltf.scene.getObjectByName("Second_moon"));
      assert.equal(
        gltf.scene.getObjectByName("Orbital_guide"),
        undefined,
        "Viewer guide is excluded from model",
      );
    }
  });
}

test("Residency has twenty date palms and the terrain faces upward", () => {
  const { root } = createLandscape();
  let trunks = 0;
  root.traverse((object) => {
    if (object.name === "Date palm trunk") trunks++;
  });
  assert.equal(trunks, 20);
  assert.ok(root.getObjectByName("Sealed conservatory"));
  const terrain = root.getObjectByName("Sculpted dune terrain") as Mesh;
  const normals = terrain.geometry.attributes.normal;
  for (let i = 0; i < normals.count; i++)
    assert.ok(
      normals.getY(i) > 0,
      `Terrain vertex ${i} faces away from the surface`,
    );
});
