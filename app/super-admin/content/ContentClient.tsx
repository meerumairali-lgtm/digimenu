'use client'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Feature { icon: string; title: string; desc: string; image: string }

function Field({ label, value, onChange, multiline = false }: {
  label: string; value: string; onChange: (v: string) => void; multiline?: boolean
}) {
  const base: React.CSSProperties = { width: '100%', background: '#111827', color: '#fff', border: '1px solid #374151', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }
  return (
    <div>
      <label style={{ display: 'block', color: '#9ca3af', fontSize: '12px', marginBottom: '4px' }}>{label}</label>
      {multiline
        ? <textarea value={value} onChange={e => onChange(e.target.value)} rows={2} style={{ ...base, resize: 'none' }} />
        : <input type="text" value={value} onChange={e => onChange(e.target.value)} style={base} />
      }
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#111827', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h2 style={{ color: '#fff', fontSize: '16px', fontWeight: 600, margin: 0 }}>{title}</h2>
      {children}
    </div>
  )
}

export default function ContentClient({ initialContent }: { initialContent: Record<string, string> }) {
  const supabase = createClient()
  const [c, setC] = useState(initialContent)
  const [features, setFeatures] = useState<Feature[]>(() => {
    try { return JSON.parse(initialContent.features || '[]') } catch { return [] }
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null)
  const fileRefs = useRef<Record<number, HTMLInputElement | null>>({})

  function set(key: string, value: string) {
    setC(prev => ({ ...prev, [key]: value }))
  }

  function setFeat(i: number, field: keyof Feature, value: string) {
    setFeatures(prev => prev.map((f, idx) => idx === i ? { ...f, [field]: value } : f))
  }

  async function handleFeatureImageUpload(index: number, file: File) {
    setUploadingIndex(index)
    const ext = file.name.split('.').pop()
    const fileName = `_landing/features/feature-${index}-${Date.now()}.${ext}`
    const { data, error } = await supabase.storage
      .from('restaurant-branding')
      .upload(fileName, file, { upsert: true })
    if (!error && data) {
      const { data: urlData } = supabase.storage
        .from('restaurant-branding')
        .getPublicUrl(fileName)
      setFeat(index, 'image', urlData.publicUrl)
    } else {
      console.error('Feature image upload failed:', error)
    }
    setUploadingIndex(null)
  }

  async function save() {
    setSaving(true)
    const updates = [
      ...Object.entries(c).filter(([k]) => k !== 'features').map(([key, value]) => ({ key, value })),
      { key: 'features', value: JSON.stringify(features) },
    ]
    for (const u of updates) {
      await supabase.from('landing_content').upsert(u, { onConflict: 'key' })
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div style={{ padding: '24px', maxWidth: '860px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: 'sans-serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: 700, margin: 0 }}>Landing Page Content</h1>
          <p style={{ color: '#6b7280', fontSize: '13px', margin: '4px 0 0' }}>Changes go live instantly — no deploy needed.</p>
        </div>
        <button onClick={save} disabled={saving}
          style={{ background: saving ? '#1A3A5C' : saved ? '#15803d' : '#38BDF8', color: saving ? '#7DD3FC' : saved ? '#fff' : '#0D1B2A', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
          {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Hero */}
      <Card title="Hero Section">
        <Field label="Badge text" value={c.hero_badge || ''} onChange={v => set('hero_badge', v)} />
        <Field label="Title line 1" value={c.hero_title_line1 || ''} onChange={v => set('hero_title_line1', v)} />
        <Field label="Title line 2 (blue)" value={c.hero_title_line2 || ''} onChange={v => set('hero_title_line2', v)} />
        <Field label="Title line 3" value={c.hero_title_line3 || ''} onChange={v => set('hero_title_line3', v)} />
        <Field label="Subtitle" value={c.hero_subtitle || ''} onChange={v => set('hero_subtitle', v)} multiline />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <Field label="Primary button" value={c.hero_cta_primary || ''} onChange={v => set('hero_cta_primary', v)} />
          <Field label="Secondary button" value={c.hero_cta_secondary || ''} onChange={v => set('hero_cta_secondary', v)} />
        </div>
      </Card>

      {/* Stats */}
      <Card title="Stats Bar">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
          {[1, 2, 3, 4].map(n => (
            <div key={n} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ color: '#9ca3af', fontSize: '12px' }}>Stat {n}</label>
              <input type="text" placeholder="Value" value={c[`stat_${n}_value`] || ''} onChange={e => set(`stat_${n}_value`, e.target.value)}
                style={{ background: '#111827', color: '#fff', border: '1px solid #374151', borderRadius: '8px', padding: '7px 10px', fontSize: '13px', outline: 'none' }} />
              <input type="text" placeholder="Label" value={c[`stat_${n}_label`] || ''} onChange={e => set(`stat_${n}_label`, e.target.value)}
                style={{ background: '#111827', color: '#fff', border: '1px solid #374151', borderRadius: '8px', padding: '7px 10px', fontSize: '13px', outline: 'none' }} />
            </div>
          ))}
        </div>
      </Card>

      {/* CTA Banner */}
      <Card title="CTA Banner">
        <Field label="Title" value={c.cta_banner_title || ''} onChange={v => set('cta_banner_title', v)} />
        <Field label="Subtitle" value={c.cta_banner_subtitle || ''} onChange={v => set('cta_banner_subtitle', v)} />
      </Card>

      {/* Contact Section */}
      <Card title="Contact Section">
        <Field label="Heading" value={c.contact_heading || ''} onChange={v => set('contact_heading', v)} />
        <Field label="Subheading" value={c.contact_subheading || ''} onChange={v => set('contact_subheading', v)} multiline />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <Field label="Email address" value={c.contact_email || ''} onChange={v => set('contact_email', v)} />
          <Field label="Phone number" value={c.contact_phone || ''} onChange={v => set('contact_phone', v)} />
        </div>
        <Field label="Address (optional)" value={c.contact_address || ''} onChange={v => set('contact_address', v)} />
      </Card>

      {/* Features */}
      <Card title={`Features Carousel (${features.length})`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {features.map((f, i) => (
            <div key={i} style={{ background: '#1f2937', borderRadius: '8px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#6b7280', fontSize: '12px' }}>Feature {i + 1}</span>
                <button onClick={() => setFeatures(prev => prev.filter((_, idx) => idx !== i))}
                  style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '12px', cursor: 'pointer' }}>Remove</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px' }}>
                <div>
                  <label style={{ color: '#9ca3af', fontSize: '11px', display: 'block', marginBottom: '4px' }}>Icon</label>
                  <input type="text" value={f.icon} onChange={e => setFeat(i, 'icon', e.target.value)}
                    style={{ width: '100%', background: '#111827', color: '#fff', border: '1px solid #374151', borderRadius: '6px', padding: '6px 8px', fontSize: '18px', outline: 'none', textAlign: 'center', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ color: '#9ca3af', fontSize: '11px', display: 'block', marginBottom: '4px' }}>Title</label>
                  <input type="text" value={f.title} onChange={e => setFeat(i, 'title', e.target.value)}
                    style={{ width: '100%', background: '#111827', color: '#fff', border: '1px solid #374151', borderRadius: '6px', padding: '6px 8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div>
                <label style={{ color: '#9ca3af', fontSize: '11px', display: 'block', marginBottom: '4px' }}>Description</label>
                <input type="text" value={f.desc} onChange={e => setFeat(i, 'desc', e.target.value)}
                  style={{ width: '100%', background: '#111827', color: '#fff', border: '1px solid #374151', borderRadius: '6px', padding: '6px 8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
              </div>

              {/* Image upload */}
              <div>
                <label style={{ color: '#9ca3af', fontSize: '11px', display: 'block', marginBottom: '6px' }}>Image</label>
                <div
                  onClick={() => fileRefs.current[i]?.click()}
                  style={{ border: '1px dashed #374151', borderRadius: '8px', padding: '12px', cursor: 'pointer', background: '#111827', display: 'flex', alignItems: 'center', gap: '12px' }}
                >
                  {uploadingIndex === i ? (
                    <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>Uploading...</p>
                  ) : f.image ? (
                    <>
                      <img
                        src={f.image}
                        alt=""
                        style={{ width: 56, height: 56, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }}
                      />
                      <div>
                        <p style={{ margin: 0, fontSize: '13px', color: '#38BDF8' }}>Tap to change image</p>
                        <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#6b7280', wordBreak: 'break-all' }}>
                          {f.image.split('/').pop()}
                        </p>
                      </div>
                    </>
                  ) : (
                    <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
                      📷 Tap to upload feature image
                    </p>
                  )}
                  <input
                    ref={el => { fileRefs.current[i] = el }}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={e => {
                      const file = e.target.files?.[0]
                      if (file) handleFeatureImageUpload(i, file)
                    }}
                  />
                </div>
              </div>

            </div>
          ))}
          <button
            onClick={() => setFeatures(prev => [...prev, { icon: '⭐', title: 'New Feature', desc: 'Feature description', image: '' }])}
            style={{ background: 'none', border: '1px dashed #374151', borderRadius: '8px', color: '#38BDF8', padding: '10px', fontSize: '13px', cursor: 'pointer' }}>
            + Add Feature
          </button>
        </div>
      </Card>

    </div>
  )
}