import { test, expect } from "@playwright/test";


test("desktop: original assets, scroll sequence and 3D render", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.waitForFunction(() => document.fonts.status === "loaded");
  await expect(page.locator(".pin-spacer")).toHaveCount(1);
  await page.waitForTimeout(1900);
  await page.screenshot({ path: "/tmp/stg-desktop-hero.png" });
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const heroImage = await page.locator(".hero-image img").evaluate((image: HTMLImageElement) => ({ width: image.naturalWidth, complete: image.complete }));
  expect(heroImage.complete).toBe(true);
  expect(heroImage.width).toBeGreaterThan(1000);
  const heroBeforeScroll = await page.locator(".hero").boundingBox();
  await page.evaluate(() => window.scrollTo(0, 220));
  await page.waitForTimeout(250);
  const heroAfterScroll = await page.locator(".hero").boundingBox();
  expect(heroAfterScroll!.height).toBe(heroBeforeScroll!.height);
  await expect(page.locator(".hero-image")).toHaveCSS("transform", "none");
  await page.evaluate(() => window.scrollTo(0, 0));
  const logo = await page.locator(".header-brand img").boundingBox();
  expect(logo!.width / logo!.height).toBeCloseTo(190.29 / 75.2228, 1);

  await page.getByRole("button", { name: "Rolar para o manifesto" }).click();
  await page.waitForTimeout(1800);
  const firstColor = await page.locator(".manifesto-word").first().evaluate((node) => getComputedStyle(node).color);
  await page.mouse.wheel(0, 400);
  await page.waitForTimeout(1200);
  const finalColor = await page.locator(".manifesto-word").last().evaluate((node) => getComputedStyle(node).color);
  expect(firstColor).not.toBe("rgb(54, 49, 49)");
  expect(finalColor).toBe("rgb(226, 221, 213)");

  await page.locator("#colecoes").evaluate((section) => section.scrollIntoView({ block: "start" }));
  await page.waitForTimeout(1400);
  const collection = await page.locator("#colecoes").boundingBox();
  expect(collection!.y).toBeGreaterThanOrEqual(0);
  const cards = page.locator(".collection-card");
  await page.mouse.move(100, 90);
  await page.waitForTimeout(850);
  const normalBoxes = await Promise.all([0, 1, 2, 3].map((index) => cards.nth(index).boundingBox()));
  expect(normalBoxes[0]!.x).toBeCloseTo(0, 0);
  expect(normalBoxes[1]!.x).toBeCloseTo(360, -1);
  expect(normalBoxes[2]!.x).toBeCloseTo(720, -1);
  expect(normalBoxes[3]!.x).toBeCloseTo(1080, -1);
  await cards.nth(1).hover();
  await page.waitForTimeout(850);
  const highlighted = await cards.nth(1).boundingBox();
  const pushedRight = await cards.nth(2).boundingBox();
  expect(highlighted!.width).toBeGreaterThan(normalBoxes[1]!.width);
  expect(pushedRight!.x).toBeGreaterThan(normalBoxes[2]!.x);
  await page.mouse.move(720, 50);
  await page.waitForTimeout(850);
  await page.screenshot({ path: "/tmp/stg-collection.png" });

  await page.locator("#stg").scrollIntoViewIfNeeded();
  await expect(page.locator(".chrome-logo")).toHaveClass(/is-ready/, { timeout: 15000 });
  await page.waitForTimeout(1800);
  await page.screenshot({ path: "/tmp/stg-studio.png" });
  await page.locator("#categorias").scrollIntoViewIfNeeded();
  await page.locator(".category-name").last().click();
  await expect(page.locator(".category-name").last()).toHaveAttribute("aria-pressed", "true");
  await page.waitForTimeout(1500);
  await expect(page.locator(".category-explore")).toContainText("EXPLORAR BOLSAS");
  await expect(page.locator(".category-frame").last()).toHaveCSS("clip-path", "inset(0%)");
  await page.screenshot({ path: "/tmp/stg-categories.png" });
  expect(errors).toEqual([]);
});

test("catalog, favorites and cart persist and dialogs restore focus", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "shop", exact: true }).click();
  await expect(page).toHaveURL(/\/shop$/);
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.getByRole("button", { name: "categorias", exact: true }).click();
  await page.getByRole("radio", { name: "Bolsas" }).check();
  await expect(page.locator(".shop-product")).toHaveCount(1);
  await page.getByRole("button", { name: "Ver Bolsa reconstruída", exact: true }).click();
  await page.getByLabel("Seu tamanho de preferência").selectOption("Único");
  await page.getByRole("button", { name: "SALVAR NOS FAVORITOS", exact: false }).click();
  await page.getByRole("button", { name: "ADICIONAR À SELEÇÃO" }).click();
  await expect(page.getByRole("dialog").getByRole("status")).toContainText("Peça adicionada");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.getByRole("button", { name: "Ver Bolsa reconstruída", exact: true })).toBeFocused();
  await page.reload();
  await expect(page.locator(".cart-count")).toContainText("01");
  await page.locator(".cart-link").click();
  await expect(page.locator(".saved-item")).toHaveCount(1);
  await expect(page.locator(".saved-item")).toContainText("Único");
  await expect(page.getByText("PEÇAS COM OUTRAS HISTÓRIAS", { exact: true })).toHaveCount(0);
  await expect(page.locator(".selection-note")).toHaveCount(0);
  const selectionBeforeCheckout = await page.evaluate(() => localStorage.getItem("stg-selection-v1"));
  const checkout = page.getByRole("button", { name: "FECHAR PEDIDO" });
  await checkout.click();
  const warning = page.getByRole("dialog").getByRole("alert");
  await expect(warning).toHaveText("Ainda estamos trabalhando nisso.");
  await expect(warning).toHaveCSS("background-color", "rgb(0, 0, 0)");
  await expect(warning).toHaveCSS("color", "rgb(255, 255, 255)");
  await expect.poll(async () => Math.round((await warning.boundingBox())!.y)).toBe(0);
  expect(Math.round((await warning.boundingBox())!.width)).toBe(1440);
  expect(await page.evaluate(() => localStorage.getItem("stg-selection-v1"))).toBe(selectionBeforeCheckout);
  await page.screenshot({ path: "/tmp/stg-checkout-warning-desktop.png" });
  await warning.getByRole("button", { name: "Fechar aviso" }).click();
  await expect(warning).toHaveCount(0);
  await expect(checkout).toBeFocused();
  await checkout.click();
  await page.keyboard.press("Escape");
  await expect(warning).toHaveCount(0);
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Remover Bolsa reconstruída" }).click();
  await expect(page.getByText("Sua seleção está vazia.")).toBeVisible();
  await page.keyboard.press("Escape");
  await page.locator('[data-control="filters"]').click();
  await page.getByRole("checkbox", { name: "Apenas favoritos" }).check();
  await expect(page.locator(".shop-product")).toHaveCount(1);
});

test("mobile: responsive layout, menu and scroll categories", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Abrir menu" })).toBeVisible();
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "/tmp/stg-mobile-hero.png" });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  await page.getByRole("button", { name: "Abrir menu" }).click();
  await expect(page.getByRole("navigation", { name: "Navegação mobile" })).toBeVisible();
  await page.getByRole("navigation", { name: "Navegação mobile" }).getByRole("link", { name: "shop" }).click();
  await expect(page).toHaveURL(/\/shop$/);
  await expect(page.getByRole("heading", { name: "SHOP", exact: true })).toBeVisible();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.screenshot({ path: "/tmp/stg-shop-mobile-tested.png" });
  await page.goBack();
  await page.locator("#categorias").scrollIntoViewIfNeeded();
  await page.locator(".category-name").last().click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "/tmp/stg-mobile-categories.png" });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  await page.locator(".category-explore").click();
  await expect(page).toHaveURL(/\/shop\?categoria=Bolsas$/);
  await expect(page.locator(".shop-product")).toHaveCount(1);
  await expect(page.locator(".shop-product")).toContainText("Bolsa reconstruída");
});

test("reduced motion and malformed browser storage remain usable", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => localStorage.setItem("stg-selection-v1", "invalid-json"));
  await page.goto("/");
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
  await expect(page.locator(".cart-count")).toContainText("00");
  await page.locator("#categorias").scrollIntoViewIfNeeded();
  await page.locator(".category-name").last().click();
  await expect(page.locator(".category-frame").last()).toHaveCSS("clip-path", "inset(0%)");
  await page.screenshot({ path: "/tmp/stg-fullpage-reduced.png", fullPage: true });
  await page.locator(".category-explore").click();
  await expect(page).toHaveURL(/\/shop\?categoria=Bolsas$/);
  await expect(page.locator(".shop-product")).toHaveCount(1);
});

test("shop: search, categories, sorting and favorites combine and survive reload", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/shop");
  await expect(page).toHaveTitle("Shop — STG Studio™");
  await expect(page.getByRole("link", { name: "magazine", exact: true })).toBeVisible();
  await expect(page.locator(".shop-product")).toHaveCount(5);

  const searchButton = page.locator('[data-control="search"]');
  await searchButton.click();
  const search = page.getByRole("searchbox", { name: "Pesquisar peças" });
  await expect(search).toBeFocused();
  await search.fill("calcas");
  await expect(page.locator(".shop-product")).toHaveCount(1);
  await expect(page.locator(".shop-product")).toContainText("Denim, outro olhar");
  await page.keyboard.press("Escape");
  await expect(searchButton).toBeFocused();
  await page.reload();
  await expect(page.locator(".shop-product")).toHaveCount(1);
  await page.getByRole("button", { name: "Remover pesquisa", exact: true }).click();
  await expect(page.locator(".shop-product")).toHaveCount(5);

  await page.locator('[data-control="filters"]').click();
  await page.getByRole("radio", { name: "Nome: A–Z", exact: true }).check();
  await expect(page.locator(".shop-product h2").first()).toHaveText("Bolsa reconstruída");
  await page.getByRole("radio", { name: "Nome: Z–A", exact: true }).check();
  await expect(page.locator(".shop-product h2").first()).toHaveText("Olhar de prata");
  await page.getByRole("checkbox", { name: "Apenas favoritos" }).check();
  await expect(page.locator(".shop-product")).toHaveCount(0);
  await expect(page.getByText("Nenhuma peça por aqui.")).toBeVisible();
  await page.getByRole("button", { name: "VER TODAS AS PEÇAS", exact: false }).click();
  await expect(page.locator(".shop-product")).toHaveCount(5);
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: "Ver Olhar de prata", exact: true }).click();
  await page.getByRole("button", { name: "SALVAR NOS FAVORITOS", exact: false }).click();
  await page.keyboard.press("Escape");
  await page.locator('[data-control="filters"]').click();
  await page.getByRole("checkbox", { name: "Apenas favoritos" }).check();
  await expect(page.locator(".shop-product")).toHaveCount(1);
  await page.locator('[data-control="category"]').click();
  await page.getByRole("radio", { name: "Bolsas" }).check();
  await expect(page.locator(".shop-product")).toHaveCount(0);
  await page.getByRole("button", { name: "Remover categoria" }).click();
  await expect(page.locator(".shop-product")).toHaveCount(1);
  await page.reload();
  await expect(page.locator(".shop-product")).toContainText("Olhar de prata");
  expect(errors).toEqual([]);
});

test("shop: category URLs, browser back and mobile keyboard navigation", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/shop?categoria=Bolsas");
  await expect(page.locator(".shop-product")).toHaveCount(1);
  await page.locator('[data-control="category"]').click();
  await page.getByRole("radio", { name: "Acessórios" }).check();
  await expect(page.locator(".shop-product")).toContainText("Olhar de prata");
  await page.goBack();
  await expect(page.locator(".shop-product")).toContainText("Bolsa reconstruída");
  await page.locator('[data-control="search"]').click();
  await page.getByRole("searchbox").fill("zzzz");
  await expect(page.getByText("Nenhuma peça por aqui.")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator('[data-control="search"]')).toBeFocused();
  await page.getByRole("button", { name: "limpar tudo", exact: true }).click();
  await expect(page.locator(".shop-product")).toHaveCount(5);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);

  await page.getByRole("button", { name: "Abrir menu" }).click();
  const navigation = page.getByRole("navigation", { name: "Navegação mobile" });
  await expect(navigation.getByRole("link", { name: "magazine" })).toBeVisible();
  await navigation.getByRole("link", { name: "início" }).click();
  await expect(page).toHaveURL("http://localhost:3001/");
  await expect(page.locator(".hero")).toBeVisible();
  await expect(page.locator(".pin-spacer")).toHaveCount(1);
});

test("missing pages: branded 404, original artwork and return home", async ({ page, request }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  for (const path of ["/pagina-inexistente", "/shop/peca-inexistente", "/pecas/codigo-invalido"]) {
    const response = await request.get(path);
    expect(response.status()).toBe(404);
    await page.goto(path);
    await expect(page.getByRole("heading", { name: "Opss. Você acabou se perdendo.", exact: true })).toBeVisible();
    await expect(page.getByText("A página que você acessou não existe.", { exact: true })).toBeVisible();
    await expect(page).toHaveTitle("404 — STG Studio™");
    await expect(page.locator("canvas")).toHaveCount(0);
    await expect(page.locator(".not-found-art")).toHaveAttribute("alt", "Logo cromada da STG Studio quebrada em fragmentos");
    await expect.poll(() => page.locator(".not-found-art").evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
    await page.getByRole("link", { name: "VOLTAR PRO INÍCIO", exact: false }).click();
    await expect(page.locator(".hero")).toBeVisible();
  }
  expect((await request.get("/shop/peca-inexistente")).status()).toBe(404);
});

test("mobile: missing pages and checkout warning span the screen", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => localStorage.setItem("stg-selection-v1", JSON.stringify({ cart: [{ id: "denim-eye", size: "A definir" }], favorites: [] })));
  for (const path of ["/pagina-inexistente", "/pecas/codigo-invalido"]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { name: "Opss. Você acabou se perdendo.", exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  }
  await page.goto("/shop");
  await page.locator(".cart-link").click();
  await page.getByRole("button", { name: "FECHAR PEDIDO" }).click();
  const warning = page.getByRole("dialog").getByRole("alert");
  await expect(warning).toHaveText("Ainda estamos trabalhando nisso.");
  await expect.poll(async () => Math.round((await warning.boundingBox())!.y)).toBe(0);
  const box = await warning.boundingBox();
  expect(box!.x).toBe(0);
  expect(box!.y).toBe(0);
  expect(box!.width).toBe(390);
  await page.screenshot({ path: "/tmp/stg-checkout-warning-mobile.png" });
  await warning.getByRole("button", { name: "Fechar aviso" }).click();
  await expect(page.locator(".saved-item")).toHaveCount(1);
});
