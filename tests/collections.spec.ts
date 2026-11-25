import { test, expect } from "@playwright/test";


test("collections: banner, navigation, shop and shared cart", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const response = await page.goto("/colecoes");
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle("Coleções — STG Studio™");
  await expect(page.getByRole("heading", { name: "COLEÇÕES", exact: true })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Navegação principal" }).getByRole("link", { name: "coleções" })).toHaveAttribute("aria-current", "page");
  await expect(page.locator(".skip-link")).toHaveAttribute("href", "#collections-main");
  const banner = page.locator(".collection-entry-banner img");
  await expect.poll(() => banner.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  await expect(page.locator(".collection-entry")).toHaveCount(1);
  await expect(page.locator("canvas")).toHaveCount(0);
  await page.screenshot({ path: "/tmp/stg-collections-desktop.png", fullPage: true });
  await page.getByRole("link", { name: "COLLECTION #001 VER PEÇAS" }).click();
  await expect(page).toHaveURL("http://localhost:3001/shop");
  await expect(page.locator(".shop-product")).toHaveCount(5);
  await page.getByRole("button", { name: "Ver Denim rework", exact: true }).click();
  await page.getByRole("button", { name: "ADICIONAR À SELEÇÃO" }).click();
  await page.getByRole("button", { name: "Fechar painel" }).click();
  await page.getByRole("navigation", { name: "Navegação principal" }).getByRole("link", { name: "coleções" }).click();
  await expect(page.locator(".collection-entry")).toBeVisible();
  await page.locator(".cart-link").click();
  await expect(page.locator(".saved-item")).toHaveCount(1);
  await expect(page.getByRole("link", { name: "CONCLUIR COMPRA" })).toHaveAttribute("href", /^https:\/\/wa\.me\/5583996958338\?text=/);
  expect(errors).toEqual([]);
});

test("collections: mobile menu, responsive banner and reduced motion", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/shop");
  await page.getByRole("button", { name: "Abrir menu" }).click();
  await page.getByRole("navigation", { name: "Navegação mobile" }).getByRole("link", { name: "coleções" }).click();
  await expect(page).toHaveURL("http://localhost:3001/colecoes");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.getByRole("button", { name: "Abrir menu" }).click();
  await expect(page.getByRole("navigation", { name: "Navegação mobile" }).getByRole("link", { name: "coleções" })).toHaveAttribute("aria-current", "page");
  await page.getByRole("button", { name: "Fechar painel" }).click();
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    const banner = await page.locator(".collection-entry-banner").boundingBox();
    const header = await page.locator(".site-header").boundingBox();
    expect(banner!.y).toBeGreaterThan(header!.y + header!.height);
    await expect(page.getByRole("heading", { name: "COLLECTION #001" })).toBeVisible();
    await expect(page.locator(".collection-entry-action")).toBeVisible();
    if (width === 390) await page.screenshot({ path: "/tmp/stg-collections-mobile.png", fullPage: true });
  }
  await page.getByRole("link", { name: "COLLECTION #001 VER PEÇAS" }).click();
  await expect(page.locator(".shop-product")).toHaveCount(5);
});

test("collections: banner and shop link work without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("http://localhost:3001/colecoes");
  await expect(page.getByRole("heading", { name: "COLEÇÕES", exact: true })).toBeVisible();
  await expect(page.locator(".collection-entry-banner img")).toBeVisible();
  await page.getByRole("link", { name: "COLLECTION #001 VER PEÇAS" }).click();
  await expect(page).toHaveURL("http://localhost:3001/shop");
  await context.close();
});
