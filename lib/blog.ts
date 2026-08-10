import type { SupabaseClient } from '@supabase/supabase-js'

export const SITE_URL = 'https://www.menuberg.com'

// ============================================================================
// Types
// ============================================================================

export type PostStatus = 'draft' | 'published' | 'archived'

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  created_at: string
}

export interface BlogAuthor {
  id: string
  name: string
  avatar_url: string | null
  bio: string | null
  created_at: string
}

/** Shape returned by public-facing queries (hits the `posts_public` view — never has research_notes). */
export interface Post {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  cover_image: string | null
  author_id: string | null
  category_id: string | null
  status: PostStatus
  published_at: string | null
  created_at: string
  updated_at: string
  seo_title: string | null
  seo_description: string | null
  canonical_url: string | null
  featured: boolean
  reading_time: number | null
  category?: Category | null
  author?: BlogAuthor | null
}

/** Shape used in the admin dashboard — includes research_notes and every status. */
export interface AdminPost extends Post {
  research_notes: string | null
}

export interface PostInput {
  title: string
  slug: string
  excerpt?: string | null
  content: string
  cover_image?: string | null
  author_id?: string | null
  category_id?: string | null
  status?: PostStatus
  seo_title?: string | null
  seo_description?: string | null
  canonical_url?: string | null
  featured?: boolean
  research_notes?: string | null
}

const PUBLIC_POST_COLUMNS =
  'id, title, slug, excerpt, content, cover_image, author_id, category_id, status, published_at, created_at, updated_at, seo_title, seo_description, canonical_url, featured, reading_time, category:blog_categories(id, name, slug, description, created_at), author:blog_authors(id, name, avatar_url, bio, created_at)'

const ADMIN_POST_COLUMNS = `${PUBLIC_POST_COLUMNS}, research_notes`

// ============================================================================
// Utilities (no DB access)
// ============================================================================

/** Turns a title into a URL-safe slug. Does not guarantee uniqueness — see generateUniqueSlug. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // strip accents
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

const WORDS_PER_MINUTE = 200

/** Estimates reading time in minutes from Markdown content. Always returns at least 1. */
export function calculateReadingTime(markdown: string): number {
  const plainText = markdown
    .replace(/```[\s\S]*?```/g, ' ') // code blocks
    .replace(/!\[.*?\]\(.*?\)/g, ' ') // images
    .replace(/\[.*?\]\(.*?\)/g, ' ') // links (drop the URL, keep nothing extra)
    .replace(/[#>*_`~-]/g, ' ') // markdown syntax chars
    .replace(/\s+/g, ' ')
    .trim()

  const wordCount = plainText.length === 0 ? 0 : plainText.split(' ').length
  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE))
}

/** Falls back excerpt → seo_description → truncated content, in that priority, for meta description use. */
export function resolveSeoDescription(post: Pick<Post, 'seo_description' | 'excerpt' | 'content'>): string {
  if (post.seo_description?.trim()) return post.seo_description.trim()
  if (post.excerpt?.trim()) return post.excerpt.trim()
  const plain = post.content.replace(/[#>*_`~\[\]!()-]/g, ' ').replace(/\s+/g, ' ').trim()
  return plain.slice(0, 160)
}

export function resolveSeoTitle(post: Pick<Post, 'seo_title' | 'title'>): string {
  return post.seo_title?.trim() || post.title
}

/**
 * Extracts H2/H3 headings from Markdown for the article Table of Contents.
 * Returns slugified anchor ids matching what the article renderer assigns to each heading.
 */
export interface TocEntry {
  id: string
  text: string
  level: 2 | 3
}

export function extractToc(markdown: string): TocEntry[] {
  const lines = markdown.split('\n')
  const seen = new Map<string, number>()
  const entries: TocEntry[] = []

  for (const line of lines) {
    const match = /^(#{2,3})\s+(.+)$/.exec(line.trim())
    if (!match) continue
    const level = match[1].length as 2 | 3
    const text = match[2].trim()
    let id = slugify(text)
    const count = seen.get(id) ?? 0
    seen.set(id, count + 1)
    if (count > 0) id = `${id}-${count}`
    entries.push({ id, text, level })
  }

  return entries
}

// ============================================================================
// Public read queries — always go through posts_public (published-only, no
// research_notes). Pass the request-scoped anon client from
// `await createClient()` in `lib/supabase/server`.
// ============================================================================

export interface GetPublishedPostsOptions {
  categorySlug?: string
  search?: string
  limit?: number
  offset?: number
  excludeId?: string
}

export async function getPublishedPosts(
  supabase: SupabaseClient,
  options: GetPublishedPostsOptions = {}
): Promise<{ posts: Post[]; count: number }> {
  let query = supabase
    .from('posts_public')
    .select(PUBLIC_POST_COLUMNS, { count: 'exact' })
    .order('published_at', { ascending: false })

  if (options.categorySlug) {
    const { data: category } = await supabase
      .from('blog_categories')
      .select('id')
      .eq('slug', options.categorySlug)
      .maybeSingle()
    if (!category) return { posts: [], count: 0 }
    query = query.eq('category_id', category.id)
  }

  if (options.search?.trim()) {
    const term = options.search.trim().replace(/[%_]/g, '')
    query = query.or(`title.ilike.%${term}%,excerpt.ilike.%${term}%,content.ilike.%${term}%`)
  }

  if (options.excludeId) {
    query = query.neq('id', options.excludeId)
  }

  if (options.limit) {
    const from = options.offset ?? 0
    query = query.range(from, from + options.limit - 1)
  }

  const { data, count } = await query
  return { posts: (data as unknown as Post[]) || [], count: count ?? 0 }
}

export async function getFeaturedPost(supabase: SupabaseClient): Promise<Post | null> {
  const { data } = await supabase
    .from('posts_public')
    .select(PUBLIC_POST_COLUMNS)
    .eq('featured', true)
    .order('published_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return (data as unknown as Post) ?? null
}

export async function getPostBySlug(supabase: SupabaseClient, slug: string): Promise<Post | null> {
  const { data } = await supabase
    .from('posts_public')
    .select(PUBLIC_POST_COLUMNS)
    .eq('slug', slug)
    .maybeSingle()
  return (data as unknown as Post) ?? null
}

export async function getRelatedPosts(
  supabase: SupabaseClient,
  post: Pick<Post, 'id' | 'category_id'>,
  limit = 3
): Promise<Post[]> {
  if (post.category_id) {
    const { posts } = await getPublishedPosts(supabase, {
      limit,
      excludeId: post.id,
    })
    const sameCategory = posts.filter((p) => p.category_id === post.category_id)
    if (sameCategory.length >= limit) return sameCategory.slice(0, limit)

    // Top up with recent posts from other categories if the same category doesn't have enough.
    const fillers = posts.filter((p) => p.category_id !== post.category_id)
    return [...sameCategory, ...fillers].slice(0, limit)
  }

  const { posts } = await getPublishedPosts(supabase, { limit, excludeId: post.id })
  return posts.slice(0, limit)
}

export async function getCategories(supabase: SupabaseClient): Promise<Category[]> {
  const { data } = await supabase.from('blog_categories').select('*').order('name', { ascending: true })
  return data || []
}

export async function getCategoryBySlug(supabase: SupabaseClient, slug: string): Promise<Category | null> {
  const { data } = await supabase.from('blog_categories').select('*').eq('slug', slug).maybeSingle()
  return data ?? null
}

// ============================================================================
// Admin queries — pass the request-scoped, authenticated client. RLS still
// enforces the admin-email check server-side; this layer does not bypass it.
// ============================================================================

export interface ListAllPostsOptions {
  status?: PostStatus
  search?: string
}

export async function listAllPosts(
  supabase: SupabaseClient,
  options: ListAllPostsOptions = {}
): Promise<AdminPost[]> {
  let query = supabase
    .from('posts')
    .select(ADMIN_POST_COLUMNS)
    .order('updated_at', { ascending: false })

  if (options.status) query = query.eq('status', options.status)
  if (options.search?.trim()) {
    const term = options.search.trim().replace(/[%_]/g, '')
    query = query.ilike('title', `%${term}%`)
  }

  const { data } = await query
  return (data as unknown as AdminPost[]) || []
}

export async function getPostById(supabase: SupabaseClient, id: string): Promise<AdminPost | null> {
  const { data } = await supabase.from('posts').select(ADMIN_POST_COLUMNS).eq('id', id).maybeSingle()
  return (data as unknown as AdminPost) ?? null
}

/** Appends -2, -3, ... until the slug is unique across ALL posts (any status). */
export async function generateUniqueSlug(
  supabase: SupabaseClient,
  baseSlug: string,
  excludeId?: string
): Promise<string> {
  let candidate = baseSlug
  let suffix = 2

  for (;;) {
    let query = supabase.from('posts').select('id').eq('slug', candidate)
    if (excludeId) query = query.neq('id', excludeId)
    const { data } = await query.maybeSingle()
    if (!data) return candidate
    candidate = `${baseSlug}-${suffix}`
    suffix += 1
  }
}

export async function createPost(supabase: SupabaseClient, input: PostInput) {
  const readingTime = calculateReadingTime(input.content)
  const payload = {
    ...input,
    status: input.status ?? 'draft',
    reading_time: readingTime,
    published_at: input.status === 'published' ? new Date().toISOString() : null,
  }
  return supabase.from('posts').insert(payload).select(ADMIN_POST_COLUMNS).single()
}

export async function updatePost(
  supabase: SupabaseClient,
  id: string,
  input: Partial<PostInput>,
  opts: { wasPublished?: boolean } = {}
) {
  const payload: Record<string, unknown> = { ...input }

  if (input.content !== undefined) {
    payload.reading_time = calculateReadingTime(input.content)
  }

  // Set published_at the first time a post transitions into 'published'; never overwrite it afterwards.
  if (input.status === 'published' && !opts.wasPublished) {
    payload.published_at = new Date().toISOString()
  }

  return supabase.from('posts').update(payload).eq('id', id).select(ADMIN_POST_COLUMNS).single()
}

export async function archivePost(supabase: SupabaseClient, id: string) {
  return supabase.from('posts').update({ status: 'archived' }).eq('id', id)
}

export async function deletePost(supabase: SupabaseClient, id: string) {
  return supabase.from('posts').delete().eq('id', id)
}

export async function listAuthors(supabase: SupabaseClient): Promise<BlogAuthor[]> {
  const { data } = await supabase.from('blog_authors').select('*').order('name', { ascending: true })
  return data || []
}

export async function createAuthor(
  supabase: SupabaseClient,
  input: { name: string; avatar_url?: string | null; bio?: string | null }
) {
  return supabase.from('blog_authors').insert(input).select().single()
}

export async function createCategory(
  supabase: SupabaseClient,
  input: { name: string; slug: string; description?: string | null }
) {
  return supabase.from('blog_categories').insert(input).select().single()
}

export async function updateCategory(
  supabase: SupabaseClient,
  id: string,
  input: Partial<{ name: string; slug: string; description: string | null }>
) {
  return supabase.from('blog_categories').update(input).eq('id', id).select().single()
}

export async function deleteCategory(supabase: SupabaseClient, id: string) {
  return supabase.from('blog_categories').delete().eq('id', id)
}
