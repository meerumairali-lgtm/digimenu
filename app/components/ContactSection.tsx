'use client'

import { useState } from 'react'

interface Props {
  heading: string
  subheading: string
  email: string
  phone: string
  address: string
}

export default function ContactSection({ heading, subheading, email, phone, address }: Props) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function handleSubmit() {
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return
    setStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setStatus('sent')
        setForm({ name: '', email: '', phone: '', message: '' })
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: '#0D1B2A',
    border: '1px solid rgba(56,189,248,0.2)',
    borderRadius: 10,
    padding: '12px 14px',
    color: '#fff',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  }

  return (
    <section id="contact" style={{ padding: '6rem 2rem', background: '#0D1B2A', borderTop: '1px solid rgba(56,189,248,0.1)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' as const, color: '#38BDF8', marginBottom: '0.8rem' }}>
            Contact
          </div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, color: '#fff', letterSpacing: '-1px', lineHeight: 1.15, margin: 0 }}>
            {heading}
          </h2>
          <p style={{ fontSize: '16px', color: '#7DD3FC', marginTop: '1rem', maxWidth: 520, margin: '1rem auto 0', lineHeight: 1.7 }}>
            {subheading}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', alignItems: 'start' }}>

          {/* Left: Info */}
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '1.5rem' }}>
            {email ? (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ width: 48, height: 48, background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>✉️</div>
                <div>
                  <div style={{ fontSize: 11, color: '#38BDF8', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' as const, marginBottom: 6 }}>Email us</div>
                  <a href={`mailto:${email}`} style={{ color: '#E0F2FE', fontSize: 15, textDecoration: 'none' }}>{email}</a>
                </div>
              </div>
            ) : null}

            {phone ? (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ width: 48, height: 48, background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>📞</div>
                <div>
                  <div style={{ fontSize: 11, color: '#38BDF8', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' as const, marginBottom: 6 }}>Call us</div>
                  <a href={`tel:${phone}`} style={{ color: '#E0F2FE', fontSize: 15, textDecoration: 'none' }}>{phone}</a>
                </div>
              </div>
            ) : null}

            {address ? (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ width: 48, height: 48, background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>📍</div>
                <div>
                  <div style={{ fontSize: 11, color: '#38BDF8', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' as const, marginBottom: 6 }}>Find us</div>
                  <p style={{ color: '#E0F2FE', fontSize: 15, margin: 0, lineHeight: 1.6 }}>{address}</p>
                </div>
              </div>
            ) : null}

            {/* Tip card */}
            <div style={{ padding: '1.5rem', background: 'rgba(56,189,248,0.05)', border: '1px solid rgba(56,189,248,0.12)', borderRadius: 16 }}>
              <p style={{ color: '#7DD3FC', fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                💬 We typically reply within <strong style={{ color: '#38BDF8' }}>24 hours</strong>. Restaurant owners can also use the in-dashboard support chat for faster help.
              </p>
            </div>
          </div>

          {/* Right: Form */}
          <div style={{ background: '#112240', borderRadius: 20, padding: '2.5rem', border: '1px solid rgba(56,189,248,0.15)', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            {status === 'sent' ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div style={{ width: 64, height: 64, background: 'rgba(56,189,248,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: 30, color: '#38BDF8' }}>✓</div>
                <h3 style={{ color: '#38BDF8', fontSize: 22, fontWeight: 700, margin: '0 0 8px' }}>Message sent!</h3>
                <p style={{ color: '#7DD3FC', fontSize: 15, margin: '0 0 1.5rem', lineHeight: 1.6 }}>Thanks for reaching out. We'll get back to you as soon as possible.</p>
                <button
                  onClick={() => setStatus('idle')}
                  style={{ color: '#38BDF8', background: 'none', border: '1px solid rgba(56,189,248,0.3)', borderRadius: 8, padding: '8px 20px', fontSize: 14, cursor: 'pointer' }}
                >
                  Send another message
                </button>
              </div>
            ) : (
              <>
                <h3 style={{ color: '#fff', fontSize: 20, fontWeight: 700, margin: '0 0 1.5rem' }}>Send us a message</h3>
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', color: '#7DD3FC', fontSize: 13, marginBottom: 6, fontWeight: 500 }}>Full Name *</label>
                    <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Your name" style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#7DD3FC', fontSize: 13, marginBottom: 6, fontWeight: 500 }}>Email *</label>
                    <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="you@example.com" style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#7DD3FC', fontSize: 13, marginBottom: 6, fontWeight: 500 }}>
                      Phone{' '}
                      <span style={{ color: '#38BDF8', fontSize: 11, fontWeight: 400 }}>(optional)</span>
                    </label>
                    <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+1 (555) 000-0000" style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#7DD3FC', fontSize: 13, marginBottom: 6, fontWeight: 500 }}>Message *</label>
                    <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} placeholder="How can we help you?" rows={4} style={{ ...inputStyle, resize: 'none' as const }} />
                  </div>
                  {status === 'error' && (
                    <p style={{ color: '#ef4444', fontSize: 13, margin: 0 }}>Something went wrong. Please try again.</p>
                  )}
                  <button
                    onClick={handleSubmit}
                    disabled={status === 'sending'}
                    style={{
                      background: status === 'sending' ? '#1A3A5C' : '#38BDF8',
                      color: status === 'sending' ? '#7DD3FC' : '#0D1B2A',
                      border: 'none', borderRadius: 10, padding: '14px', fontSize: 15, fontWeight: 700,
                      cursor: status === 'sending' ? 'default' : 'pointer',
                      transition: 'all 0.2s', width: '100%',
                    }}
                  >
                    {status === 'sending' ? 'Sending...' : 'Send Message →'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}