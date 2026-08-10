import { createClient } from '@/lib/supabase/server'
import { logAuditAction } from '@/lib/audit'
import { NextResponse } from 'next/server'
import { updatePost, getPostById, generateUniqueSlug, slugify, type PostInput } from '@/lib/blog'

const SUPER_ADMIN_EMAIL = 'meerumairali@gmail.com'

export async function POST(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.email !== SUPER_ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await req.json()) as Partial<PostInput> & { id: string }
  const { id, ...rest } = body

  if (!id) {
    return NextResponse.json({ error: 'Missing post id.' }, { status: 400 })
  }

  const existing = await getPostById(supabase, id)
  if (!existing) {
    return NextResponse.json({ error: 'Post not found.' }, { status: 404 })
  }

  const updates: Partial<PostInput> = { ...rest }

  if (rest.slug) {
    const baseSlug = slugify(rest.slug)
    if (!baseSlug) {
      return NextResponse.json({ error: 'Could not generate a valid slug.' }, { status: 400 })
    }
    updates.slug = baseSlug === existing.slug ? existing.slug : await generateUniqueSlug(supabase, baseSlug, id)
  }

  const { data: post, error } = await updatePost(supabase, id, updates, {
    wasPublished: existing.status === 'published',
  })

  if (error || !post) {
    console.error('Failed to update post:', error)
    return NextResponse.json({ error: error?.message || 'Failed to update post.' }, { status: 500 })
  }

  let action = 'update_post'
  if (existing.status !== 'published' && post.status === 'published') action = 'publish_post'
  else if (existing.status !== 'archived' && post.status === 'archived') action = 'archive_post'

  await logAuditAction({
    admin_email: user.email,
    action,
    target_type: 'blog_post',
    target_id: post.id,
    target_name: post.title,
  })

  return NextResponse.json({ post })
}
