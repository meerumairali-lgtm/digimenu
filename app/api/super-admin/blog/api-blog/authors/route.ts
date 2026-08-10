import { createClient } from '@/lib/supabase/server'
import { logAuditAction } from '@/lib/audit'
import { NextResponse } from 'next/server'
import { createAuthor } from '@/lib/blog'

const SUPER_ADMIN_EMAIL = 'meerumairali@gmail.com'

export async function POST(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.email !== SUPER_ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { name, avatar_url, bio } = (await req.json()) as { name: string; avatar_url?: string; bio?: string }
  if (!name?.trim()) {
    return NextResponse.json({ error: 'Author name is required.' }, { status: 400 })
  }

  const { data: author, error } = await createAuthor(supabase, {
    name: name.trim(),
    avatar_url: avatar_url?.trim() || null,
    bio: bio?.trim() || null,
  })

  if (error || !author) {
    console.error('Failed to create author:', error)
    return NextResponse.json({ error: error?.message || 'Failed to create author.' }, { status: 500 })
  }

  await logAuditAction({
    admin_email: user.email,
    action: 'create_blog_author',
    target_type: 'blog_author',
    target_id: author.id,
    target_name: author.name,
  })

  return NextResponse.json({ author })
}
