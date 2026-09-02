export const prerender = false;

import type { APIRoute } from "astro";
import { requireAdmin } from "../../../lib/guard";
import { getPostStats, listPosts, listCategories, countMedia } from "../../../lib/db";

export const GET: APIRoute = async (context) => {
  const env = await requireAdmin(context);
  if (!env) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const db = env.DB;

  const postStats = await getPostStats(db);
  const totalCategories = (await listCategories(db, { perPage: 1 })).total;
  const totalMedia = await countMedia(db);

  const { posts: recentPosts } = await listPosts(db, { perPage: 5 });
  const { posts: recentPublished } = await listPosts(db, { onlyPublished: true, perPage: 5 });

  return new Response(JSON.stringify({
    totalPosts: postStats.total,
    publishedPosts: postStats.published,
    draftPosts: postStats.draft,
    scheduledPosts: postStats.scheduled,
    totalCategories,
    totalMedia,
    recentPosts,
    recentPublished,
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
