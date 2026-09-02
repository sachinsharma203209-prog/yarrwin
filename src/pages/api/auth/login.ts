export const prerender = false;

import type { APIRoute } from "astro";
import { loginSchema } from "../../../lib/validate";
import { verifyLogin, createSessionToken } from "../../../lib/auth";
import { getEnv } from "../../../lib/runtime";

export const POST: APIRoute = async (context) => {
  const env = getEnv(context);
  const db = env.DB;
  if (!db) return new Response(JSON.stringify({ error: "DB unavailable" }), { status: 500 });

  let body: unknown;
  try {
    body = await context.request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.flatten() }), { status: 400 });
  }

  const { username, password } = parsed.data;
  const ok = await verifyLogin(db, username, password);
  if (!ok) {
    return new Response(JSON.stringify({ error: "Invalid credentials" }), { status: 401 });
  }

  const token = await createSessionToken(db);

  context.cookies.set("yarrwin_session", token, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: new URL(context.request.url).protocol === "https:",
    maxAge: 7 * 24 * 60 * 60,
  });

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
