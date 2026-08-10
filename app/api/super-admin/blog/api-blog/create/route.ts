import { createClient } from '@/lib/supabase/server'
import { logAuditAction } from '@/lib/audit'
import { NextResponse } from 'next/server'
import { createPost, generateUniqueSlug, slugify, type PostInput } from '@/lib/blog'

const SUPER_ADMIN_EMAIL = 'meerumairali@gmail.com'

export async function POST(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.email !== SUPER_ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await req.json()) as PostInput

  if (!body.title?.trim() || !body.content?.trim()) {
    return NextResponse.json({ error: 'Title and content are required.' }, { status: 400 })
  }

  const baseSlug = slugify(body.slug || body.title)
  if (!baseSlug) {
    return NextResponse.json({ error: 'Could not generate a valid slug from the title.' }, { status: 400 })
  }
  const uniqueSlug = await generateUniqueSlug(supabase, baseSlug)

  const { data: post, error } = await createPost(supabase, { ...body, slug: uniqueSlug })

  if (error || !post) {
    console.error('Failed to create post:', error)
    return NextResponse.json({ error: error?.message || 'Failed to create post.' }, { status: 500 })
  }

  await logAuditAction({
    admin_email: user.email,
    action: post.status === 'published' ? 'publish_post' : 'create_post',
    target_type: 'blog_post',
    target_id: post.id,
    target_name: post.title,
  })

  return NextResponse.json({ post })
}
