import { test, expect } from "@playwright/test";

test("clicking the heart on a persona adds it to favorites", async ({ page }) => {
  const id = `${Date.now()}${Math.floor(Math.random() * 1e6)}`;
  const reg = await page.request.post("http://localhost:3001/auth/register", {
    data: { username: `fav${id}`.slice(0, 30), email: `fav${id}@example.com`, password: "password123" },
  });
  const { token } = await reg.json();
  await page.addInitScript((t) => localStorage.setItem("auth_token", t), token);

  await page.goto("/personas/p-001");
  const heart = page.getByRole("button", { name: "Add to Cart" }).locator("xpath=following-sibling::button");

  const req = page.waitForRequest((r) => r.url().includes("/favorites") && r.method() !== "GET" && r.method() !== "OPTIONS");
  await heart.click();
  expect((await req).method()).toBe("POST");
  await expect(heart.locator("svg")).toHaveAttribute("fill", "currentColor");

  await page.goto("/favorites");
  await expect(page.getByText("Refactor Rex", { exact: true })).toBeVisible();
});
