export const prerender = false;

import type { APIRoute } from "astro";

export const POST: APIRoute = async (context) => {
  context.cookies.delete("yarrwin_session", { path: "/" });
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
