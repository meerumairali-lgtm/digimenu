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
        className={`px-3 py-2 rounded-lg text-sm border border-gray-200 ${
          currentPage === 1 ? 'text-gray-300 pointer-events-none' : 'text-gray-600 hover:text-[#0D1B2A] hover:border-sky-400'
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
            page === currentPage ? 'bg-sky-500 text-white font-semibold' : 'text-gray-600 hover:text-[#0D1B2A] border border-gray-200 hover:border-sky-400'
          }`}
        >
          {page}
        </Link>
      ))}

      <Link
        href={pageHref(Math.min(totalPages, currentPage + 1))}
        aria-disabled={currentPage === totalPages}
        className={`px-3 py-2 rounded-lg text-sm border border-gray-200 ${
          currentPage === totalPages ? 'text-gray-300 pointer-events-none' : 'text-gray-600 hover:text-[#0D1B2A] hover:border-sky-400'
        }`}
      >
        Next
      </Link>
    </nav>
  )
}
