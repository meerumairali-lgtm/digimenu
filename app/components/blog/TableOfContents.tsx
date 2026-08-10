import type { TocEntry } from '@/lib/blog'

export default function TableOfContents({ entries }: { entries: TocEntry[] }) {
  if (entries.length < 2) return null

  const list = (
    <ol className="space-y-2 text-sm">
      {entries.map((entry) => (
        <li key={entry.id} className={entry.level === 3 ? 'pl-4' : ''}>
          <a
            href={`#${entry.id}`}
            className="text-gray-400 hover:text-sky-400 transition-colors block leading-snug"
          >
            {entry.text}
          </a>
        </li>
      ))}
    </ol>
  )

  return (
    <>
      {/* Desktop: sticky sidebar */}
      <div className="hidden lg:block">
        <div className="sticky top-24 bg-[#112240] border border-sky-500/10 rounded-xl p-5">
          <p className="text-xs font-semibold text-sky-400 uppercase tracking-wide mb-3">Table of Contents</p>
          {list}
        </div>
      </div>

      {/* Mobile: collapsible, no JS required */}
      <details className="lg:hidden bg-[#112240] border border-sky-500/10 rounded-xl p-5 mb-8">
        <summary className="text-sm font-semibold text-white cursor-pointer select-none">
          Table of Contents
        </summary>
        <div className="mt-4">{list}</div>
      </details>
    </>
  )
}
