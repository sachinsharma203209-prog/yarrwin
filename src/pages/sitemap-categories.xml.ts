import type { APIRoute, APIContext } from "astro";
import { lastmod, SITE_URL, urlset, xmlHeaders } from "../lib/sitemap";
import { listCategories } from "../lib/db";

export const GET: APIRoute = async (context: APIContext) => {
  const env = context.locals.runtime?.env as CloudflareEnv | undefined;
  if (!env) return new Response("Database not configured", { status: 500 });

  const { categories } = await listCategories(env.DB, { onlyActive: true });
  const body = categories
    .map((c) => {
      const lm = lastmod(c.updated_at || c.created_at);
      return (
        `  <url>\n    <loc>${SITE_URL}/category/${c.slug}/</loc>\n` +
        (lm ? `    <lastmod>${lm}</lastmod>\n` : "") +
        `    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>`
      );
    })
    .join("\n");
  return new Response(urlset(body), { headers: xmlHeaders() });
};
