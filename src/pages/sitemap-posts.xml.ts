import type { APIRoute, APIContext } from "astro";
import { lastmod, SITE_URL, urlset, xmlHeaders } from "../lib/sitemap";
import { listPosts } from "../lib/db";

export const GET: APIRoute = async (context: APIContext) => {
  const env = context.locals.runtime?.env as CloudflareEnv | undefined;
  if (!env) return new Response("Database not configured", { status: 500 });

  const { posts } = await listPosts(env.DB, { onlyPublished: true, perPage: 10000 });
  const body = posts
    .map((p) => {
      const lm = lastmod(p.updated_at || p.published_at);
      return (
        `  <url>\n    <loc>${SITE_URL}/blog/${p.slug}/</loc>\n` +
        (lm ? `    <lastmod>${lm}</lastmod>\n` : "") +
        `    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`
      );
    })
    .join("\n");
  return new Response(urlset(body), { headers: xmlHeaders() });
};
