import type { APIRoute } from "astro";
import { lastmod, SITE_URL, urlset, xmlHeaders } from "../lib/sitemap";

const now = lastmod(new Date().toISOString());

const pages: Array<{ path: string; priority: string; changefreq: string }> = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/blog/", priority: "0.9", changefreq: "daily" },
  { path: "/games/", priority: "0.9", changefreq: "weekly" },
  { path: "/games/wingo/", priority: "0.8", changefreq: "monthly" },
  { path: "/games/k3/", priority: "0.8", changefreq: "monthly" },
  { path: "/games/5d/", priority: "0.8", changefreq: "monthly" },
  { path: "/games/aviator/", priority: "0.8", changefreq: "monthly" },
  { path: "/results/", priority: "0.9", changefreq: "daily" },
  { path: "/results/wingo/", priority: "0.8", changefreq: "monthly" },
  { path: "/results/k3/", priority: "0.8", changefreq: "monthly" },
  { path: "/results/5d/", priority: "0.8", changefreq: "monthly" },
  { path: "/guide/how-to-play/", priority: "0.8", changefreq: "monthly" },
  { path: "/transactions/", priority: "0.8", changefreq: "weekly" },
  { path: "/transactions/deposit/", priority: "0.7", changefreq: "monthly" },
  { path: "/transactions/withdrawal-pending/", priority: "0.7", changefreq: "monthly" },
  { path: "/transactions/withdrawal-rejected/", priority: "0.7", changefreq: "monthly" },
  { path: "/transactions/payment-failed/", priority: "0.7", changefreq: "monthly" },
  { path: "/transactions/money-debited/", priority: "0.7", changefreq: "monthly" },
  { path: "/transactions/history/", priority: "0.7", changefreq: "monthly" },
  { path: "/transactions/payment-safety/", priority: "0.7", changefreq: "monthly" },
  { path: "/transactions/bonus-terms/", priority: "0.7", changefreq: "monthly" },
  { path: "/troubleshooting/", priority: "0.8", changefreq: "weekly" },
  { path: "/troubleshooting/login-not-working/", priority: "0.7", changefreq: "monthly" },
  { path: "/troubleshooting/otp-not-received/", priority: "0.7", changefreq: "monthly" },
  { path: "/troubleshooting/forgot-password/", priority: "0.7", changefreq: "monthly" },
  { path: "/troubleshooting/account-locked/", priority: "0.7", changefreq: "monthly" },
  { path: "/troubleshooting/app-not-installing/", priority: "0.7", changefreq: "monthly" },
  { path: "/troubleshooting/app-not-opening/", priority: "0.7", changefreq: "monthly" },
  { path: "/troubleshooting/site-not-loading/", priority: "0.7", changefreq: "monthly" },
  { path: "/troubleshooting/gift-code-not-working/", priority: "0.7", changefreq: "monthly" },
  { path: "/troubleshooting/result-not-showing/", priority: "0.7", changefreq: "monthly" },
  { path: "/troubleshooting/withdrawal-problem/", priority: "0.7", changefreq: "monthly" },
  { path: "/troubleshooting/fake-support/", priority: "0.7", changefreq: "monthly" },
  { path: "/about/", priority: "0.7", changefreq: "monthly" },
  { path: "/login/", priority: "0.6", changefreq: "monthly" },
  { path: "/register/", priority: "0.6", changefreq: "monthly" },
  { path: "/app-download/", priority: "0.6", changefreq: "monthly" },
  { path: "/gift-code/", priority: "0.6", changefreq: "monthly" },
  { path: "/withdrawal/", priority: "0.6", changefreq: "monthly" },
  { path: "/support/", priority: "0.6", changefreq: "monthly" },
  { path: "/real-or-fake/", priority: "0.6", changefreq: "monthly" },
  { path: "/responsible-gaming/", priority: "0.6", changefreq: "monthly" },
  { path: "/contact/", priority: "0.5", changefreq: "monthly" },
  { path: "/privacy/", priority: "0.4", changefreq: "yearly" },
  { path: "/terms/", priority: "0.4", changefreq: "yearly" },
  { path: "/affiliate-disclosure/", priority: "0.4", changefreq: "yearly" },
  { path: "/disclaimer/", priority: "0.4", changefreq: "yearly" },
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
