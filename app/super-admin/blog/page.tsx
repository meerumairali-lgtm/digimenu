import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { listAllPosts } from '@/lib/blog'
import BlogList from './BlogList'

export const dynamic = 'force-dynamic'

const SUPER_ADMIN_EMAIL = 'meerumairali@gmail.com'

export default async function BlogAdminPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.email !== SUPER_ADMIN_EMAIL) {
    redirect('/dashboard')
  }

  const posts = await listAllPosts(supabase)

  return (
    <main>
      <BlogList initialPosts={posts} />
    </main>
  )
}
