import { test } from "node:test";
import assert from "node:assert/strict";
import { buildApp } from "./helpers.ts";
import { authRoutes } from "../src/routes/auth.ts";

async function registerUser(app: Awaited<ReturnType<typeof buildApp>>) {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const creds = { username: `login_${suffix}`, email: `login-${suffix}@example.com`, password: "secret123" };
  const res = await app.inject({ method: "POST", url: "/auth/register", payload: creds });
  assert.equal(res.statusCode, 201, res.body);
  return { creds, user: res.json().user };
}

test("POST /auth/login returns the same user as register, including username", async () => {
  const app = await buildApp(authRoutes);
  const { creds, user } = await registerUser(app);
  const res = await app.inject({
    method: "POST",
    url: "/auth/login",
    payload: { email: creds.email, password: creds.password },
  });
  assert.equal(res.statusCode, 200, res.body);
  const body = res.json();
  assert.ok(body.token);
  assert.deepEqual(body.user, user);
});

test("POST /auth/login with a wrong password returns 401", async () => {
  const app = await buildApp(authRoutes);
  const { creds } = await registerUser(app);
  const res = await app.inject({
    method: "POST",
    url: "/auth/login",
    payload: { email: creds.email, password: "wrong-password" },
  });
  assert.equal(res.statusCode, 401, res.body);
});

test("POST /auth/login with an unknown email returns 401", async () => {
  const app = await buildApp(authRoutes);
  const res = await app.inject({
    method: "POST",
    url: "/auth/login",
    payload: { email: "nobody-here@example.com", password: "secret123" },
  });
  assert.equal(res.statusCode, 401, res.body);
});
