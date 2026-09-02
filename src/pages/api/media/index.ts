export const prerender = false;

import type { APIRoute } from "astro";
import { requireAdmin } from "../../../lib/guard";
import { getEnv } from "../../../lib/runtime";
import { listMedia, createMedia } from "../../../lib/db";
import ImageKit from "@imagekit/nodejs";

export const GET: APIRoute = async (context) => {
  const env = await requireAdmin(context);
  if (!env) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const db = env.DB;
  const url = new URL(context.request.url);
  const page = Number(url.searchParams.get("page")) || 1;
  const perPage = Number(url.searchParams.get("perPage")) || 24;
  const search = url.searchParams.get("search") ?? undefined;

  const result = await listMedia(db, { page, perPage, search });

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const POST: APIRoute = async (context) => {
  const env = await requireAdmin(context);
  if (!env) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const db = env.DB;

  const contentType = context.request.headers.get("content-type") || "";
  if (contentType.includes("multipart/form-data")) {
    const privateKey = env.IMAGEKIT_PRIVATE_KEY?.trim();
    if (!privateKey) {
      return new Response(JSON.stringify({ error: "ImageKit is not configured" }), { status: 500 });
    }

    const incoming = await context.request.formData();
    const file = incoming.get("file");
    if (!(file instanceof File) || !file.type.startsWith("image/")) {
      return new Response(JSON.stringify({ error: "A valid image file is required" }), { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: "Image must be smaller than 10 MB" }), { status: 400 });
    }

    let upload: any;
    try {
      const imagekit = new ImageKit({ privateKey });
      upload = await imagekit.files.upload({
        file,
        fileName: file.name,
        useUniqueFileName: true,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "ImageKit upload failed";
      return new Response(JSON.stringify({ error: message }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    const media = await createMedia(db, {
      filename: upload.name || file.name,
      original_url: upload.url,
      thumbnail_url: upload.thumbnailUrl || upload.url,
      imagekit_file_id: upload.fileId,
      width: upload.width ?? undefined,
      height: upload.height ?? undefined,
      size_bytes: upload.size ?? file.size,
      mime_type: file.type,
      alt_text: undefined,
      uploaded_by: 1,
    });

    return new Response(JSON.stringify({ media }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: unknown;
  try {
    body = await context.request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  const {
    filename,
    original_url,
    thumbnail_url,
    imagekit_file_id,
    width,
    height,
    size_bytes,
    mime_type,
    alt_text,
  } = body as any;

  if (!filename || !original_url || !imagekit_file_id || size_bytes == null || !mime_type) {
    return new Response(JSON.stringify({ error: "filename, original_url, imagekit_file_id, size_bytes, mime_type are required" }), { status: 400 });
  }

  const media = await createMedia(db, {
    filename,
    original_url,
    thumbnail_url,
    imagekit_file_id,
    width: width ?? undefined,
    height: height ?? undefined,
    size_bytes,
    mime_type,
    alt_text: alt_text ?? undefined,
    uploaded_by: 1,
  });

  return new Response(JSON.stringify({ media }), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
};
