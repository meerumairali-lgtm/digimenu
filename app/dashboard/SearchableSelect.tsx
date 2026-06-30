'use client'
import { useState, useRef, useEffect } from 'react'

export type SearchableOption = {
  value: string
  label: string
  key?: string
}

type Props = {
  options: SearchableOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  disabled?: boolean
  variant?: 'light' | 'dark'
  width?: string | number
  selectedLabelOverride?: string
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  disabled = false,
  variant = 'light',
  width = '100%',
  selectedLabelOverride,
}: Props) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [highlight, setHighlight] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selected = options.find(o => o.value === value)

  const filtered = search.trim()
    ? options.filter(o => o.label.toLowerCase().includes(search.trim().toLowerCase()))
    : options

  // Close dropdown when clicking outside it
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (open) {
      setHighlight(0)
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [open])

  function selectOption(opt: SearchableOption) {
    onChange(opt.value)
    setOpen(false)
    setSearch('')
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlight(h => Math.min(h + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight(h => Math.max(h - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filtered[highlight]) selectOption(filtered[highlight])
    } else if (e.key === 'Escape') {
      setOpen(false)
      setSearch('')
    }
  }

  const dark = variant === 'dark'

  return (
    <div ref={containerRef} style={{ position: 'relative', width }}>
      <div
        onClick={() => { if (!disabled) setOpen(o => !o) }}
        style={{
          padding: '10px 14px',
          borderRadius: 8,
          border: dark ? '1px solid #BAE6FD' : '1px solid #ddd',
          fontSize: dark ? 15 : 14,
          width: '100%',
          background: disabled ? (dark ? '#0a1622' : '#f3f4f6') : (dark ? '#f0f9ff' : '#fff'),
          color: disabled ? '#888' : (dark ? '#0D1B2A' : '#222'),
          boxSizing: 'border-box',
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selectedLabelOverride || (selected ? selected.label : placeholder)}
        </span>
        <span style={{ color: dark ? '#7DD3FC' : '#999', fontSize: 11, marginLeft: 8, flexShrink: 0 }}>▼</span>
      </div>

      {open && !disabled && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          right: 0,
          background: '#fff',
          border: '1px solid #BAE6FD',
          borderRadius: 8,
          boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
          zIndex: 50,
          overflow: 'hidden',
        }}>
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setHighlight(0) }}
            onKeyDown={handleKeyDown}
            placeholder={searchPlaceholder}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: 'none',
              borderBottom: '1px solid #e0f2fe',
              fontSize: 14,
              outline: 'none',
              boxSizing: 'border-box',
              color: '#0D1B2A',
            }}
          />
          <div style={{ maxHeight: 220, overflowY: 'auto' }}>
            {filtered.length === 0 && (
              <div style={{ padding: '10px 12px', fontSize: 13, color: '#999' }}>No matches</div>
            )}
            {filtered.map((opt, i) => (
              <div
                key={opt.key || opt.value}
                onClick={() => selectOption(opt)}
                onMouseEnter={() => setHighlight(i)}
                style={{
                  padding: '9px 12px',
                  fontSize: 14,
                  cursor: 'pointer',
                  background: i === highlight ? '#e0f2fe' : (opt.value === value ? '#f0f9ff' : '#fff'),
                  color: '#0D1B2A',
                  fontWeight: opt.value === value ? 600 : 400,
                }}
              >
                {opt.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}