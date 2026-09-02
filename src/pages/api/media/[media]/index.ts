export const prerender = false;

import type { APIRoute } from "astro";
import { requireAdmin } from "../../../../lib/guard";
import { getMediaById, updateMedia, deleteMedia, isMediaUsedByPost } from "../../../../lib/db";

export const GET: APIRoute = async (context) => {
  const env = await requireAdmin(context);
  if (!env) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const db = env.DB;
  const id = Number(context.params.media);
  if (!id) return new Response(JSON.stringify({ error: "Missing media param" }), { status: 400 });

  const media = await getMediaById(db, id);
  if (!media) return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });

  return new Response(JSON.stringify({ media }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const PUT: APIRoute = async (context) => {
  const env = await requireAdmin(context);
  if (!env) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const db = env.DB;
  const id = Number(context.params.media);
  if (!id) return new Response(JSON.stringify({ error: "Missing media param" }), { status: 400 });

  let body: unknown;
  try {
    body = await context.request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  const { alt_text } = body as { alt_text?: string };
  const updated = await updateMedia(db, id, { alt_text });
  if (!updated) return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });

  return new Response(JSON.stringify({ media: updated }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const DELETE: APIRoute = async (context) => {
  const env = await requireAdmin(context);
  if (!env) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const db = env.DB;
  const id = Number(context.params.media);
  if (!id) return new Response(JSON.stringify({ error: "Missing media param" }), { status: 400 });

  const media = await getMediaById(db, id);
  if (!media) return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });

  const inUse = await isMediaUsedByPost(db, id);
  if (inUse) {
    return new Response(JSON.stringify({ error: "Media is used by a post. Remove it from posts first.", inUse: true }), { status: 409 });
  }

  await deleteMedia(db, id);

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
