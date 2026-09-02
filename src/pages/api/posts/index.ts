export const prerender = false;

import type { APIRoute } from "astro";
import { requireAdmin } from "../../../lib/guard";
import { getEnv } from "../../../lib/runtime";
import { listPosts, createPost } from "../../../lib/db";
import { postSchema } from "../../../lib/validate";

export const GET: APIRoute = async (context) => {
  const env = getEnv(context);
  const db = env.DB;
  if (!db) return new Response(JSON.stringify({ error: "DB unavailable" }), { status: 500 });

  const url = new URL(context.request.url);
  const page = Number(url.searchParams.get("page")) || 1;
  const perPage = Number(url.searchParams.get("perPage")) || 12;
  const status = url.searchParams.get("status") as any;
  const categoryId = url.searchParams.get("category_id") ? Number(url.searchParams.get("category_id")) : undefined;
  const search = url.searchParams.get("search") ?? undefined;

  const adminEnv = await requireAdmin(context);

  const result = await listPosts(db, {
    onlyPublished: !adminEnv,
    status: adminEnv && status ? status : undefined,
    categoryId,
    page,
    perPage,
    search,
  });

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

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

  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.flatten() }), { status: 400 });
  }

  const data = parsed.data;
  let post;
  try {
    post = await createPost(db, {
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      content: data.content,
      featured_image: data.featured_image,
      featured_image_alt: data.featured_image_alt,
      category_id: data.category_id ?? null,
      author_id: 1,
      status: data.status,
      scheduled_at: data.scheduled_at ?? undefined,
      seo_title: data.seo_title,
      meta_description: data.meta_description,
      canonical_url: data.canonical_url,
      robots_index: data.robots_index !== undefined ? (data.robots_index ? 1 : 0) : undefined,
      robots_follow: data.robots_follow !== undefined ? (data.robots_follow ? 1 : 0) : undefined,
      og_title: data.og_title,
      og_description: data.og_description,
      og_image_url: data.og_image_url,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create post";
    const friendly = message.includes("UNIQUE constraint failed: posts.slug")
      ? "A post with this slug already exists. Change the title or slug and try again."
      : message;
    return new Response(JSON.stringify({ error: friendly }), {
      status: message.includes("UNIQUE constraint") ? 409 : 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ post }), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
};
