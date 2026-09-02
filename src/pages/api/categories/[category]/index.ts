export const prerender = false;

import type { APIRoute } from "astro";
import { requireAdmin } from "../../../../lib/guard";
import { getEnv } from "../../../../lib/runtime";
import {
  getCategoryById,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
  countPostsByCategory,
} from "../../../../lib/db";
import { categorySchema } from "../../../../lib/validate";

export const GET: APIRoute = async (context) => {
  const env = getEnv(context);
  const db = env.DB;
  if (!db) return new Response(JSON.stringify({ error: "DB unavailable" }), { status: 500 });

  const slug = context.params.category;
  if (!slug) return new Response(JSON.stringify({ error: "Missing category param" }), { status: 400 });

  const adminEnv = await requireAdmin(context);

  // Admin: try numeric id first
  if (adminEnv) {
    const numId = Number(slug);
    if (!isNaN(numId) && numId > 0) {
      const cat = await getCategoryById(db, numId);
      if (cat) return new Response(JSON.stringify({ category: cat }), { status: 200, headers: { "Content-Type": "application/json" } });
    }
  }

  const cat = await getCategoryBySlug(db, slug, { onlyActive: !adminEnv });
  if (!cat) {
    return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
  }

  return new Response(JSON.stringify({ category: cat }), {
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
  const slug = context.params.category;
  if (!slug) return new Response(JSON.stringify({ error: "Missing category param" }), { status: 400 });

  const numId = Number(slug);
  const cat = !isNaN(numId) && numId > 0
    ? await getCategoryById(db, numId)
    : await getCategoryBySlug(db, slug);
  if (!cat) return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });

  let body: unknown;
  try {
    body = await context.request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  const parsed = categorySchema.partial().safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.flatten() }), { status: 400 });
  }

  const data = parsed.data;
  const updated = await updateCategory(db, cat.id, {
    name: data.name,
    slug: data.slug,
    description: data.description,
    seo_title: data.seo_title,
    meta_description: data.meta_description,
    status: data.status,
  });

  return new Response(JSON.stringify({ category: updated }), {
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
  const slug = context.params.category;
  if (!slug) return new Response(JSON.stringify({ error: "Missing category param" }), { status: 400 });

  const numId = Number(slug);
  const cat = !isNaN(numId) && numId > 0
    ? await getCategoryById(db, numId)
    : await getCategoryBySlug(db, slug);
  if (!cat) return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });

  // Move posts to uncategorized before deleting
  const postCount = await countPostsByCategory(db, cat.id);
  if (postCount > 0) {
    await db
      .prepare("UPDATE posts SET category_id = NULL, updated_at = datetime('now') WHERE category_id = ? AND deleted_at IS NULL")
      .bind(cat.id)
      .run();
  }

  await deleteCategory(db, cat.id);

  return new Response(JSON.stringify({ ok: true, movedPosts: postCount }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
