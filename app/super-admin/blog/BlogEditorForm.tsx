'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, X, ImagePlus, Eye, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { compressImage } from '@/lib/imageCompression'
import { slugify } from '@/lib/blog'
import type { AdminPost, Category, BlogAuthor } from '@/lib/blog'
import BlogContentEditor from '@/app/components/blog/BlogContentEditor'

interface BlogEditorFormProps {
  mode: 'create' | 'edit'
  post?: AdminPost
  initialCategories: Category[]
  initialAuthors: BlogAuthor[]
}

const inputStyle =
  'w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-sky-500'
const labelStyle = 'block text-sm font-medium text-gray-300 mb-1.5'
const sectionStyle = 'bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5'

export default function BlogEditorForm({ mode, post, initialCategories, initialAuthors }: BlogEditorFormProps) {
  const router = useRouter()

  const [title, setTitle] = useState(post?.title ?? '')
  const [slug, setSlug] = useState(post?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(mode === 'edit')
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? '')
  const [coverImage, setCoverImage] = useState(post?.cover_image ?? '')
  const [categoryId, setCategoryId] = useState(post?.category_id ?? '')
  const [authorId, setAuthorId] = useState(post?.author_id ?? '')
  const [content, setContent] = useState(post?.content ?? '')
  const [seoTitle, setSeoTitle] = useState(post?.seo_title ?? '')
  const [seoDescription, setSeoDescription] = useState(post?.seo_description ?? '')
  const [canonicalUrl, setCanonicalUrl] = useState(post?.canonical_url ?? '')
  const [featured, setFeatured] = useState(post?.featured ?? false)
  const [researchNotes, setResearchNotes] = useState(post?.research_notes ?? '')

  const [categories, setCategories] = useState(initialCategories)
  const [authors, setAuthors] = useState(initialAuthors)
  const [addingCategory, setAddingCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [addingAuthor, setAddingAuthor] = useState(false)
  const [newAuthorName, setNewAuthorName] = useState('')

  const [coverUploading, setCoverUploading] = useState(false)
  const [saving, setSaving] = useState<'draft' | 'publish' | null>(null)
  const [error, setError] = useState('')

  function handleTitleChange(value: string) {
    setTitle(value)
    if (!slugTouched) setSlug(slugify(value))
  }

  async function handleCoverUpload(file: File | undefined) {
    if (!file) return
    setCoverUploading(true)
    try {
      const supabase = createClient()
      const compressed = await compressImage(file, 1600, 0.85)
      const fileName = `covers/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`
      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(fileName, compressed, { upsert: true, contentType: 'image/webp' })
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('blog-images').getPublicUrl(fileName)
        setCoverImage(urlData.publicUrl)
      }
    } finally {
      setCoverUploading(false)
    }
  }

  async function handleCreateCategory() {
    if (!newCategoryName.trim()) return
    const res = await fetch('/api/super-admin/blog/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCategoryName.trim(), slug: slugify(newCategoryName) }),
    })
    if (res.ok) {
      const { category } = await res.json()
      setCategories((prev) => [...prev, category].sort((a, b) => a.name.localeCompare(b.name)))
      setCategoryId(category.id)
      setNewCategoryName('')
      setAddingCategory(false)
    }
  }

  async function handleCreateAuthor() {
    if (!newAuthorName.trim()) return
    const res = await fetch('/api/super-admin/blog/authors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newAuthorName.trim() }),
    })
    if (res.ok) {
      const { author } = await res.json()
      setAuthors((prev) => [...prev, author].sort((a, b) => a.name.localeCompare(b.name)))
      setAuthorId(author.id)
      setNewAuthorName('')
      setAddingAuthor(false)
    }
  }

  async function handleSave(targetStatus: 'draft' | 'published') {
    setError('')

    if (!title.trim()) {
      setError('Title is required.')
      return
    }
    if (!content.trim()) {
      setError('Content is required.')
      return
    }

    const newSlug = slugify(slug || title)
    if (mode === 'edit' && post?.status === 'published' && newSlug !== post.slug) {
      const confirmed = confirm(
        `This article is live at /blog/${post.slug}. Changing the slug to /blog/${newSlug} will break that URL — anyone with the old link will get a 404. Continue?`
      )
      if (!confirmed) return
    }

    setSaving(targetStatus === 'draft' ? 'draft' : 'publish')

    const payload = {
      title: title.trim(),
      slug: slugify(slug || title),
      excerpt: excerpt.trim() || null,
      content,
      cover_image: coverImage || null,
      category_id: categoryId || null,
      author_id: authorId || null,
      status: targetStatus,
      seo_title: seoTitle.trim() || null,
      seo_description: seoDescription.trim() || null,
      canonical_url: canonicalUrl.trim() || null,
      featured,
      research_notes: researchNotes.trim() || null,
    }

    const url = mode === 'create' ? '/api/super-admin/blog/create' : '/api/super-admin/blog/update'
    const body = mode === 'create' ? payload : { id: post!.id, ...payload }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error || 'Something went wrong saving this post.')
      setSaving(null)
      return
    }

    const { post: savedPost } = await res.json()
    setSaving(null)

    if (mode === 'create') {
      router.push(`/super-admin/blog/${savedPost.id}`)
    } else {
      router.refresh()
    }
  }

  const seoTitleLen = seoTitle.length
  const seoDescLen = seoDescription.length

  return (
    <div className="max-w-3xl space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {/* Core content */}
      <div className={sectionStyle}>
        <div>
          <label className={labelStyle}>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="How to Create a Restaurant Website in 2026"
            className={inputStyle}
          />
        </div>

        <div>
          <label className={labelStyle}>Slug</label>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-sm">/blog/</span>
            <input
              type="text"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true)
                setSlug(e.target.value)
              }}
              placeholder="how-to-create-a-restaurant-website"
              className={inputStyle}
            />
          </div>
        </div>

        <div>
          <label className={labelStyle}>Excerpt</label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
            placeholder="A short summary shown on article cards and used as a fallback meta description."
            className={inputStyle}
          />
        </div>

        <div>
          <label className={labelStyle}>Cover image</label>
          {coverImage ? (
            <div className="relative w-full max-w-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={coverImage} alt="Cover" className="w-full rounded-lg border border-gray-700" />
              <button
                type="button"
                onClick={() => setCoverImage('')}
                className="absolute top-2 right-2 bg-gray-900/80 text-white p-1.5 rounded-lg hover:bg-red-500/80"
                title="Remove cover image"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <label className="flex items-center justify-center gap-2 w-full max-w-md h-28 border-2 border-dashed border-gray-700 rounded-lg text-gray-400 text-sm cursor-pointer hover:border-sky-500 hover:text-sky-400 transition-colors">
              {coverUploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Uploading…
                </>
              ) : (
                <>
                  <ImagePlus size={16} /> Upload cover image
                </>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={coverUploading}
                onChange={(e) => handleCoverUpload(e.target.files?.[0])}
              />
            </label>
          )}
        </div>
      </div>

      {/* Category / Author */}
      <div className={sectionStyle}>
        <div>
          <label className={labelStyle}>Category</label>
          {addingCategory ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="New category name"
                className={inputStyle}
                autoFocus
              />
              <button type="button" onClick={handleCreateCategory} className="px-3 py-2 bg-sky-500 hover:bg-sky-400 text-white text-sm font-medium rounded-lg">
                Add
              </button>
              <button type="button" onClick={() => setAddingCategory(false)} className="px-3 py-2 bg-gray-800 text-gray-400 text-sm rounded-lg hover:text-white">
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputStyle}>
                <option value="">No category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setAddingCategory(true)}
                className="flex items-center gap-1 px-3 py-2 bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg hover:text-white hover:border-sky-500 whitespace-nowrap"
              >
                <Plus size={14} /> New
              </button>
            </div>
          )}
        </div>

        <div>
          <label className={labelStyle}>Author</label>
          {addingAuthor ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={newAuthorName}
                onChange={(e) => setNewAuthorName(e.target.value)}
                placeholder="New author name"
                className={inputStyle}
                autoFocus
              />
              <button type="button" onClick={handleCreateAuthor} className="px-3 py-2 bg-sky-500 hover:bg-sky-400 text-white text-sm font-medium rounded-lg">
                Add
              </button>
              <button type="button" onClick={() => setAddingAuthor(false)} className="px-3 py-2 bg-gray-800 text-gray-400 text-sm rounded-lg hover:text-white">
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <select value={authorId} onChange={(e) => setAuthorId(e.target.value)} className={inputStyle}>
                <option value="">No author</option>
                {authors.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setAddingAuthor(true)}
                className="flex items-center gap-1 px-3 py-2 bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg hover:text-white hover:border-sky-500 whitespace-nowrap"
              >
                <Plus size={14} /> New
              </button>
            </div>
          )}
        </div>

        <label className="flex items-center gap-3 cursor-pointer w-fit">
          <button
            type="button"
            onClick={() => setFeatured((f) => !f)}
            className={`relative w-11 h-6 rounded-full transition-colors ${featured ? 'bg-sky-500' : 'bg-gray-700'}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${featured ? 'translate-x-5' : ''}`}
            />
          </button>
          <span className="text-sm text-gray-300">Featured article</span>
        </label>
      </div>

      {/* Content */}
      <div className={sectionStyle}>
        <label className={labelStyle}>Content</label>
        <BlogContentEditor value={content} onChange={setContent} />
      </div>

      {/* SEO */}
      <div className={sectionStyle}>
        <h3 className="text-white font-semibold text-sm">SEO</h3>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className={labelStyle + ' mb-0'}>SEO title</label>
            <span className={`text-xs ${seoTitleLen > 60 ? 'text-yellow-400' : 'text-gray-500'}`}>
              {seoTitleLen}/60 (falls back to title)
            </span>
          </div>
          <input
            type="text"
            value={seoTitle}
            onChange={(e) => setSeoTitle(e.target.value)}
            placeholder={title || 'Defaults to the article title'}
            className={inputStyle}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className={labelStyle + ' mb-0'}>Meta description</label>
            <span className={`text-xs ${seoDescLen > 160 ? 'text-yellow-400' : 'text-gray-500'}`}>
              {seoDescLen}/160 (falls back to excerpt)
            </span>
          </div>
          <textarea
            value={seoDescription}
            onChange={(e) => setSeoDescription(e.target.value)}
            rows={2}
            placeholder={excerpt || 'Defaults to the excerpt'}
            className={inputStyle}
          />
        </div>

        <div>
          <label className={labelStyle}>Canonical URL</label>
          <input
            type="text"
            value={canonicalUrl}
            onChange={(e) => setCanonicalUrl(e.target.value)}
            placeholder="Only set this if the article is republished from elsewhere"
            className={inputStyle}
          />
        </div>
      </div>

      {/* Research notes */}
      <div className={sectionStyle}>
        <label className={labelStyle}>
          Research notes <span className="text-gray-500 font-normal">— internal only, never shown publicly</span>
        </label>
        <textarea
          value={researchNotes}
          onChange={(e) => setResearchNotes(e.target.value)}
          rows={4}
          placeholder="Target keyword, search intent, audience, key facts, sources…"
          className={inputStyle}
        />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3 sticky bottom-0 bg-gray-950/95 backdrop-blur border-t border-gray-800 py-4 -mx-6 px-6">
        <button
          type="button"
          disabled={saving !== null}
          onClick={() => handleSave('draft')}
          className="px-4 py-2.5 bg-gray-800 border border-gray-700 text-white text-sm font-medium rounded-lg hover:border-sky-500 disabled:opacity-50"
        >
          {saving === 'draft' ? 'Saving…' : 'Save Draft'}
        </button>

        <button
          type="button"
          disabled={saving !== null}
          onClick={() => handleSave('published')}
          className="px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-white text-sm font-semibold rounded-lg disabled:opacity-50"
        >
          {saving === 'publish' ? 'Publishing…' : post?.status === 'published' ? 'Update & Republish' : 'Publish'}
        </button>

        {mode === 'edit' && post && (
          <Link
            href={`/super-admin/blog/${post.id}/preview`}
            target="_blank"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-800 border border-gray-700 text-gray-300 text-sm font-medium rounded-lg hover:text-white hover:border-sky-500"
          >
            <Eye size={15} /> Preview
          </Link>
        )}

        {post?.status && (
          <span className="text-xs text-gray-500 ml-auto capitalize">Current status: {post.status}</span>
        )}
      </div>
    </div>
  )
}
