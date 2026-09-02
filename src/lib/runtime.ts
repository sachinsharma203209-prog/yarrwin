import type { APIContext } from "astro";

export interface AppEnv extends CloudflareEnv {}

export function getEnv(context: APIContext): AppEnv {
  const runtime = context.locals.runtime as { env: CloudflareEnv } | undefined;
  return runtime?.env ?? ({} as CloudflareEnv);
}
