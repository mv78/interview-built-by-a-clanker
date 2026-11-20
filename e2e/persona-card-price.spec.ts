import { test, expect } from "@playwright/test";

test("persona card shows the same price as the API and the detail page", async ({ page }) => {
  const res = await page.request.get("http://localhost:3001/personas/p-001");
  const persona = await res.json();
  const expected = "$" + persona.price.toFixed(2); // "$49.99"

  await page.goto("/");
  const card = page.locator("a", { hasText: persona.name }).first();
  await expect(card).toContainText(expected);

  await card.click();
  await expect(page.getByText(expected).first()).toBeVisible();
});
