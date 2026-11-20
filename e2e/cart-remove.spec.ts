import { test, expect } from "@playwright/test";
import { signUp, addToCart } from "./helpers";

test("removing an item from the cart empties it", async ({ page }) => {
  const token = await signUp(page);
  await addToCart(page, token, "p-001");

  await page.goto("/cart");
  await expect(page.getByText("Refactor Rex", { exact: true })).toBeVisible();

  const del = page.waitForResponse((r) => r.request().method() === "DELETE" && r.url().includes("/cart/"));
  await page.getByRole("button", { name: "Remove" }).click();
  expect((await del).status()).toBe(200);

  await expect(page.getByText("Refactor Rex", { exact: true })).toHaveCount(0);
});
