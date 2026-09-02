export const prerender = false;

import type { APIRoute } from "astro";
import { requireAdmin } from "../../../lib/guard";
import { getImageKitAuth } from "../../../lib/imagekit";

export const GET: APIRoute = async (context) => {
  const env = await requireAdmin(context);
  if (!env) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const privateKey = env.IMAGEKIT_PRIVATE_KEY;
  const publicKey = env.IMAGEKIT_PUBLIC_KEY;
  const urlEndpoint = env.IMAGEKIT_URL_ENDPOINT;

  if (!privateKey || !publicKey || !urlEndpoint) {
    return new Response(JSON.stringify({ error: "ImageKit not configured" }), { status: 500 });
  }

  const auth = await getImageKitAuth(privateKey, publicKey, urlEndpoint);

  return new Response(JSON.stringify(auth), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
