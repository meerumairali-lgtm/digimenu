export default function DashboardLoading() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Nav skeleton */}
      <div style={{ background: '#0D1B2A', borderBottom: '1px solid rgba(56,189,248,0.15)', height: 56 }} />

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>
        {/* Heading skeleton */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ ...bar, width: 180, height: 28, marginBottom: 8 }} />
          <div style={{ ...bar, width: 280, height: 16 }} />
        </div>

        {/* Stat cards skeleton */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ ...card }}>
              <div style={{ ...bar, width: 80, height: 12, marginBottom: 10 }} />
              <div style={{ ...bar, width: 48, height: 28 }} />
            </div>
          ))}
        </div>

        {/* Action cards skeleton */}
        <div style={{ ...bar, width: 120, height: 12, marginBottom: 12 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ ...card }}>
              <div style={{ ...bar, width: 28, height: 28, marginBottom: 12 }} />
              <div style={{ ...bar, width: 100, height: 14, marginBottom: 6 }} />
              <div style={{ ...bar, width: 140, height: 12 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const bar = {
  background: '#E0F2FE',
  borderRadius: 6,
  animation: 'pulse 1.5s ease-in-out infinite',
}

const card = {
  background: '#fff',
  border: '1px solid #E0F2FE',
  borderRadius: 12,
  padding: 16,
}