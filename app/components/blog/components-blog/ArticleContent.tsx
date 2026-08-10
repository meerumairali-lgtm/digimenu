import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import type { Components } from 'react-markdown'

const components: Components = {
  h2: ({ children, ...props }) => (
    <h2
      {...props}
      className="text-2xl md:text-[28px] font-bold text-white mt-12 mb-4 scroll-mt-24 leading-tight"
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3
      {...props}
      className="text-xl md:text-[22px] font-semibold text-white mt-9 mb-3 scroll-mt-24 leading-tight"
    >
      {children}
    </h3>
  ),
  p: ({ children }) => <p className="text-[17px] text-gray-200 leading-[1.8] mb-5">{children}</p>,
  a: ({ children, href }) => (
    <a
      href={href}
      target={href?.startsWith('http') ? '_blank' : undefined}
      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
      className="text-sky-400 underline decoration-sky-400/40 underline-offset-2 hover:text-sky-300 hover:decoration-sky-300"
    >
      {children}
    </a>
  ),
  ul: ({ children }) => <ul className="list-disc pl-6 mb-5 space-y-2 text-gray-200 text-[17px] leading-[1.8]">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-6 mb-5 space-y-2 text-gray-200 text-[17px] leading-[1.8]">{children}</ol>,
  li: ({ children }) => <li className="pl-1">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-sky-500 pl-5 my-6 text-gray-300 italic">{children}</blockquote>
  ),
  hr: () => <hr className="border-gray-800 my-10" />,
  strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
  code: ({ children }) => (
    <code className="bg-gray-800 border border-gray-700 rounded px-1.5 py-0.5 text-[14px] text-sky-300 font-mono">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="bg-gray-900 border border-gray-800 rounded-lg p-4 overflow-x-auto mb-6 text-sm">{children}</pre>
  ),
  img: ({ src, alt }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={typeof src === 'string' ? src : undefined} alt={alt ?? ''} loading="lazy" className="rounded-lg w-full h-auto my-6" />
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto my-6">
      <table className="w-full text-sm border-collapse">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-gray-700 bg-gray-800 text-left text-white font-semibold px-3 py-2">{children}</th>
  ),
  td: ({ children }) => <td className="border border-gray-700 px-3 py-2 text-gray-300">{children}</td>,
}

export default function ArticleContent({ markdown }: { markdown: string }) {
  return (
    <div>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]} components={components}>
        {markdown}
      </ReactMarkdown>
    </div>
  )
}
