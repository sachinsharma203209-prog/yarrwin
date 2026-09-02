import type {
  User,
  Category,
  Post,
  Media,
  Setting,
  PostStatus,
  CategoryStatus,
} from "./types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Generate a URL-safe, lowercase slug from arbitrary text. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const POST_SELECT = `
  SELECT p.*,
    c.name AS category_name,
    c.slug AS category_slug,
    u.name AS author_name
  FROM posts p
  LEFT JOIN categories c ON c.id = p.category_id
  LEFT JOIN users u ON u.id = p.author_id
`;

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export async function getUserById(
  db: D1Database,
  id: number
): Promise<User | null> {
  const row = await db
    .prepare("SELECT * FROM users WHERE id = ?")
    .bind(id)
    .first<User>();
  return row ?? null;
}

export async function getUserByEmail(
  db: D1Database,
  email: string
): Promise<User | null> {
  const row = await db
    .prepare("SELECT * FROM users WHERE email = ?")
    .bind(email)
    .first<User>();
  return row ?? null;
}

export async function createUser(
  db: D1Database,
  input: { name: string; email: string; password_hash: string; role?: string }
): Promise<User> {
  const role = input.role ?? "author";
  const res = await db
    .prepare(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES (?, ?, ?, ?)`
    )
    .bind(input.name, input.email, input.password_hash, role)
    .run();
  const row = await getUserById(db, Number(res.meta.last_row_id));
  if (!row) throw new Error("Failed to create user");
  return row;
}

export async function updateUser(
  db: D1Database,
  id: number,
  input: { name?: string; email?: string; is_active?: number }
): Promise<User | null> {
  const existing = await getUserById(db, id);
  if (!existing) return null;
  await db
    .prepare(
      `UPDATE users SET
        name = ?, email = ?, is_active = ?, updated_at = datetime('now')
       WHERE id = ?`
    )
    .bind(
      input.name ?? existing.name,
      input.email ?? existing.email,
      input.is_active ?? existing.is_active,
      id
    )
    .run();
  return getUserById(db, id);
}

export async function listUsers(db: D1Database): Promise<User[]> {
  const res = await db
    .prepare("SELECT * FROM users ORDER BY name ASC")
    .all<User>();
  return (res.results as User[]) ?? [];
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export async function listCategories(
  db: D1Database,
  opts: {
    onlyActive?: boolean;
    page?: number;
    perPage?: number;
    search?: string;
    includeDeleted?: boolean;
  } = {}
): Promise<{ categories: Category[]; total: number }> {
  const conditions: string[] = [];
  const bindings: unknown[] = [];

  if (!opts.includeDeleted) {
    conditions.push("deleted_at IS NULL");
  }
  if (opts.onlyActive) {
    conditions.push("status = 'active'");
  }
  if (opts.search) {
    conditions.push("name LIKE ?");
    bindings.push(`%${opts.search}%`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const page = opts.page ?? 1;
  const perPage = opts.perPage ?? 50;
  const offset = (page - 1) * perPage;

  const countRes = await db
    .prepare(`SELECT COUNT(*) AS n FROM categories ${where}`)
    .bind(...bindings)
    .first<{ n: number }>();
  const total = Number(countRes?.n ?? 0);

  const rows = await db
    .prepare(`SELECT * FROM categories ${where} ORDER BY name ASC LIMIT ? OFFSET ?`)
    .bind(...bindings, perPage, offset)
    .all<Category>();
  return { categories: (rows.results as Category[]) ?? [], total };
}

export async function getCategoryById(
  db: D1Database,
  id: number
): Promise<Category | null> {
  const row = await db
    .prepare("SELECT * FROM categories WHERE id = ? AND deleted_at IS NULL")
    .bind(id)
    .first<Category>();
  return row ?? null;
}

export async function getCategoryBySlug(
  db: D1Database,
  slug: string,
  opts: { onlyActive?: boolean } = {}
): Promise<Category | null> {
  const conditions = ["slug = ?", "deleted_at IS NULL"];
  const bindings: unknown[] = [slug];

  if (opts.onlyActive) {
    conditions.push("status = 'active'");
  }

  const row = await db
    .prepare(`SELECT * FROM categories WHERE ${conditions.join(" AND ")}`)
    .bind(...bindings)
    .first<Category>();
  return row ?? null;
}

export async function createCategory(
  db: D1Database,
  input: {
    name: string;
    slug?: string;
    description?: string;
    seo_title?: string;
    meta_description?: string;
    status?: CategoryStatus;
  }
): Promise<Category> {
  const slug = input.slug || slugify(input.name);
  if (!slug) throw new Error("Category name must produce a valid slug");
  const status = input.status ?? "active";
  const res = await db
    .prepare(
      `INSERT INTO categories (name, slug, description, seo_title, meta_description, status)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .bind(
      input.name,
      slug,
      input.description ?? null,
      input.seo_title ?? null,
      input.meta_description ?? null,
      status
    )
    .run();
  const row = await getCategoryById(db, Number(res.meta.last_row_id));
  if (!row) throw new Error("Failed to create category");
  return row;
}

export async function updateCategory(
  db: D1Database,
  id: number,
  input: {
    name?: string;
    slug?: string;
    description?: string;
    seo_title?: string;
    meta_description?: string;
    status?: CategoryStatus;
  }
): Promise<Category | null> {
  const existing = await getCategoryById(db, id);
  if (!existing) return null;
  const slug = input.slug || existing.slug;
  await db
    .prepare(
      `UPDATE categories SET
        name = ?, slug = ?, description = ?,
        seo_title = ?, meta_description = ?,
        status = ?, updated_at = datetime('now')
       WHERE id = ?`
    )
    .bind(
      input.name ?? existing.name,
      slug,
      input.description === undefined ? existing.description : input.description,
      input.seo_title === undefined ? existing.seo_title : input.seo_title,
      input.meta_description === undefined ? existing.meta_description : input.meta_description,
      input.status ?? existing.status,
      id
    )
    .run();
  return getCategoryById(db, id);
}

export async function deleteCategory(
  db: D1Database,
  id: number
): Promise<boolean> {
  const res = await db
    .prepare("UPDATE categories SET deleted_at = datetime('now') WHERE id = ? AND deleted_at IS NULL")
    .bind(id)
    .run();
  return res.meta.changes > 0;
}

export async function categorySlugExists(
  db: D1Database,
  slug: string,
  excludeId?: number
): Promise<boolean> {
  if (excludeId) {
    const row = await db
      .prepare("SELECT 1 FROM categories WHERE slug = ? AND id != ? AND deleted_at IS NULL")
      .bind(slug, excludeId)
      .first();
    return !!row;
  }
  const row = await db
    .prepare("SELECT 1 FROM categories WHERE slug = ? AND deleted_at IS NULL")
    .bind(slug)
    .first();
  return !!row;
}

export async function countPostsByCategory(
  db: D1Database,
  categoryId: number
): Promise<number> {
  const row = await db
    .prepare("SELECT COUNT(*) AS n FROM posts WHERE category_id = ? AND deleted_at IS NULL")
    .bind(categoryId)
    .first<{ n: number }>();
  return Number(row?.n ?? 0);
}

// ---------------------------------------------------------------------------
// Posts
// ---------------------------------------------------------------------------

export async function listPosts(
  db: D1Database,
  opts: {
    status?: PostStatus;
    categoryId?: number;
    authorId?: number;
    page?: number;
    perPage?: number;
    search?: string;
    onlyPublished?: boolean;
  } = {}
): Promise<{ posts: Post[]; total: number }> {
  const conditions: string[] = ["p.deleted_at IS NULL"];
  const bindings: unknown[] = [];

  if (opts.onlyPublished) {
    conditions.push("p.status = 'published'");
  } else if (opts.status) {
    conditions.push("p.status = ?");
    bindings.push(opts.status);
  }

  if (opts.categoryId) {
    conditions.push("p.category_id = ?");
    bindings.push(opts.categoryId);
  }

  if (opts.authorId) {
    conditions.push("p.author_id = ?");
    bindings.push(opts.authorId);
  }

  if (opts.search) {
    conditions.push("(p.title LIKE ? OR p.excerpt LIKE ?)");
    bindings.push(`%${opts.search}%`, `%${opts.search}%`);
  }

  const where = `WHERE ${conditions.join(" AND ")}`;
  const page = opts.page ?? 1;
  const perPage = opts.perPage ?? 12;
  const offset = (page - 1) * perPage;

  const countRes = await db
    .prepare(`SELECT COUNT(*) AS n FROM posts p ${where}`)
    .bind(...bindings)
    .first<{ n: number }>();
  const total = Number(countRes?.n ?? 0);

  const rows = await db
    .prepare(
      `${POST_SELECT} ${where} ORDER BY COALESCE(p.published_at, p.created_at) DESC LIMIT ? OFFSET ?`
    )
    .bind(...bindings, perPage, offset)
    .all<Post>();
  return { posts: (rows.results as Post[]) ?? [], total };
}

export async function getPostById(
  db: D1Database,
  id: number,
  opts: { includeDeleted?: boolean } = {}
): Promise<Post | null> {
  const deletedCondition = opts.includeDeleted ? "" : "AND p.deleted_at IS NULL";
  const row = await db
    .prepare(`${POST_SELECT} WHERE p.id = ? ${deletedCondition}`)
    .bind(id)
    .first<Post>();
  return row ?? null;
}

export async function getPostBySlug(
  db: D1Database,
  slug: string,
  opts: { publishedOnly?: boolean } = {}
): Promise<Post | null> {
  const conditions = ["p.slug = ?", "p.deleted_at IS NULL"];
  const bindings: unknown[] = [slug];

  if (opts.publishedOnly) {
    conditions.push("p.status = 'published'");
  }

  const row = await db
    .prepare(`${POST_SELECT} WHERE ${conditions.join(" AND ")}`)
    .bind(...bindings)
    .first<Post>();
  return row ?? null;
}

export async function createPost(
  db: D1Database,
  input: {
    title: string;
    slug?: string;
    excerpt?: string;
    content?: string;
    featured_image?: string;
    featured_image_alt?: string;
    category_id?: number | null;
    author_id: number;
    status?: PostStatus;
    scheduled_at?: string;
    seo_title?: string;
    meta_description?: string;
    canonical_url?: string;
    robots_index?: number;
    robots_follow?: number;
    og_title?: string;
    og_description?: string;
    og_image_url?: string;
  }
): Promise<Post> {
  const slug = input.slug || slugify(input.title);
  if (!slug) throw new Error("Post title must produce a valid slug");
  const status = input.status ?? "draft";

  let publishedAt: string | null = null;
  if (status === "published") {
    publishedAt = new Date().toISOString();
  }

  const res = await db
    .prepare(
      `INSERT INTO posts (
        title, slug, excerpt, content,
        featured_image, featured_image_alt,
        category_id, author_id, status,
        published_at, scheduled_at,
        seo_title, meta_description, canonical_url,
        robots_index, robots_follow,
        og_title, og_description, og_image_url
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      input.title,
      slug,
      input.excerpt ?? "",
      input.content ?? "",
      input.featured_image ?? "",
      input.featured_image_alt ?? "",
      input.category_id ?? null,
      input.author_id,
      status,
      publishedAt,
      input.scheduled_at ?? null,
      input.seo_title ?? "",
      input.meta_description ?? "",
      input.canonical_url ?? "",
      input.robots_index ?? 1,
      input.robots_follow ?? 1,
      input.og_title ?? "",
      input.og_description ?? "",
      input.og_image_url ?? ""
    )
    .run();
  const row = await getPostById(db, Number(res.meta.last_row_id));
  if (!row) throw new Error("Failed to create post");
  return row;
}

export async function updatePost(
  db: D1Database,
  id: number,
  input: {
    title?: string;
    slug?: string;
    excerpt?: string;
    content?: string;
    featured_image?: string;
    featured_image_alt?: string;
    category_id?: number | null;
    status?: PostStatus;
    scheduled_at?: string;
    seo_title?: string;
    meta_description?: string;
    canonical_url?: string;
    robots_index?: number;
    robots_follow?: number;
    og_title?: string;
    og_description?: string;
    og_image_url?: string;
  }
): Promise<Post | null> {
  const existing = await getPostById(db, id);
  if (!existing) return null;

  const status = input.status ?? existing.status;
  const slug = input.slug || existing.slug || slugify(input.title || existing.title);

  let publishedAt: string | null = existing.published_at;
  if (status === "published" && existing.status !== "published") {
    publishedAt = new Date().toISOString();
  } else if (status === "draft") {
    publishedAt = null;
  }

  await db
    .prepare(
      `UPDATE posts SET
        title = ?, slug = ?, excerpt = ?, content = ?,
        featured_image = ?, featured_image_alt = ?,
        category_id = ?, status = ?,
        published_at = ?, scheduled_at = ?,
        seo_title = ?, meta_description = ?, canonical_url = ?,
        robots_index = ?, robots_follow = ?,
        og_title = ?, og_description = ?, og_image_url = ?,
        updated_at = datetime('now')
       WHERE id = ?`
    )
    .bind(
      input.title ?? existing.title,
      slug,
      input.excerpt === undefined ? existing.excerpt : input.excerpt,
      input.content === undefined ? existing.content : input.content,
      input.featured_image === undefined ? existing.featured_image : input.featured_image,
      input.featured_image_alt === undefined ? existing.featured_image_alt : input.featured_image_alt,
      input.category_id === undefined ? existing.category_id : input.category_id,
      status,
      publishedAt,
      input.scheduled_at === undefined ? existing.scheduled_at : input.scheduled_at,
      input.seo_title === undefined ? existing.seo_title : input.seo_title,
      input.meta_description === undefined ? existing.meta_description : input.meta_description,
      input.canonical_url === undefined ? existing.canonical_url : input.canonical_url,
      input.robots_index === undefined ? existing.robots_index : input.robots_index,
      input.robots_follow === undefined ? existing.robots_follow : input.robots_follow,
      input.og_title === undefined ? existing.og_title : input.og_title,
      input.og_description === undefined ? existing.og_description : input.og_description,
      input.og_image_url === undefined ? existing.og_image_url : input.og_image_url,
      id
    )
    .run();
  return getPostById(db, id);
}

export async function deletePost(
  db: D1Database,
  id: number
): Promise<boolean> {
  const res = await db
    .prepare("UPDATE posts SET deleted_at = datetime('now') WHERE id = ? AND deleted_at IS NULL")
    .bind(id)
    .run();
  return res.meta.changes > 0;
}

export async function postSlugExists(
  db: D1Database,
  slug: string,
  excludeId?: number
): Promise<boolean> {
  if (excludeId) {
    const row = await db
      .prepare("SELECT 1 FROM posts WHERE slug = ? AND id != ? AND deleted_at IS NULL")
      .bind(slug, excludeId)
      .first();
    return !!row;
  }
  const row = await db
    .prepare("SELECT 1 FROM posts WHERE slug = ? AND deleted_at IS NULL")
    .bind(slug)
    .first();
  return !!row;
}

export async function countPosts(
  db: D1Database,
  opts: { status?: PostStatus } = {}
): Promise<number> {
  const conditions = ["deleted_at IS NULL"];
  const bindings: unknown[] = [];

  if (opts.status) {
    conditions.push("status = ?");
    bindings.push(opts.status);
  }

  const where = `WHERE ${conditions.join(" AND ")}`;
  const row = await db
    .prepare(`SELECT COUNT(*) AS n FROM posts ${where}`)
    .bind(...bindings)
    .first<{ n: number }>();
  return Number(row?.n ?? 0);
}

export async function listPostsByCategory(
  db: D1Database,
  categorySlug: string,
  opts: { page?: number; perPage?: number } = {}
): Promise<{ posts: Post[]; total: number }> {
  const page = opts.page ?? 1;
  const perPage = opts.perPage ?? 12;
  const offset = (page - 1) * perPage;

  const countRes = await db
    .prepare(
      `SELECT COUNT(*) AS n FROM posts p
       JOIN categories c ON c.id = p.category_id
       WHERE c.slug = ? AND p.status = 'published' AND p.deleted_at IS NULL AND c.deleted_at IS NULL`
    )
    .bind(categorySlug)
    .first<{ n: number }>();
  const total = Number(countRes?.n ?? 0);

  const rows = await db
    .prepare(
      `${POST_SELECT}
       WHERE c.slug = ? AND p.status = 'published' AND p.deleted_at IS NULL AND c.deleted_at IS NULL
       ORDER BY COALESCE(p.published_at, p.created_at) DESC
       LIMIT ? OFFSET ?`
    )
    .bind(categorySlug, perPage, offset)
    .all<Post>();
  return { posts: (rows.results as Post[]) ?? [], total };
}

export async function getRecentPosts(
  db: D1Database,
  limit: number = 5
): Promise<Post[]> {
  const res = await db
    .prepare(
      `${POST_SELECT}
       WHERE p.status = 'published' AND p.deleted_at IS NULL
       ORDER BY COALESCE(p.published_at, p.created_at) DESC
       LIMIT ?`
    )
    .bind(limit)
    .all<Post>();
  return (res.results as Post[]) ?? [];
}

export async function getPostStats(
  db: D1Database
): Promise<{ total: number; published: number; draft: number; scheduled: number }> {
  const rows = await db
    .prepare(
      `SELECT status, COUNT(*) AS n FROM posts WHERE deleted_at IS NULL GROUP BY status`
    )
    .all<{ status: PostStatus; n: number }>();

  const stats = { total: 0, published: 0, draft: 0, scheduled: 0 };
  for (const row of rows.results ?? []) {
    const n = Number(row.n);
    stats.total += n;
    if (row.status === "published") stats.published = n;
    else if (row.status === "draft") stats.draft = n;
    else if (row.status === "scheduled") stats.scheduled = n;
  }
  return stats;
}

// ---------------------------------------------------------------------------
// Media
// ---------------------------------------------------------------------------

export async function listMedia(
  db: D1Database,
  opts: { page?: number; perPage?: number; search?: string } = {}
): Promise<{ media: Media[]; total: number }> {
  const conditions: string[] = ["deleted_at IS NULL"];
  const bindings: unknown[] = [];

  if (opts.search) {
    conditions.push("(filename LIKE ? OR alt_text LIKE ?)");
    bindings.push(`%${opts.search}%`, `%${opts.search}%`);
  }

  const where = `WHERE ${conditions.join(" AND ")}`;
  const page = opts.page ?? 1;
  const perPage = opts.perPage ?? 24;
  const offset = (page - 1) * perPage;

  const countRes = await db
    .prepare(`SELECT COUNT(*) AS n FROM media ${where}`)
    .bind(...bindings)
    .first<{ n: number }>();
  const total = Number(countRes?.n ?? 0);

  const rows = await db
    .prepare(`SELECT * FROM media ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
    .bind(...bindings, perPage, offset)
    .all<Media>();
  return { media: (rows.results as Media[]) ?? [], total };
}

export async function getMediaById(
  db: D1Database,
  id: number
): Promise<Media | null> {
  const row = await db
    .prepare("SELECT * FROM media WHERE id = ? AND deleted_at IS NULL")
    .bind(id)
    .first<Media>();
  return row ?? null;
}

export async function createMedia(
  db: D1Database,
  input: {
    imagekit_file_id: string;
    filename: string;
    original_url: string;
    thumbnail_url?: string;
    width?: number;
    height?: number;
    size_bytes: number;
    mime_type: string;
    alt_text?: string;
    uploaded_by: number;
  }
): Promise<Media> {
  const res = await db
    .prepare(
      `INSERT INTO media (
        imagekit_file_id, filename, original_url, thumbnail_url,
        width, height, size_bytes, mime_type, alt_text, uploaded_by
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      input.imagekit_file_id,
      input.filename,
      input.original_url,
      input.thumbnail_url ?? "",
      input.width ?? 0,
      input.height ?? 0,
      input.size_bytes,
      input.mime_type,
      input.alt_text ?? "",
      input.uploaded_by
    )
    .run();
  const row = await getMediaById(db, Number(res.meta.last_row_id));
  if (!row) throw new Error("Failed to create media");
  return row;
}

export async function updateMedia(
  db: D1Database,
  id: number,
  input: { alt_text?: string }
): Promise<Media | null> {
  const existing = await getMediaById(db, id);
  if (!existing) return null;
  await db
    .prepare(
      `UPDATE media SET alt_text = ? WHERE id = ?`
    )
    .bind(
      input.alt_text === undefined ? existing.alt_text : input.alt_text,
      id
    )
    .run();
  return getMediaById(db, id);
}

export async function deleteMedia(
  db: D1Database,
  id: number
): Promise<boolean> {
  const res = await db
    .prepare("UPDATE media SET deleted_at = datetime('now') WHERE id = ? AND deleted_at IS NULL")
    .bind(id)
    .run();
  return res.meta.changes > 0;
}

export async function countMedia(db: D1Database): Promise<number> {
  const row = await db
    .prepare("SELECT COUNT(*) AS n FROM media WHERE deleted_at IS NULL")
    .first<{ n: number }>();
  return Number(row?.n ?? 0);
}

export async function isMediaUsedByPost(
  db: D1Database,
  mediaId: number
): Promise<boolean> {
  const media = await getMediaById(db, mediaId);
  if (!media) return false;
  const row = await db
    .prepare(
      `SELECT 1 FROM posts
       WHERE (featured_image = ? OR og_image_url = ?)
       AND deleted_at IS NULL
       LIMIT 1`
    )
    .bind(media.original_url, media.original_url)
    .first();
  return !!row;
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export async function getSetting(
  db: D1Database,
  key: string
): Promise<string | null> {
  const row = await db
    .prepare("SELECT value FROM settings WHERE key = ?")
    .bind(key)
    .first<Setting>();
  return row?.value ?? null;
}

export async function setSetting(
  db: D1Database,
  key: string,
  value: string
): Promise<void> {
  await db
    .prepare(
      "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
    )
    .bind(key, value)
    .run();
}

export async function getSettings(
  db: D1Database
): Promise<Record<string, string>> {
  const res = await db.prepare("SELECT * FROM settings").all<Setting>();
  const settings: Record<string, string> = {};
  for (const row of (res.results as Setting[]) ?? []) {
    settings[row.key] = row.value;
  }
  return settings;
}

export async function updateSettings(
  db: D1Database,
  settings: Record<string, string>
): Promise<void> {
  const stmts = Object.entries(settings).map(([key, value]) =>
    db
      .prepare(
        "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
      )
      .bind(key, value)
  );
  await db.batch(stmts);
}
