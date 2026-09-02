/// <reference types="@astrojs/cloudflare" />
interface CloudflareEnv {
  readonly DB: D1Database;
  readonly IMAGEKIT_PUBLIC_KEY: string;
  readonly IMAGEKIT_PRIVATE_KEY: string;
  readonly IMAGEKIT_URL_ENDPOINT: string;
}
