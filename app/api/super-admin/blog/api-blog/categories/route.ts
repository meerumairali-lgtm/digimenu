import { createClient } from '@/lib/supabase/server'
import { logAuditAction } from '@/lib/audit'
import { NextResponse } from 'next/server'
import { createCategory, slugify } from '@/lib/blog'

const SUPER_ADMIN_EMAIL = 'meerumairali@gmail.com'

export async function POST(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.email !== SUPER_ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { name, description } = (await req.json()) as { name: string; description?: string }
  if (!name?.trim()) {
    return NextResponse.json({ error: 'Category name is required.' }, { status: 400 })
  }

  const baseSlug = slugify(name)
  if (!baseSlug) {
    return NextResponse.json({ error: 'Could not generate a valid slug from that name.' }, { status: 400 })
  }

  // Retry with a numeric suffix on slug collision (unique constraint on blog_categories.slug).
  let candidateSlug = baseSlug
  let attempt = 0
  let category = null
  let lastError = null

  while (attempt < 5 && !category) {
    const { data, error } = await createCategory(supabase, {
      name: name.trim(),
      slug: candidateSlug,
      description: description?.trim() || null,
    })
    if (data) {
      category = data
    } else {
      lastError = error
      attempt += 1
      candidateSlug = `${baseSlug}-${attempt + 1}`
    }
  }

  if (!category) {
    console.error('Failed to create category:', lastError)
    return NextResponse.json({ error: lastError?.message || 'Failed to create category.' }, { status: 500 })
  }

  await logAuditAction({
    admin_email: user.email,
    action: 'create_blog_category',
    target_type: 'blog_category',
    target_id: category.id,
    target_name: category.name,
  })

  return NextResponse.json({ category })
}
