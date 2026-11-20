import Fastify, { type FastifyPluginAsync } from "fastify";
import jwt from "@fastify/jwt";

// Builds an app with the same JWT setup as src/index.ts, without listening.
export async function buildApp(...plugins: FastifyPluginAsync[]) {
  const app = Fastify();
  await app.register(jwt, { secret: "test-secret" });
  for (const plugin of plugins) await app.register(plugin);
  await app.ready();
  return app;
}

export function bearer(app: { jwt: { sign(p: object): string } }, userId: string) {
  return { authorization: `Bearer ${app.jwt.sign({ id: userId })}` };
}
