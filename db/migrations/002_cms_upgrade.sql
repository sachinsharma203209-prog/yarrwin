-- 002_cms_upgrade.sql
-- Production CMS schema for yarrwin.online
-- Additive migration: creates new tables, alters existing ones.

-- ===== users table =====
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ===== categories: add SEO columns =====
ALTER TABLE categories ADD COLUMN seo_title TEXT NOT NULL DEFAULT '';
ALTER TABLE categories ADD COLUMN meta_description TEXT NOT NULL DEFAULT '';
ALTER TABLE categories ADD COLUMN deleted_at TEXT;

-- ===== posts: expand with full SEO + author + scheduling =====
ALTER TABLE posts ADD COLUMN featured_image_alt TEXT NOT NULL DEFAULT '';
ALTER TABLE posts ADD COLUMN author_id INTEGER;
ALTER TABLE posts ADD COLUMN scheduled_at TEXT;
ALTER TABLE posts ADD COLUMN seo_title TEXT NOT NULL DEFAULT '';
ALTER TABLE posts ADD COLUMN meta_description TEXT NOT NULL DEFAULT '';
ALTER TABLE posts ADD COLUMN canonical_url TEXT NOT NULL DEFAULT '';
ALTER TABLE posts ADD COLUMN robots_index INTEGER NOT NULL DEFAULT 1;
ALTER TABLE posts ADD COLUMN robots_follow INTEGER NOT NULL DEFAULT 1;
ALTER TABLE posts ADD COLUMN og_title TEXT NOT NULL DEFAULT '';
ALTER TABLE posts ADD COLUMN og_description TEXT NOT NULL DEFAULT '';
ALTER TABLE posts ADD COLUMN og_image_url TEXT NOT NULL DEFAULT '';
ALTER TABLE posts ADD COLUMN deleted_at TEXT;

-- ===== media table =====
CREATE TABLE IF NOT EXISTS media (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  imagekit_file_id TEXT NOT NULL DEFAULT '',
  filename TEXT NOT NULL,
  original_url TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL DEFAULT '',
  width INTEGER NOT NULL DEFAULT 0,
  height INTEGER NOT NULL DEFAULT 0,
  size_bytes INTEGER NOT NULL DEFAULT 0,
  mime_type TEXT NOT NULL DEFAULT '',
  alt_text TEXT NOT NULL DEFAULT '',
  uploaded_by INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at TEXT
);

-- ===== Indexes =====
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_deleted ON posts(deleted_at);
CREATE INDEX IF NOT EXISTS idx_categories_deleted ON categories(deleted_at);
CREATE INDEX IF NOT EXISTS idx_media_deleted ON media(deleted_at);
CREATE INDEX IF NOT EXISTS idx_media_mime ON media(mime_type);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ===== Seed default admin + site settings =====
INSERT OR IGNORE INTO users (name, email, password_hash, role)
VALUES ('Admin', 'admin@yarrwin.online', '', 'admin');

INSERT OR IGNORE INTO settings (key, value) VALUES
  ('site_name', 'Yarrwin'),
  ('site_url', 'https://yarrwin.online'),
  ('site_tagline', 'Online Gaming & Lottery Results'),
  ('default_seo_title', 'Yarrwin — Online Gaming & Lottery Results Platform'),
  ('default_meta_description', 'Check lottery results, discover gaming strategies, and read winner stories on Yarrwin — your trusted online gaming and lottery platform.'),
  ('default_og_image', '/og/default.png'),
  ('posts_per_page', '12'),
  ('timezone', 'Asia/Kolkata');
