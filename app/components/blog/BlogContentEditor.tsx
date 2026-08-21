'use client'

import { useRef, useState } from 'react'
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  Link2,
  List,
  ListOrdered,
  Quote,
  ImagePlus,
  Table,
  Minus,
  Search,
  ChevronDown,
  X,
  Loader2,
  FileText,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { compressImage } from '@/lib/imageCompression'

interface BlogContentEditorProps {
  value: string
  onChange: (value: string) => void
  rows?: number
  /** The post currently being edited, if any — excluded from the link picker's post list. */
  currentPostId?: string
}

interface LinkablePost {
  id: string
  title: string
  slug: string
  status: 'draft' | 'published' | 'archived'
}

const TABLE_SNIPPET = `\n| Column 1 | Column 2 | Column 3 |\n| --- | --- | --- |\n| Row 1 | Row 1 | Row 1 |\n| Row 2 | Row 2 | Row 2 |\n`

const STATUS_BADGE_STYLE: Record<LinkablePost['status'], string> = {
  draft: 'bg-gray-500/10 text-gray-400',
  published: 'bg-green-500/10 text-green-400',
  archived: 'bg-yellow-500/10 text-yellow-400',
}

export default function BlogContentEditor({ value, onChange, rows = 20, currentPostId }: BlogContentEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [findOpen, setFindOpen] = useState(false)
  const [findQuery, setFindQuery] = useState('')
  const [findStatus, setFindStatus] = useState('')

  // Link picker state
  const [linkPickerOpen, setLinkPickerOpen] = useState(false)
  const [linkQuery, setLinkQuery] = useState('')
  const [manualUrl, setManualUrl] = useState('')
  const [posts, setPosts] = useState<LinkablePost[] | null>(null)
  const [loadingPosts, setLoadingPosts] = useState(false)
  // The selection to wrap is captured when the picker opens, since focus
  // moves into the picker's search input and the textarea's own selection
  // would otherwise be lost.
  const pendingSelectionRef = useRef<{ start: number; end: number; text: string } | null>(null)

  // Toolbar edits go through React state, and re-rendering a controlled
  // textarea resets its scrollTop in most browsers. Capture/restore it
  // around every edit so the editor doesn't jump back to the top.
  function withScrollPreserved(fn: () => void) {
    const textarea = textareaRef.current
    if (!textarea) return
    const scrollTop = textarea.scrollTop
    fn()
    requestAnimationFrame(() => {
      textarea.scrollTop = scrollTop
    })
  }

  function wrapSelection(before: string, after: string = before) {
    const textarea = textareaRef.current
    if (!textarea) return

    withScrollPreserved(() => {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const selected = value.slice(start, end)

      const newValue = value.slice(0, start) + before + selected + after + value.slice(end)
      onChange(newValue)

      requestAnimationFrame(() => {
        textarea.focus()
        const cursorPos = selected
          ? start + before.length + selected.length + after.length
          : start + before.length
        textarea.setSelectionRange(cursorPos, cursorPos)
      })
    })
  }

  function insertLinePrefix(prefix: string) {
    const textarea = textareaRef.current
    if (!textarea) return

    withScrollPreserved(() => {
      const start = textarea.selectionStart
      const lineStart = value.lastIndexOf('\n', start - 1) + 1

      const newValue = value.slice(0, lineStart) + prefix + value.slice(lineStart)
      onChange(newValue)

      requestAnimationFrame(() => {
        textarea.focus()
        const cursorPos = start + prefix.length
        textarea.setSelectionRange(cursorPos, cursorPos)
      })
    })
  }

  function insertAtCursor(text: string) {
    const textarea = textareaRef.current
    if (!textarea) return

    withScrollPreserved(() => {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newValue = value.slice(0, start) + text + value.slice(end)
      onChange(newValue)

      requestAnimationFrame(() => {
        textarea.focus()
        const cursorPos = start + text.length
        textarea.setSelectionRange(cursorPos, cursorPos)
      })
    })
  }

  /** Inserts a Markdown link at a previously-captured selection (used by the link picker, since the textarea loses focus/selection while the picker is open). */
  function insertLinkAtSavedSelection(url: string, fallbackText: string) {
    const textarea = textareaRef.current
    const saved = pendingSelectionRef.current
    if (!textarea || !saved) return

    withScrollPreserved(() => {
      const linkText = saved.text || fallbackText
      const markdown = `[${linkText}](${url})`
      const newValue = value.slice(0, saved.start) + markdown + value.slice(saved.end)
      onChange(newValue)

      requestAnimationFrame(() => {
        textarea.focus()
        const cursorPos = saved.start + markdown.length
        textarea.setSelectionRange(cursorPos, cursorPos)
      })
    })
  }

  async function openLinkPicker() {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    pendingSelectionRef.current = { start, end, text: value.slice(start, end) }

    setLinkPickerOpen(true)
    setLinkQuery('')
    setManualUrl('')

    if (posts === null) {
      setLoadingPosts(true)
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from('posts')
          .select('id, title, slug, status')
          .order('updated_at', { ascending: false })
        setPosts((data as LinkablePost[]) || [])
      } finally {
        setLoadingPosts(false)
      }
    }
  }

  function closeLinkPicker() {
    setLinkPickerOpen(false)
    pendingSelectionRef.current = null
  }

  function handlePickPost(post: LinkablePost) {
    insertLinkAtSavedSelection(`/blog/${post.slug}`, post.title)
    closeLinkPicker()
  }

  function handleManualUrlSubmit(e: React.FormEvent) {
    e.preventDefault()
    const url = manualUrl.trim()
    if (!url) return
    insertLinkAtSavedSelection(url, url)
    closeLinkPicker()
  }

  const filteredPosts = (posts || [])
    .filter((p) => p.id !== currentPostId)
    .filter((p) => p.title.toLowerCase().includes(linkQuery.toLowerCase()))

  async function handleImageSelect(file: File | undefined) {
    if (!file) return
    setUploadingImage(true)
    try {
      const supabase = createClient()
      const compressed = await compressImage(file, 1600, 0.82)
      const fileName = `content/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`
      const { error } = await supabase.storage
        .from('blog-images')
        .upload(fileName, compressed, { upsert: true, contentType: 'image/webp' })

      if (!error) {
        const { data: urlData } = supabase.storage.from('blog-images').getPublicUrl(fileName)
        insertAtCursor(`\n![Image description](${urlData.publicUrl})\n`)
      }
    } finally {
      setUploadingImage(false)
      if (imageInputRef.current) imageInputRef.current.value = ''
    }
  }

  /** Finds and selects the next match, wrapping around from the top if needed. Scrolls it into view. */
  function findNext() {
    const textarea = textareaRef.current
    const term = findQuery.trim()
    if (!textarea || !term) return

    const haystack = value.toLowerCase()
    const needle = term.toLowerCase()
    const searchFrom = textarea.selectionEnd ?? 0

    let index = haystack.indexOf(needle, searchFrom)
    let wrapped = false
    if (index === -1) {
      index = haystack.indexOf(needle, 0)
      wrapped = true
    }

    if (index === -1) {
      setFindStatus('No matches')
      return
    }

    textarea.focus()
    textarea.setSelectionRange(index, index + term.length)

    // Belt-and-suspenders scroll-into-view: most browsers auto-scroll a
    // focused textarea to the selection, but this covers the rest.
    const linesBefore = value.slice(0, index).split('\n').length
    const lineHeightPx = parseFloat(getComputedStyle(textarea).lineHeight) || 20
    const target = (linesBefore - 4) * lineHeightPx
    textarea.scrollTop = Math.max(0, target)

    setFindStatus(wrapped ? 'Wrapped to top' : '')
  }

  function handleFindKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      findNext()
    } else if (e.key === 'Escape') {
      setFindOpen(false)
      setFindStatus('')
    }
  }

  const toolbarButtonStyle =
    'inline-flex items-center justify-center w-8 h-8 rounded-md border border-gray-700 bg-gray-800 text-gray-300 hover:text-white hover:border-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2 p-2 bg-gray-900 border border-gray-800 rounded-lg">
        <button type="button" onClick={() => insertLinePrefix('## ')} className={toolbarButtonStyle} title="Heading 2">
          <Heading2 size={15} />
        </button>
        <button type="button" onClick={() => insertLinePrefix('### ')} className={toolbarButtonStyle} title="Heading 3">
          <Heading3 size={15} />
        </button>
        <div className="w-px bg-gray-700 mx-1" />
        <button type="button" onClick={() => wrapSelection('**')} className={toolbarButtonStyle} title="Bold">
          <Bold size={15} />
        </button>
        <button type="button" onClick={() => wrapSelection('*')} className={toolbarButtonStyle} title="Italic">
          <Italic size={15} />
        </button>
        <button type="button" onClick={openLinkPicker} className={toolbarButtonStyle} title="Link to another article or URL">
          <Link2 size={15} />
        </button>
        <div className="w-px bg-gray-700 mx-1" />
        <button type="button" onClick={() => insertLinePrefix('- ')} className={toolbarButtonStyle} title="Bullet list">
          <List size={15} />
        </button>
        <button type="button" onClick={() => insertLinePrefix('1. ')} className={toolbarButtonStyle} title="Numbered list">
          <ListOrdered size={15} />
        </button>
        <button type="button" onClick={() => insertLinePrefix('> ')} className={toolbarButtonStyle} title="Blockquote">
          <Quote size={15} />
        </button>
        <div className="w-px bg-gray-700 mx-1" />
        <button type="button" onClick={() => insertAtCursor(TABLE_SNIPPET)} className={toolbarButtonStyle} title="Table">
          <Table size={15} />
        </button>
        <button type="button" onClick={() => insertAtCursor('\n\n---\n\n')} className={toolbarButtonStyle} title="Horizontal rule">
          <Minus size={15} />
        </button>
        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          disabled={uploadingImage}
          className={toolbarButtonStyle}
          title="Insert image"
        >
          <ImagePlus size={15} />
        </button>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleImageSelect(e.target.files?.[0])}
        />
        {uploadingImage && <span className="text-xs text-gray-400 self-center ml-1">Uploading…</span>}

        <div className="w-px bg-gray-700 mx-1" />
        <button
          type="button"
          onClick={() => setFindOpen((open) => !open)}
          className={toolbarButtonStyle}
          title="Find in article"
        >
          <Search size={15} />
        </button>
      </div>

      {findOpen && (
        <div className="flex items-center gap-2 mb-2 p-2 bg-gray-900 border border-gray-800 rounded-lg">
          <Search size={14} className="text-gray-500 shrink-0" />
          <input
            type="text"
            value={findQuery}
            onChange={(e) => {
              setFindQuery(e.target.value)
              setFindStatus('')
            }}
            onKeyDown={handleFindKeyDown}
            placeholder="Find in article… (Enter for next match)"
            autoFocus
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none"
          />
          {findStatus && <span className="text-xs text-gray-500 shrink-0">{findStatus}</span>}
          <button
            type="button"
            onClick={findNext}
            className="p-1 text-gray-400 hover:text-white shrink-0"
            title="Find next"
          >
            <ChevronDown size={15} />
          </button>
          <button
            type="button"
            onClick={() => {
              setFindOpen(false)
              setFindStatus('')
            }}
            className="p-1 text-gray-400 hover:text-white shrink-0"
            title="Close"
          >
            <X size={15} />
          </button>
        </div>
      )}

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder="Write your article in Markdown…"
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 font-mono leading-relaxed focus:outline-none focus:border-sky-500 resize-y"
      />
      <p className="text-xs text-gray-500 mt-1.5">
        Markdown supported: headings, bold/italic, links, lists, blockquotes, tables, images, and{' '}
        <code className="text-gray-400">---</code> for a horizontal rule.
      </p>

      {linkPickerOpen && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={closeLinkPicker}
        >
          <div
            className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-md max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
              <h3 className="text-sm font-semibold text-white">Insert link</h3>
              <button type="button" onClick={closeLinkPicker} className="text-gray-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <div className="p-4 border-b border-gray-800">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={linkQuery}
                  onChange={(e) => setLinkQuery(e.target.value)}
                  placeholder="Search your articles…"
                  autoFocus
                  className="w-full pl-9 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-2 py-2">
              {loadingPosts ? (
                <div className="flex items-center justify-center gap-2 text-gray-500 text-sm py-8">
                  <Loader2 size={15} className="animate-spin" /> Loading articles…
                </div>
              ) : filteredPosts.length === 0 ? (
                <p className="text-center text-gray-500 text-sm py-8">No matching articles.</p>
              ) : (
                filteredPosts.map((post) => (
                  <button
                    key={post.id}
                    type="button"
                    onClick={() => handlePickPost(post)}
                    className="w-full flex items-center gap-2.5 text-left px-3 py-2.5 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <FileText size={14} className="text-gray-500 shrink-0" />
                    <span className="flex-1 text-sm text-gray-200 truncate">{post.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${STATUS_BADGE_STYLE[post.status]}`}>
                      {post.status}
                    </span>
                  </button>
                ))
              )}
            </div>

            <form onSubmit={handleManualUrlSubmit} className="flex items-center gap-2 p-4 border-t border-gray-800">
              <input
                type="text"
                value={manualUrl}
                onChange={(e) => setManualUrl(e.target.value)}
                placeholder="Or paste a URL…"
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-sky-500"
              />
              <button
                type="submit"
                disabled={!manualUrl.trim()}
                className="px-3 py-2 bg-sky-500 hover:bg-sky-400 text-white text-sm font-medium rounded-lg disabled:opacity-40 disabled:hover:bg-sky-500"
              >
                Insert
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
