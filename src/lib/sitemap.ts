// Helpers for the automated sitemap system (WordPress-style).

export const SITE_URL = "https://yarrwin.online";

export function lastmod(date: string | null): string {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  // Format as YYYY-MM-DD (sitemap W3C date)
  return d.toISOString().slice(0, 10);
}

export function urlset(body: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}</urlset>`;
}

export function sitemapIndex(sitemaps: Array<{ loc: string; lastmod: string }>): string {
  const body = sitemaps
    .map(
      (s) =>
        `  <sitemap>\n    <loc>${s.loc}</loc>\n${s.lastmod ? `    <lastmod>${s.lastmod}</lastmod>\n` : ""}  </sitemap>`
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</sitemapindex>`;
}

export function xmlHeaders(): Headers {
  return new Headers({ "Content-Type": "application/xml; charset=utf-8" });
}
