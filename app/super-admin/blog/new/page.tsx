import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getCategories, listAuthors } from '@/lib/blog'
import BlogEditorForm from '../BlogEditorForm'

export const dynamic = 'force-dynamic'

const SUPER_ADMIN_EMAIL = 'meerumairali@gmail.com'

export default async function NewBlogPostPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.email !== SUPER_ADMIN_EMAIL) {
    redirect('/dashboard')
  }

  const [categories, authors] = await Promise.all([getCategories(supabase), listAuthors(supabase)])

  return (
    <main>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">New Article</h1>
      </div>
      <BlogEditorForm mode="create" initialCategories={categories} initialAuthors={authors} />
    </main>
  )
}
