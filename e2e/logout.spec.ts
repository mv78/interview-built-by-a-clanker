import { test, expect, type Page } from "@playwright/test";

const API = "http://localhost:3001";

async function register(page: Page, prefix: string) {
  const id = `${Date.now()}${Math.floor(Math.random() * 1e6)}`;
  const email = `${prefix}${id}@example.com`;
  const res = await page.request.post(`${API}/auth/register`, {
    data: { username: `${prefix}${id}`.slice(0, 30), email, password: "password123" },
  });
  const { token } = await res.json();
  return { email, token: token as string };
}

async function signIn(page: Page, email: string) {
  await page.goto("/login");
  await page.getByPlaceholder("you@example.com").fill(email);
  await page.getByPlaceholder("Your password").fill("password123");
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();
}

test("signing out stays signed out after a reload", async ({ page }) => {
  const a = await register(page, "lo");
  await signIn(page, a.email);

  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign out" })).toHaveCount(0);
});

test("the next user to sign in does not see the previous user's cart", async ({ page }) => {
  const a = await register(page, "la");
  const b = await register(page, "lb");
  await page.request.post(`${API}/cart`, {
    headers: { authorization: `Bearer ${a.token}` },
    data: { personaId: "p-001", quantity: 3 },
  });
  const badge = page.locator('nav a[href="/cart"] span');

  await signIn(page, a.email);
  await expect(badge).toHaveText("3");

  await page.getByRole("button", { name: "Sign out" }).click();
  await page.getByRole("link", { name: "Sign in" }).click();
  await page.getByPlaceholder("you@example.com").fill(b.email);
  await page.getByPlaceholder("Your password").fill("password123");
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();

  await expect(badge).toHaveCount(0);
});
