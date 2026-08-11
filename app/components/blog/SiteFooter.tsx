import Link from 'next/link'
import Image from 'next/image'

export default function SiteFooter() {
  return (
    <footer className="border-t border-gray-200 mt-20">
      <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="Menuberg" width={26} height={26} className="object-contain" />
          <span className="text-[#0D1B2A] font-bold text-base">
            Menuberg <span className="text-gray-400 font-normal text-sm">· Every business deserves a website</span>
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
          <Link href="/" className="text-gray-500 hover:text-sky-600 transition-colors">Home</Link>
          <Link href="/blog" className="text-gray-500 hover:text-sky-600 transition-colors">Blog</Link>
          <Link href="/pricing" className="text-gray-500 hover:text-sky-600 transition-colors">Pricing</Link>
          <Link href="/terms" className="text-gray-500 hover:text-sky-600 transition-colors">Terms</Link>
          <Link href="/privacy" className="text-gray-500 hover:text-sky-600 transition-colors">Privacy</Link>
        </div>
      </div>
      <p className="text-center text-xs text-gray-400 pb-8">© {new Date().getFullYear()} Menuberg. Built for small restaurants worldwide.</p>
    </footer>
  )
}
