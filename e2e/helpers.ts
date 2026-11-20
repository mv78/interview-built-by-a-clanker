import type { Page } from "@playwright/test";

export const API = "http://localhost:3001";

// Registers a fresh user through the API and stores the token where the web app reads it.
export async function signUp(page: Page) {
  const id = `${Date.now()}${Math.floor(Math.random() * 1e6)}`;
  const res = await page.request.post(`${API}/auth/register`, {
    data: { username: `e2e${id}`.slice(0, 30), email: `e2e${id}@example.com`, password: "password123" },
  });
  if (!res.ok()) throw new Error(`register failed: ${res.status()} ${await res.text()}`);
  const { token } = await res.json();
  await page.addInitScript((t) => localStorage.setItem("auth_token", t), token);
  return token as string;
}

export async function addToCart(page: Page, token: string, personaId: string, quantity = 1) {
  const res = await page.request.post(`${API}/cart`, {
    headers: { authorization: `Bearer ${token}` },
    data: { personaId, quantity },
  });
  if (!res.ok()) throw new Error(`add to cart failed: ${res.status()}`);
}
