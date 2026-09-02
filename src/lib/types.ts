export interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  seo_title: string | null;
  meta_description: string | null;
  status: CategoryStatus;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  featured_image: string | null;
  featured_image_alt: string | null;
  category_id: number | null;
  author_id: number;
  status: PostStatus;
  published_at: string | null;
  scheduled_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  seo_title: string | null;
  meta_description: string | null;
  canonical_url: string | null;
  robots_index: number | null;
  robots_follow: number | null;
  og_title: string | null;
  og_description: string | null;
  og_image_url: string | null;
  category_name?: string;
  category_slug?: string;
  author_name?: string;
}

export interface Media {
  id: number;
  imagekit_file_id: string;
  filename: string;
  original_url: string;
  thumbnail_url: string | null;
  width: number | null;
  height: number | null;
  size_bytes: number;
  mime_type: string;
  alt_text: string | null;
  uploaded_by: number;
  created_at: string;
  deleted_at: string | null;
}

export interface Setting {
  key: string;
  value: string;
}

export type PostStatus = 'draft' | 'published' | 'scheduled';
export type CategoryStatus = 'active' | 'inactive';
