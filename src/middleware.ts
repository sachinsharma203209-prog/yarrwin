import { defineMiddleware } from 'astro:middleware';

/** Keep the Cloudflare Pages fallback host out of search indexes. */
export const onRequest = defineMiddleware(async ({ request }, next) => {
  const response = await next();
  const hostname = new URL(request.url).hostname.toLowerCase();

  if (hostname === 'yarrwin.pages.dev') {
    response.headers.set('X-Robots-Tag', 'noindex');
  }

  return response;
});
