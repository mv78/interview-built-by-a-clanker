import { test } from "node:test";
import assert from "node:assert/strict";
import { buildApp, bearer } from "./helpers.ts";
import { cartRoutes } from "../src/routes/cart.ts";
import { checkoutRoutes } from "../src/routes/checkout.ts";

test("POST /checkout creates the order and empties only the caller's cart", async () => {
  const app = await buildApp(cartRoutes, checkoutRoutes);
  const buyer = bearer(app, "user-checkout-1");
  const other = bearer(app, "user-checkout-2");

  for (const headers of [buyer, other]) {
    const add = await app.inject({ method: "POST", url: "/cart", headers, payload: { personaId: "p-001", quantity: 2 } });
    assert.equal(add.statusCode, 200, add.body);
  }

  const res = await app.inject({ method: "POST", url: "/checkout", headers: buyer, payload: { name: "A", email: "a@example.com" } });
  assert.equal(res.statusCode, 201, res.body);
  assert.equal(res.json().total, 99.98);
  assert.equal(res.json().items.length, 1);

  const cart = await app.inject({ method: "GET", url: "/cart", headers: buyer });
  assert.deepEqual(cart.json(), { items: [], total: 0 });

  const otherCart = await app.inject({ method: "GET", url: "/cart", headers: other });
  assert.equal(otherCart.json().items.length, 1);
  assert.equal(otherCart.json().total, 99.98);
});
