export const prerender = false;

import type { APIRoute } from "astro";
import { requireAdmin } from "../../../lib/guard";
import { getUserByEmail } from "../../../lib/db";

export const GET: APIRoute = async (context) => {
  const env = await requireAdmin(context);
  if (!env) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const adminEmail = (await env.DB.prepare("SELECT value FROM settings WHERE key = 'admin_username'").first<{ value: string }>())?.value;

  if (!adminEmail) {
    return new Response(JSON.stringify({ authed: true, user: { id: 0, name: "Admin", email: "", role: "admin" } }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const user = await getUserByEmail(env.DB, adminEmail);

  return new Response(JSON.stringify({
    authed: true,
    user: user
      ? { id: user.id, name: user.name, email: user.email, role: user.role }
      : { id: 0, name: adminEmail, email: adminEmail, role: "admin" },
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
