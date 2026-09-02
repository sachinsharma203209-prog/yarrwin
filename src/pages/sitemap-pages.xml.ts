import type { APIRoute } from "astro";
import { lastmod, SITE_URL, urlset, xmlHeaders } from "../lib/sitemap";

const now = lastmod(new Date().toISOString());

const pages: Array<{ path: string; priority: string; changefreq: string }> = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/blog/", priority: "0.9", changefreq: "daily" },
  { path: "/about/", priority: "0.7", changefreq: "monthly" },
];

export const GET: APIRoute = async () => {
  const body = pages
    .map(
      (p) =>
        `  <url>\n    <loc>${SITE_URL}${p.path}</loc>\n` +
        `    <lastmod>${now}</lastmod>\n    <changefreq>${p.changefreq}</changefreq>\n` +
        `    <priority>${p.priority}</priority>\n  </url>`
    )
    .join("\n");
  return new Response(urlset(body), { headers: xmlHeaders() });
};
