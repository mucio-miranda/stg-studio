import { test, expect } from "@playwright/test";

test("minimal login: one logo, one heading, both form modes and accessible errors", async ({ page }) => {
  await page.goto("/entrar");
  await expect(page.locator(".brand-logo:visible")).toHaveCount(1);
  await expect(page.locator("main .brand-logo, footer .brand-logo")).toHaveCount(0);
  await expect(page.locator("main h1")).toHaveText("Entrar.");
  await expect(page.locator("main h2")).toHaveCount(0);
  await expect(page.locator("footer")).toHaveClass(/site-footer-compact/);
  await expect(page.getByLabel("E-mail")).toHaveAttribute("autocomplete", "email");
  await expect(page.getByLabel("Senha")).toHaveAttribute("autocomplete", "current-password");
  await page.keyboard.press("Tab");
  await expect(page.locator(".skip-link")).toBeFocused();
  await page.keyboard.press("Enter");
  await page.screenshot({ path: "/tmp/stg-minimal-login-desktop.png", fullPage: true });
  await page.getByRole("button", { name: "Ainda não tem conta?" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Criar conta.");
  await expect(page.getByLabel("Nome", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Senha")).toHaveAttribute("autocomplete", "new-password");
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    await expect(page.locator(".brand-logo:visible")).toHaveCount(1);
    if (width === 390) await page.screenshot({ path: "/tmp/stg-minimal-signup-mobile.png", fullPage: true });
  }
  await page.getByRole("button", { name: "Já tem conta? Entrar" }).click();
  await expect(page.getByLabel("Nome", { exact: true })).toHaveCount(0);
  await page.goto("/entrar?erro=confirmacao");
  await expect(page.locator("main").getByRole("alert")).toContainText("Não foi possível confirmar");
  await expect(page.getByLabel("E-mail")).toBeVisible();
});

test("inner pages: branding is confined to the header and navigation remains usable", async ({ page }) => {
  for (const path of ["/shop", "/colecoes", "/magazine", "/stg"]) {
    await page.goto(path);
    await expect(page.locator(".brand-logo:visible")).toHaveCount(1);
    await expect(page.locator("main h1")).toHaveCount(1);
    await expect(page.locator(".footer-statement")).toHaveCount(0);
    await page.setViewportSize({ width: 390, height: 844 });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  }
  await page.locator(".cart-link").click();
  await expect(page.locator(".empty-state .brand-logo")).toHaveCount(0);
  await expect(page.getByText("Sua seleção está vazia.")).toBeVisible();
  await page.getByRole("button", { name: "EXPLORAR A COLEÇÃO" }).click();
  await expect(page).toHaveURL("http://localhost:3001/shop");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.getByRole("button", { name: "Abrir menu" }).click();
  await page.locator('.mobile-nav a[href="/voce"]').click();
  await expect(page).toHaveURL(/\/entrar\?next=/);
  await expect(page.locator("main h1")).toHaveText("Entrar.");
});
