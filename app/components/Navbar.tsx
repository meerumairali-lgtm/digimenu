import Link from 'next/link'
import Image from 'next/image'

export default function Navbar() {
  return (
    <header style={{ background: '#0D1B2A', borderBottom: '1px solid rgba(56,189,248,0.15)', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 2rem', height: '64px', display: 'flex', alignItems: 'center' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <Image src="/logo.png" alt="Menuberg" width={44} height={44} style={{ objectFit: 'contain' }} />
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
            <span style={{ fontSize: '20px', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.5px' }}>Menuberg</span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#38BDF8' }}>.com</span>
          </div>
        </Link>
      </div>
    </header>
  )
}