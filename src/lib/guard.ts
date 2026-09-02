import type { APIContext } from "astro";
import { getEnv } from "./runtime";
import { verifySessionToken, parseCookies } from "./auth";

/**
 * Guard for admin API routes. Returns the Cloudflare env if the request
 * carries a valid admin session cookie, otherwise null (caller should
 * respond 401).
 */
export async function requireAdmin(context: APIContext): Promise<CloudflareEnv | null> {
  // In server routes, APIContext.locals carries the runtime; getEnv uses it.
  const runtime = context.locals.runtime as { env: CloudflareEnv } | undefined;
  if (!runtime?.env) return null;
  const cookies = parseCookies(context.request.headers.get("cookie"));
  const ok = await verifySessionToken(runtime.env.DB, cookies["yarrwin_session"]);
  return ok ? runtime.env : null;
}
