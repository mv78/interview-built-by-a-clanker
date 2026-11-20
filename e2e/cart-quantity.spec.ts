import { test, expect } from "@playwright/test";

test("cart quantity cannot be decreased below 1", async ({ page }) => {
  const id = `${Date.now()}${Math.floor(Math.random() * 1e6)}`;
  const reg = await page.request.post("http://localhost:3001/auth/register", {
    data: { username: `cq${id}`.slice(0, 30), email: `cq${id}@example.com`, password: "password123" },
  });
  const { token } = await reg.json();
  await page.request.post("http://localhost:3001/cart", {
    headers: { authorization: `Bearer ${token}` },
    data: { personaId: "p-001", quantity: 2 },
  });
  await page.addInitScript((t) => localStorage.setItem("auth_token", t), token);

  const putStatuses: number[] = [];
  page.on("response", (r) => {
    if (r.request().method() === "PUT") putStatuses.push(r.status());
  });

  await page.goto("/cart");
  const minus = page.getByRole("button", { name: "-", exact: true });
  await expect(minus).toBeEnabled();

  await minus.click(); // 2 -> 1
  await expect(page.getByText("$49.99", { exact: true }).first()).toBeVisible();
  await expect(minus).toBeDisabled();

  await minus.click({ force: true }).catch(() => {});
  await page.waitForTimeout(300);
  expect(putStatuses).toEqual([200]);
});
