import { createClient } from '@/lib/supabase/server'
import { logAuditAction } from '@/lib/audit'
import { NextResponse } from 'next/server'
import { deletePost } from '@/lib/blog'

const SUPER_ADMIN_EMAIL = 'meerumairali@gmail.com'

export async function POST(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.email !== SUPER_ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id, title } = (await req.json()) as { id: string; title?: string }
  if (!id) {
    return NextResponse.json({ error: 'Missing post id.' }, { status: 400 })
  }

  const { error } = await deletePost(supabase, id)
  if (error) {
    console.error('Failed to delete post:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await logAuditAction({
    admin_email: user.email,
    action: 'delete_post',
    target_type: 'blog_post',
    target_id: id,
    target_name: title,
  })

  return NextResponse.json({ success: true })
}
