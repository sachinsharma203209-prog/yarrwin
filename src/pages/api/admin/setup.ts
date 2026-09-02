export const prerender = false;

import type { APIRoute } from "astro";
import { getEnv } from "../../../lib/runtime";
import { getSetting, createUser } from "../../../lib/db";
import { initAdmin, hashPassword } from "../../../lib/auth";

export const POST: APIRoute = async (context) => {
  const env = getEnv(context);
  const db = env.DB;
  if (!db) return new Response(JSON.stringify({ error: "DB unavailable" }), { status: 500 });

  const existingHash = await getSetting(db, "admin_password_hash");
  if (existingHash) {
    return new Response(JSON.stringify({ error: "Admin already set up" }), { status: 409 });
  }

  let body: unknown;
  try {
    body = await context.request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  const { username, password, name } = body as { username?: string; password?: string; name?: string };
  if (!username || !password) {
    return new Response(JSON.stringify({ error: "username and password are required" }), { status: 400 });
  }

  const { hash, salt } = await hashPassword(password);

  // Create admin user
  const user = await createUser(db, {
    name: name ?? username,
    email: username,
    password_hash: hash,
    role: "admin",
  });

  // Store admin credentials in settings for login verification
  await initAdmin(db, username, password);

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
