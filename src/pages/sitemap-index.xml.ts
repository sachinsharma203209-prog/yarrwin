import type { APIRoute } from "astro";
import { sitemapIndex, SITE_URL, xmlHeaders, lastmod } from "../lib/sitemap";

export const GET: APIRoute = async () => {
  const now = lastmod(new Date().toISOString());
  const xml = sitemapIndex([
    { loc: `${SITE_URL}/sitemap-pages.xml`, lastmod: now },
    { loc: `${SITE_URL}/sitemap-posts.xml`, lastmod: now },
    { loc: `${SITE_URL}/sitemap-categories.xml`, lastmod: now },
  ]);
  return new Response(xml, { headers: xmlHeaders() });
};
