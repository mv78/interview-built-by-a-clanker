import { test } from "node:test";
import assert from "node:assert/strict";
import { buildApp, bearer } from "./helpers.ts";
import { cartRoutes } from "../src/routes/cart.ts";

test("GET /cart with a valid token returns the caller's cart", async () => {
  const app = await buildApp(cartRoutes);
  const res = await app.inject({ method: "GET", url: "/cart", headers: bearer(app, "user-auth-1") });
  assert.equal(res.statusCode, 200, res.body);
  assert.deepEqual(res.json(), { items: [], total: 0 });
});

test("GET /cart without a token returns 401", async () => {
  const app = await buildApp(cartRoutes);
  const res = await app.inject({ method: "GET", url: "/cart" });
  assert.equal(res.statusCode, 401, res.body);
});
