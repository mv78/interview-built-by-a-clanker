import { test } from "node:test";
import assert from "node:assert/strict";
import { buildApp, bearer } from "./helpers.ts";
import { cartRoutes } from "../src/routes/cart.ts";

test("DELETE /cart/:itemId on another user's item returns 404 and keeps the item", async () => {
  const app = await buildApp(cartRoutes);
  const a = bearer(app, "user-cart-owner-a");
  const b = bearer(app, "user-cart-intruder-b");

  const added = await app.inject({ method: "POST", url: "/cart", headers: a, payload: { personaId: "p-001" } });
  assert.equal(added.statusCode, 200, added.body);
  const itemId = added.json().items[0].id;

  const res = await app.inject({ method: "DELETE", url: `/cart/${itemId}`, headers: b });
  assert.equal(res.statusCode, 404, res.body);
  assert.deepEqual(res.json(), { error: "Cart item not found" });

  const cart = await app.inject({ method: "GET", url: "/cart", headers: a });
  assert.equal(cart.json().items.length, 1);
  assert.equal(cart.json().items[0].id, itemId);
});

test("DELETE /cart/:itemId lets the owner delete their own item", async () => {
  const app = await buildApp(cartRoutes);
  const a = bearer(app, "user-cart-owner-c");

  const added = await app.inject({ method: "POST", url: "/cart", headers: a, payload: { personaId: "p-001" } });
  const itemId = added.json().items[0].id;

  const res = await app.inject({ method: "DELETE", url: `/cart/${itemId}`, headers: a });
  assert.equal(res.statusCode, 200, res.body);
  assert.deepEqual(res.json(), { items: [], total: 0 });
});
