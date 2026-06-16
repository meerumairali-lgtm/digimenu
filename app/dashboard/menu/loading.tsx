export default function MenuLoading() {
  return (
    <div style={{ maxWidth: 700, margin: '40px auto', padding: '0 20px' }}>
      {/* Header skeleton */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <div style={{ ...bar, width: 80, height: 28, marginBottom: 8 }} />
          <div style={{ ...bar, width: 140, height: 14 }} />
        </div>
        <div style={{ ...bar, width: 110, height: 36, borderRadius: 8 }} />
      </div>

      {/* Add category box skeleton */}
      <div style={{ background: '#f0f9ff', border: '1px solid #E0F2FE', borderRadius: 12, padding: 20, marginBottom: 24 }}>
        <div style={{ ...bar, width: 120, height: 16, marginBottom: 12 }} />
        <div style={{ ...bar, width: '100%', height: 36, borderRadius: 8 }} />
      </div>

      {/* Category card skeletons */}
      {[1, 2].map(i => (
        <div key={i} style={{ border: '1px solid #E0F2FE', borderRadius: 12, padding: 20, marginBottom: 16, background: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div style={{ ...bar, width: 120, height: 20, marginBottom: 6 }} />
              <div style={{ ...bar, width: 60, height: 12 }} />
            </div>
            <div style={{ ...bar, width: 64, height: 28, borderRadius: 6 }} />
          </div>
          {[1, 2, 3].map(j => (
            <div key={j} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f0f9ff' }}>
              <div>
                <div style={{ ...bar, width: 140, height: 14, marginBottom: 6 }} />
                <div style={{ ...bar, width: 200, height: 12 }} />
              </div>
              <div style={{ ...bar, width: 60, height: 14 }} />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

const bar = {
  background: '#E0F2FE',
  borderRadius: 6,
  animation: 'pulse 1.5s ease-in-out infinite',
}