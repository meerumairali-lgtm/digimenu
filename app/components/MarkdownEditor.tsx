'use client'

import { useRef } from 'react'
import { Bold, Italic, List, Heading2 } from 'lucide-react'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  required?: boolean
  textareaStyle?: React.CSSProperties
}

export default function MarkdownEditor({
  value,
  onChange,
  placeholder,
  rows = 4,
  required = false,
  textareaStyle = {},
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function wrapSelection(before: string, after: string = before) {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = value.slice(start, end)

    const newValue =
      value.slice(0, start) + before + selected + after + value.slice(end)

    onChange(newValue)

    // Restore focus and place cursor sensibly after the insert
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
    // Find the start of the current line
    const lineStart = value.lastIndexOf('\n', start - 1) + 1

    const newValue = value.slice(0, lineStart) + prefix + value.slice(lineStart)
    onChange(newValue)

    requestAnimationFrame(() => {
      textarea.focus()
      const cursorPos = start + prefix.length
      textarea.setSelectionRange(cursorPos, cursorPos)
    })
  }

  const toolbarButtonStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: 6,
    border: '1px solid #BAE6FD',
    background: '#fff',
    color: '#1A3A5C',
    cursor: 'pointer',
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        <button
          type="button"
          onClick={() => wrapSelection('**')}
          style={toolbarButtonStyle}
          title="Bold"
        >
          <Bold size={15} />
        </button>
        <button
          type="button"
          onClick={() => wrapSelection('*')}
          style={toolbarButtonStyle}
          title="Italic"
        >
          <Italic size={15} />
        </button>
        <button
          type="button"
          onClick={() => insertLinePrefix('## ')}
          style={toolbarButtonStyle}
          title="Heading"
        >
          <Heading2 size={15} />
        </button>
        <button
          type="button"
          onClick={() => insertLinePrefix('- ')}
          style={toolbarButtonStyle}
          title="Bullet list"
        >
          <List size={15} />
        </button>
      </div>

      <textarea
        ref={textareaRef}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        style={textareaStyle}
      />
    </div>
  )
}