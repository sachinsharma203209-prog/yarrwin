export const prerender = false;

import type { APIRoute } from "astro";
import { requireAdmin } from "../../../../lib/guard";
import { getEnv } from "../../../../lib/runtime";
import { getPostById, getPostBySlug, updatePost, deletePost } from "../../../../lib/db";
import { postSchema } from "../../../../lib/validate";

export const GET: APIRoute = async (context) => {
  const env = getEnv(context);
  const db = env.DB;
  if (!db) return new Response(JSON.stringify({ error: "DB unavailable" }), { status: 500 });

  const slug = context.params.post;
  if (!slug) return new Response(JSON.stringify({ error: "Missing post param" }), { status: 400 });

  const adminEnv = await requireAdmin(context);

  // Admin can look up by numeric id
  if (adminEnv) {
    const numId = Number(slug);
    if (!isNaN(numId) && numId > 0) {
      const post = await getPostById(db, numId);
      if (post) return new Response(JSON.stringify({ post }), { status: 200, headers: { "Content-Type": "application/json" } });
    }
  }

  // Public: slug only, published only
  const post = await getPostBySlug(db, slug, { publishedOnly: !adminEnv });
  if (!post) {
    return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
  }

  return new Response(JSON.stringify({ post }), {
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
  const slug = context.params.post;
  if (!slug) return new Response(JSON.stringify({ error: "Missing post param" }), { status: 400 });

  // Resolve post id
  const numId = Number(slug);
  const post = !isNaN(numId) && numId > 0
    ? await getPostById(db, numId)
    : await getPostBySlug(db, slug);
  if (!post) return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });

  let body: unknown;
  try {
    body = await context.request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  const parsed = postSchema.partial().safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.flatten() }), { status: 400 });
  }

  const data = parsed.data;
  const updated = await updatePost(db, post.id, {
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt,
    content: data.content,
    featured_image: data.featured_image,
    featured_image_alt: data.featured_image_alt,
    category_id: data.category_id,
    status: data.status,
    scheduled_at: data.scheduled_at,
    seo_title: data.seo_title,
    meta_description: data.meta_description,
    canonical_url: data.canonical_url,
    robots_index: data.robots_index !== undefined ? (data.robots_index ? 1 : 0) : undefined,
    robots_follow: data.robots_follow !== undefined ? (data.robots_follow ? 1 : 0) : undefined,
    og_title: data.og_title,
    og_description: data.og_description,
    og_image_url: data.og_image_url,
  });

  return new Response(JSON.stringify({ post: updated }), {
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
  const slug = context.params.post;
  if (!slug) return new Response(JSON.stringify({ error: "Missing post param" }), { status: 400 });

  const numId = Number(slug);
  const post = !isNaN(numId) && numId > 0
    ? await getPostById(db, numId)
    : await getPostBySlug(db, slug);
  if (!post) return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });

  await deletePost(db, post.id);

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
