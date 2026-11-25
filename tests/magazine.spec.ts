import { test, expect } from "@playwright/test";

// Assertions adapt to whatever posts the data layer returns (none yet).
test("magazine: index, every article, metadata and missing stories", async ({ page, request }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  expect((await page.goto("/magazine"))?.status()).toBe(200);
  await expect(page).toHaveTitle("Magazine — STG Studio™");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("MAGAZINE");
  await expect(page.getByRole("navigation", { name: "Navegação principal" }).getByRole("link", { name: "magazine" })).toHaveAttribute("aria-current", "page");
  for (const text of ["demonstrativ", "prévia"]) await expect(page.getByText(text, { exact: false })).toHaveCount(0);
  const links = await page.locator(".magazine-card-link").evaluateAll((items) => items.map((item) => ({ href: item.getAttribute("href")!, title: item.querySelector("h2")!.textContent! })));
  if (links.length === 0) await expect(page.locator(".magazine-empty")).toBeVisible();
  else await expect.poll(() => page.locator(".magazine-card-image img").first().evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  await page.screenshot({ path: "/tmp/stg-magazine-desktop.png", fullPage: true });
  for (const [index, link] of links.entries()) {
    expect((await page.goto(link.href))?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(link.title);
    await expect(page).toHaveTitle(link.title + " — Magazine STG Studio™");
    await expect.poll(() => page.locator(".magazine-article-cover img").evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
    if (index === 0) await page.screenshot({ path: "/tmp/stg-magazine-article-desktop.png", fullPage: true });
    if (links.length > 1) {
      await page.locator(".magazine-next a").click();
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(links[(index + 1) % links.length].title);
    }
    await page.getByRole("link", { name: "VOLTAR À MAGAZINE" }).click();
    await expect(page.locator(".magazine-card")).toHaveCount(links.length);
  }
  expect((await request.get("/magazine/materia-inexistente")).status()).toBe(404);
  await page.goto("/magazine/materia-inexistente");
  await expect(page.getByRole("heading", { name: "Opss. Você acabou se perdendo." })).toBeVisible();
  expect(errors).toEqual([]);
});
