export const prerender = false;

import type { APIRoute } from "astro";
import { requireAdmin } from "../../../lib/guard";
import { getEnv } from "../../../lib/runtime";
import { listCategories, createCategory } from "../../../lib/db";
import { categorySchema } from "../../../lib/validate";

export const GET: APIRoute = async (context) => {
  const env = getEnv(context);
  const db = env.DB;
  if (!db) return new Response(JSON.stringify({ error: "DB unavailable" }), { status: 500 });

  const url = new URL(context.request.url);
  const page = Number(url.searchParams.get("page")) || 1;
  const perPage = Number(url.searchParams.get("perPage")) || 50;
  const search = url.searchParams.get("search") ?? undefined;

  const adminEnv = await requireAdmin(context);

  const result = await listCategories(db, {
    onlyActive: !adminEnv,
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

  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.flatten() }), { status: 400 });
  }

  const data = parsed.data;
  const category = await createCategory(db, {
    name: data.name,
    slug: data.slug,
    description: data.description,
    seo_title: data.seo_title,
    meta_description: data.meta_description,
    status: data.status,
  });

  return new Response(JSON.stringify({ category }), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
};
