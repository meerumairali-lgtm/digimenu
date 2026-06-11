export default function QRLoading() {
  return (
    <div style={{ maxWidth: 480, margin: '40px auto', padding: '0 20px' }}>
      <div style={{ ...bar, width: 100, height: 28, marginBottom: 8 }} />
      <div style={{ ...bar, width: 260, height: 14, marginBottom: 32 }} />

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        <div style={{ ...bar, width: 280, height: 280, borderRadius: 12 }} />
        <div style={{ ...bar, width: 160, height: 16, marginBottom: 4 }} />
        <div style={{ ...bar, width: 240, height: 12 }} />
        <div style={{ display: 'flex', gap: 12, width: '100%' }}>
          <div style={{ ...bar, flex: 1, height: 42, borderRadius: 12 }} />
          <div style={{ ...bar, flex: 1, height: 42, borderRadius: 12 }} />
        </div>
      </div>
    </div>
  )
}

const bar = {
  background: '#e2e8f0',
  borderRadius: 6,
  animation: 'pulse 1.5s ease-in-out infinite',
}