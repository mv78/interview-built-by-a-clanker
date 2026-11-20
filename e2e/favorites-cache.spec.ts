import { test, expect } from "@playwright/test";

test("opening a persona from the favorites page renders its detail page", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));

  const id = `${Date.now()}${Math.floor(Math.random() * 1e6)}`;
  const reg = await page.request.post("http://localhost:3001/auth/register", {
    data: { username: `fc${id}`.slice(0, 30), email: `fc${id}@example.com`, password: "password123" },
  });
  const { token } = await reg.json();
  await page.request.post("http://localhost:3001/favorites", {
    headers: { authorization: `Bearer ${token}` },
    data: { personaId: "p-001" },
  });
  await page.addInitScript((t) => localStorage.setItem("auth_token", t), token);

  await page.goto("/favorites");
  // Client-side navigation keeps the ["favorites"] query cache from the favorites page.
  await page.locator("a", { hasText: "Refactor Rex" }).first().click();

  await expect(page).toHaveURL(/\/personas\/p-001$/);
  await expect(page.getByRole("heading", { name: "Refactor Rex" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Add to Cart" })).toBeVisible();
  expect(errors).toEqual([]);
});
