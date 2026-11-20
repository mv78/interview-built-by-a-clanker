import { test, expect } from "@playwright/test";

test("nav cart badge updates after adding to cart", async ({ page }) => {
  const id = `${Date.now()}${Math.floor(Math.random() * 1e6)}`;
  const reg = await page.request.post("http://localhost:3001/auth/register", {
    data: { username: `cb${id}`.slice(0, 30), email: `cb${id}@example.com`, password: "password123" },
  });
  const { token } = await reg.json();
  await page.addInitScript((t) => localStorage.setItem("auth_token", t), token);

  await page.goto("/personas/p-001");
  const badge = page.locator('nav a[href="/cart"] span');
  await expect(page.getByRole("button", { name: "Add to Cart" })).toBeVisible();
  await expect(badge).toHaveCount(0);

  await page.getByRole("button", { name: "Add to Cart" }).click();
  await expect(badge).toHaveText("1");

  await page.getByRole("button", { name: "Add to Cart" }).click();
  await expect(badge).toHaveText("2");
});
