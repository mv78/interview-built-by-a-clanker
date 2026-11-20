import { test, expect } from "@playwright/test";

test("typing a search narrows the persona list", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Refactor Rex", { exact: true })).toBeVisible();

  await page.getByPlaceholder("Search personas").fill("Zara");
  await expect(page).toHaveURL(/q=Zara/);

  await expect(page.getByText("Zero-Day Zara", { exact: true })).toBeVisible();
  await expect(page.getByText("Refactor Rex", { exact: true })).toHaveCount(0);
});

test("changing the sort reorders the persona list", async ({ page }) => {
  const res = await page.request.get("http://localhost:3001/personas?sort=price-asc");
  const cheapest = (await res.json())[0].name;

  await page.goto("/");
  await expect(page.getByText("Refactor Rex", { exact: true })).toBeVisible();

  await page.locator("select").last().selectOption("price-asc");
  await expect(page).toHaveURL(/sort=price-asc/);
  await expect(page.locator('a[href^="/personas/"]').first()).toContainText(cheapest);
});
