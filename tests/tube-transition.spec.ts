import { test, expect } from "@playwright/test";

test("link clicks power the screen off, change route, then power it back on", async ({ page }) => {
  await page.goto("/");
  const veil = page.locator(".tube-veil");
  await expect(veil).toBeHidden();

  await page.getByRole("link", { name: "shop", exact: true }).click();
  await expect(veil).toHaveAttribute("data-open", "");
  await expect(page).toHaveURL(/\/shop$/);
  await expect(veil).toBeHidden({ timeout: 5000 });
  await expect(page.locator("main h1")).toBeVisible();

  // Same-path link (no route change) must not trigger the transition.
  await page.getByRole("link", { name: "shop", exact: true }).click();
  await expect(veil).toBeHidden();
});

test("modified clicks and reduced motion skip the transition", async ({ page, browser }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "stg", exact: true }).click({ modifiers: ["Shift"] }).catch(() => {});
  await expect(page.locator(".tube-veil")).toBeHidden();

  const quiet = await browser.newContext({ reducedMotion: "reduce" });
  const calm = await quiet.newPage();
  await calm.goto("http://localhost:3001/");
  await calm.getByRole("link", { name: "stg", exact: true }).click();
  await expect(calm).toHaveURL(/\/stg$/);
  await expect(calm.locator(".tube-veil")).toBeHidden();
  await quiet.close();
});

test("product photo glitches on open and settles with no leftover strips", async ({ page }) => {
  await page.goto("/shop");
  await page.getByRole("button", { name: "Ver Bolsa reconstruída", exact: true }).click();
  await expect(page.locator(".glitch-strips")).toBeVisible();
  await expect(page.locator(".glitch-strips")).toHaveCount(0, { timeout: 3000 });
  await expect(page.locator(".detail-image img")).toBeVisible();
});
