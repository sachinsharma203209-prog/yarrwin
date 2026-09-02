export const prerender = false;

import type { APIRoute } from "astro";
import { requireAdmin } from "../../../lib/guard";
import { getPostById, updatePost, deletePost } from "../../../lib/db";

export const POST: APIRoute = async (context) => {
  const env = await requireAdmin(context);
  if (!env) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const db = env.DB;

  let body: unknown;
  try {
    body = await context.request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  const { action, ids } = body as { action?: string; ids?: number[] };
  if (!action || !ids || !Array.isArray(ids) || ids.length === 0) {
    return new Response(JSON.stringify({ error: "action and ids[] are required" }), { status: 400 });
  }

  const validActions = ["publish", "draft", "delete"];
  if (!validActions.includes(action)) {
    return new Response(JSON.stringify({ error: `action must be one of: ${validActions.join(", ")}` }), { status: 400 });
  }

  let affected = 0;
  for (const id of ids) {
    if (action === "delete") {
      const ok = await deletePost(db, id);
      if (ok) affected++;
    } else {
      const post = await getPostById(db, id);
      if (post) {
        await updatePost(db, id, { status: action as any });
        affected++;
      }
    }
  }

  return new Response(JSON.stringify({ ok: true, affected }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
