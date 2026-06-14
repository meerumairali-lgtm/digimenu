import Link from 'next/link'
import Image from 'next/image'

export default function Navbar() {
  return (
    <header style={{ background: '#0D1B2A', borderBottom: '1px solid rgba(56,189,248,0.15)', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 2rem', height: '64px', display: 'flex', alignItems: 'center' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <Image src="/logo.png" alt="Menuberg" width={40} height={40} style={{ objectFit: 'contain' }} />
          <span style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.5px' }}>Menuberg</span>
        </Link>
      </div>
    </header>
  )
}