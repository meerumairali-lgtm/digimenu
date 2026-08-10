import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getPostById, getCategories, listAuthors } from '@/lib/blog'
import BlogEditorForm from '../BlogEditorForm'

export const dynamic = 'force-dynamic'

const SUPER_ADMIN_EMAIL = 'meerumairali@gmail.com'

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.email !== SUPER_ADMIN_EMAIL) {
    redirect('/dashboard')
  }

  const [post, categories, authors] = await Promise.all([
    getPostById(supabase, id),
    getCategories(supabase),
    listAuthors(supabase),
  ])

  if (!post) notFound()

  return (
    <main>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Edit Article</h1>
      </div>
      <BlogEditorForm mode="edit" post={post} initialCategories={categories} initialAuthors={authors} />
    </main>
  )
}
