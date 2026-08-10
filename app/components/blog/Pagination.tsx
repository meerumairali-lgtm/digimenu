import Link from 'next/link'

interface PaginationProps {
  currentPage: number
  totalPages: number
  basePath: string
  searchParamsToKeep?: Record<string, string>
}

export default function Pagination({ currentPage, totalPages, basePath, searchParamsToKeep = {} }: PaginationProps) {
  if (totalPages <= 1) return null

  function pageHref(page: number) {
    const params = new URLSearchParams(searchParamsToKeep)
    if (page > 1) params.set('page', String(page))
    const qs = params.toString()
    return qs ? `${basePath}?${qs}` : basePath
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-2 mt-12">
      <Link
        href={pageHref(Math.max(1, currentPage - 1))}
        aria-disabled={currentPage === 1}
        className={`px-3 py-2 rounded-lg text-sm border border-sky-500/15 ${
          currentPage === 1 ? 'text-gray-600 pointer-events-none' : 'text-gray-300 hover:text-white hover:border-sky-500/40'
        }`}
      >
        Previous
      </Link>

      {pages.map((page) => (
        <Link
          key={page}
          href={pageHref(page)}
          aria-current={page === currentPage ? 'page' : undefined}
          className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm ${
            page === currentPage ? 'bg-sky-500 text-white font-semibold' : 'text-gray-300 hover:text-white border border-sky-500/15 hover:border-sky-500/40'
          }`}
        >
          {page}
        </Link>
      ))}

      <Link
        href={pageHref(Math.min(totalPages, currentPage + 1))}
        aria-disabled={currentPage === totalPages}
        className={`px-3 py-2 rounded-lg text-sm border border-sky-500/15 ${
          currentPage === totalPages ? 'text-gray-600 pointer-events-none' : 'text-gray-300 hover:text-white hover:border-sky-500/40'
        }`}
      >
        Next
      </Link>
    </nav>
  )
}
