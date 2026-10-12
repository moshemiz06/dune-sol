import { test, expect } from "@playwright/test";

test("Explore every location, change views and lighting, and download both models", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto("/");
  await expect(page.locator("#scene canvas")).toBeVisible();
  await expect(page.locator("#loader")).toHaveCount(0, { timeout: 15_000 });
  for (const name of [
    "Arrakeen",
    "Atreides residence",
    "The Shield Wall",
    "Spice harvesting",
    "Arrakeen landing field",
  ]) {
    await page.getByRole("button", { name, exact: true }).click();
    await expect(page.locator("#info-card h2")).toHaveText(name);
    await expect(
      page.getByRole("button", { name, exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
  }
  await page.getByRole("button", { name: "A moment from the book" }).click();
  await expect(page.locator(".story-note")).toBeVisible();
  await page.getByRole("button", { name: "Dawn light", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Dawn light", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Dusk light", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Dusk light", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Orbital view", exact: true }).click();
  await expect(page.locator("#viewer")).toHaveClass(/planet/);
  await expect(page.locator("#info-card h2")).toHaveText("A world of sand.");
  await expect(
    page.getByRole("button", { name: "Labels", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Landscape", exact: true }).click();
  await page.keyboard.press("2");
  await expect(page.locator("#info-card h2")).toHaveText("Atreides residence");
  await page.keyboard.press("l");
  await expect(page.locator("#labels")).toBeHidden();
  await page.keyboard.press("l");
  await expect(page.locator("#labels")).toBeVisible();
  await page.getByRole("button", { name: "Auto orbit", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Auto orbit", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Auto orbit", exact: true }).click();
  await page.getByRole("button", { name: "Zoom in", exact: true }).click();
  await page.getByRole("button", { name: "Reset view", exact: true }).click();
  await page.getByRole("button", { name: "About the atlas" }).click();
  await expect(
    page.getByRole("dialog", { name: "A world, before the journey." }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "Download model", exact: true })
    .click();
  for (const [label, filename] of [
    ["Northern landscape", "arrakis-landscape.glb"],
    ["Arrakis & its moons", "arrakis-planet.glb"],
  ]) {
    const pending = page.waitForEvent("download");
    await page.getByRole("link", { name: new RegExp(label) }).click();
    const download = await pending;
    expect(download.suggestedFilename()).toBe(filename);
    expect(await download.failure()).toBeNull();
  }
  await page.keyboard.press("Escape");
  expect(errors).toEqual([]);
});

test("Mobile controls remain reachable without horizontal page overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator("#loader")).toHaveCount(0, { timeout: 15_000 });
  const spice = page.getByRole("button", {
    name: "Spice harvesting",
    exact: true,
  });
  await spice.scrollIntoViewIfNeeded();
  await spice.click();
  await expect(page.locator("#info-card h2")).toHaveText("Spice harvesting");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Orbital view", exact: true }).click();
  await expect(page.locator("#info-card h2")).toHaveText("A world of sand.");
  await page.getByRole("button", { name: "Landscape", exact: true }).click();
  await page.getByRole("button", { name: "Reset view", exact: true }).click();
  await expect(page.locator("#info-card h2")).toHaveText("Spice harvesting");
});
