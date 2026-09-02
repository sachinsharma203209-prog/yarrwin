export const prerender = false;

import type { APIRoute } from "astro";
import { requireAdmin } from "../../../../lib/guard";
import { getPostById, getPostBySlug, createPost, slugify, postSlugExists } from "../../../../lib/db";

export const POST: APIRoute = async (context) => {
  const env = await requireAdmin(context);
  if (!env) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const db = env.DB;
  const slug = context.params.post;
  if (!slug) return new Response(JSON.stringify({ error: "Missing post param" }), { status: 400 });

  const numId = Number(slug);
  const original = !isNaN(numId) && numId > 0
    ? await getPostById(db, numId)
    : await getPostBySlug(db, slug);
  if (!original) return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });

  let newSlug = slugify(`copy-of-${original.title}`);
  let counter = 1;
  while (await postSlugExists(db, newSlug)) {
    newSlug = slugify(`copy-of-${original.title}-${counter}`);
    counter++;
  }

  const duplicate = await createPost(db, {
    title: `Copy of ${original.title}`,
    slug: newSlug,
    excerpt: original.excerpt ?? undefined,
    content: original.content ?? undefined,
    featured_image: original.featured_image ?? undefined,
    featured_image_alt: original.featured_image_alt ?? undefined,
    category_id: original.category_id,
    author_id: original.author_id,
    status: "draft",
    seo_title: original.seo_title ?? undefined,
    meta_description: original.meta_description ?? undefined,
    canonical_url: original.canonical_url ?? undefined,
    robots_index: original.robots_index ?? undefined,
    robots_follow: original.robots_follow ?? undefined,
    og_title: original.og_title ?? undefined,
    og_description: original.og_description ?? undefined,
    og_image_url: original.og_image_url ?? undefined,
  });

  return new Response(JSON.stringify({ post: duplicate }), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
};
