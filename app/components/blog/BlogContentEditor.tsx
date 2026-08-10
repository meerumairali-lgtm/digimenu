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
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { compressImage } from '@/lib/imageCompression'

interface BlogContentEditorProps {
  value: string
  onChange: (value: string) => void
  rows?: number
}

const TABLE_SNIPPET = `\n| Column 1 | Column 2 | Column 3 |\n| --- | --- | --- |\n| Row 1 | Row 1 | Row 1 |\n| Row 2 | Row 2 | Row 2 |\n`

export default function BlogContentEditor({ value, onChange, rows = 20 }: BlogContentEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  function wrapSelection(before: string, after: string = before) {
    const textarea = textareaRef.current
    if (!textarea) return

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
  }

  function insertLinePrefix(prefix: string) {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const lineStart = value.lastIndexOf('\n', start - 1) + 1

    const newValue = value.slice(0, lineStart) + prefix + value.slice(lineStart)
    onChange(newValue)

    requestAnimationFrame(() => {
      textarea.focus()
      const cursorPos = start + prefix.length
      textarea.setSelectionRange(cursorPos, cursorPos)
    })
  }

  function insertAtCursor(text: string) {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const newValue = value.slice(0, start) + text + value.slice(end)
    onChange(newValue)

    requestAnimationFrame(() => {
      textarea.focus()
      const cursorPos = start + text.length
      textarea.setSelectionRange(cursorPos, cursorPos)
    })
  }

  function insertLink() {
    const textarea = textareaRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = value.slice(start, end)
    wrapSelection('[', `](${selected ? 'https://' : 'https://'})`)
  }

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
        <button type="button" onClick={insertLink} className={toolbarButtonStyle} title="Link">
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
      </div>

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
    </div>
  )
}
