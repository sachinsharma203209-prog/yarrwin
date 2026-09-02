import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name must be 200 characters or less'),
  slug: z.string().optional(),
  description: z.string().optional(),
  seo_title: z.string().optional(),
  meta_description: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
});

export const postSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500, 'Title must be 500 characters or less'),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  featured_image: z.string().optional(),
  featured_image_alt: z.string().optional(),
  category_id: z.number().optional().nullable(),
  status: z.enum(['draft', 'published', 'scheduled']).default('draft'),
  scheduled_at: z.string().optional().nullable(),
  seo_title: z.string().optional(),
  meta_description: z.string().optional(),
  canonical_url: z.string().optional(),
  robots_index: z.boolean().optional(),
  robots_follow: z.boolean().optional(),
  og_title: z.string().optional(),
  og_description: z.string().optional(),
  og_image_url: z.string().optional(),
});

export const mediaSchema = z.object({
  alt_text: z.string().optional(),
});

export const settingsSchema = z.record(z.string(), z.string());

export type LoginInput = z.infer<typeof loginSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type PostInput = z.infer<typeof postSchema>;
export type MediaInput = z.infer<typeof mediaSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
