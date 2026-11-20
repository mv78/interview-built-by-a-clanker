import { test } from "node:test";
import assert from "node:assert/strict";
import { buildApp } from "./helpers.ts";
import { personaRoutes } from "../src/routes/personas.ts";

async function prices(url: string): Promise<number[]> {
  const app = await buildApp(personaRoutes);
  const res = await app.inject({ method: "GET", url });
  assert.equal(res.statusCode, 200, res.body);
  const body = res.json();
  const list = Array.isArray(body) ? body : body.personas;
  return list.map((p: { price: number }) => p.price);
}

test("GET /personas?minPrice=40 returns only personas priced at or above 40", async () => {
  const result = await prices("/personas?minPrice=40");
  assert.ok(result.length > 0);
  assert.ok(result.every((p) => p >= 40), `prices: ${result}`);
});

test("GET /personas?minPrice&maxPrice returns personas within the range", async () => {
  const result = await prices("/personas?minPrice=30&maxPrice=60");
  assert.ok(result.length > 0);
  assert.ok(result.every((p) => p >= 30 && p <= 60), `prices: ${result}`);
});
