import { test, expect } from "@playwright/test";


const members = [
  ["Renata Santiago", "CEO e Fundadora"],
  ["Victor Costa", "Diretor Criativo"],
  ["Thiago", "Estrategista"],
];

test("about: no placeholders, only confirmed team", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  expect((await page.goto("/stg"))?.status()).toBe(200);
  await expect(page).toHaveTitle("Sobre a STG — STG Studio™");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("SOBRE A STG");
  await expect(page.getByRole("navigation", { name: "Navegação principal" }).getByRole("link", { name: "stg", exact: true })).toHaveAttribute("aria-current", "page");
  for (const text of ["EM BREVE", "A DEFINIR", "Espaço reservado"]) await expect(page.getByText(text, { exact: false })).toHaveCount(0);
  // Sections only render when the brand filled them in the panel — never a placeholder.
  expect(await page.locator(".about-journey").count()).toBe(await page.locator(".about-timeline > li").count() > 0 ? 1 : 0);
  expect(await page.locator(".about-story").count()).toBe(await page.locator(".about-story-copy p").count() > 0 ? 1 : 0);
  await expect(page.locator(".about-team-member")).toHaveCount(3);
  for (const [index, [name, role]] of members.entries()) {
    const member = page.locator(".about-team-member").nth(index);
    await expect(member.getByRole("heading")).toHaveText(name);
    await expect(member.getByText(role, { exact: true })).toBeVisible();
    await expect(member.locator(".about-team-photo img, .about-portrait-placeholder")).toHaveCount(1);
  }
  await page.screenshot({ path: "/tmp/stg-about-desktop.png", fullPage: true });
  await page.getByRole("navigation", { name: "Navegação principal" }).getByRole("link", { name: "shop", exact: true }).click();
  await expect(page.locator(".shop-product")).toHaveCount(5);
  await page.getByRole("navigation", { name: "Navegação principal" }).getByRole("link", { name: "stg", exact: true }).click();
  await expect(page.locator(".about-team-member")).toHaveCount(3);
  expect(errors).toEqual([]);
});

test("about: mobile navigation, vertical timeline and shared cart", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => localStorage.setItem("stg-selection-v1", JSON.stringify({ cart: [{ id: "denim-eye", size: "A definir" }], favorites: [] })));
  await page.goto("/magazine");
  await page.getByRole("button", { name: "Abrir menu" }).click();
  await page.getByRole("navigation", { name: "Navegação mobile" }).getByRole("link", { name: "stg", exact: false }).filter({ hasText: /^04stg$/ }).click();
  await expect(page).toHaveURL("http://localhost:3001/stg");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    const intro = await page.locator(".about-intro").boundingBox();
    const header = await page.locator(".site-header").boundingBox();
    expect(intro!.y).toBeGreaterThan(header!.y + header!.height);
    if (width < 768) {
      const portraits = await page.locator(".about-team-photo").evaluateAll((items) => items.map((item) => item.getBoundingClientRect().y));
      expect(portraits[1]).toBeGreaterThan(portraits[0]);
      expect(portraits[2]).toBeGreaterThan(portraits[1]);
    }
    if (width === 390) await page.screenshot({ path: "/tmp/stg-about-mobile.png", fullPage: true });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Abrir menu" }).click();
  await expect(page.locator('.mobile-nav a[href="/stg"]')).toHaveAttribute("aria-current", "page");
  await page.getByRole("button", { name: "Fechar painel" }).click();
  await page.locator(".cart-link").click();
  await expect(page.locator(".saved-item")).toHaveCount(1);
  await page.getByRole("button", { name: "FECHAR PEDIDO" }).click();
  await expect(page.getByRole("dialog").getByRole("alert")).toHaveText("Ainda estamos trabalhando nisso.");
});

test("about: keyboard access and server-rendered content", async ({ page, browser }) => {
  await page.goto("/stg");
  await page.keyboard.press("Tab");
  await expect(page.locator(".skip-link")).toBeFocused();
  await expect(page.locator(".skip-link")).toHaveAttribute("href", "#stg-main");
  const context = await browser.newContext({ javaScriptEnabled: false });
  const staticPage = await context.newPage();
  expect((await staticPage.goto("http://localhost:3001/stg"))?.status()).toBe(200);
  await expect(staticPage.getByRole("heading", { name: "Quem faz a STG." })).toBeVisible();
  await expect(staticPage.locator(".about-team-member")).toHaveCount(3);
  await context.close();
});
