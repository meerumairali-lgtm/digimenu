import type { TocEntry } from '@/lib/blog'

export default function TableOfContents({ entries }: { entries: TocEntry[] }) {
  if (entries.length < 2) return null

  const list = (
    <ol className="space-y-2 text-sm">
      {entries.map((entry) => (
        <li key={entry.id}>
          <a
            href={`#${entry.id}`}
            className="text-gray-600 hover:text-sky-600 transition-colors block leading-snug"
          >
            {entry.text}
          </a>
        </li>
      ))}
    </ol>
  )

  return (
    <>
      {/*
        Desktop: sticky sidebar. The sticky classes live directly on this box
        (not on a wrapping div) on purpose — position:sticky is bounded by its
        *immediate* parent's box. An extra wrapper div here would only be as
        tall as its own content, cutting the sticky element's "room to stick"
        down to almost nothing and making it scroll away almost immediately.
      */}
      <div className="hidden lg:block sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto bg-gray-50 border border-gray-200 rounded-xl p-5">
        <p className="text-xs font-semibold text-sky-600 uppercase tracking-wide mb-3">Table of Contents</p>
        {list}
      </div>

      {/* Mobile: collapsible, no JS required */}
      <details className="lg:hidden bg-gray-50 border border-gray-200 rounded-xl p-5 mb-8">
        <summary className="text-sm font-semibold text-[#0D1B2A] cursor-pointer select-none">
          Table of Contents
        </summary>
        <div className="mt-4 max-h-64 overflow-y-auto">{list}</div>
      </details>
    </>
  )
}
