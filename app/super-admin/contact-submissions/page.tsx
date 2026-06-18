import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function ContactSubmissionsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.email !== 'meerumairali@gmail.com') {
    redirect('/dashboard')
  }

  const { data: submissions } = await supabase
    .from('contact_submissions')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div
      style={{
        padding: '24px',
        maxWidth: '900px',
        margin: '0 auto',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: 700, margin: 0 }}>
          Contact Submissions
        </h1>
        <p style={{ color: '#6b7280', fontSize: '13px', margin: '4px 0 0' }}>
          {submissions?.length || 0} total messages
        </p>
      </div>

      {!submissions?.length ? (
        <div
          style={{
            background: '#111827',
            borderRadius: 12,
            padding: '3rem',
            textAlign: 'center',
          }}
        >
          <p style={{ color: '#6b7280', fontSize: 15, margin: 0 }}>
            No contact submissions yet.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {submissions.map((s: any) => (
            <div
              key={s.id}
              style={{
                background: '#111827',
                borderRadius: 12,
                padding: '20px 24px',
                border: '1px solid #1f2937',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: 12,
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{ color: '#fff', fontWeight: 600, fontSize: 15 }}>
                    {s.name}
                  </span>
                  <span style={{ color: '#6b7280', fontSize: 13 }}>{s.email}</span>
                  {s.phone && (
                    <span style={{ color: '#6b7280', fontSize: 13 }}>· {s.phone}</span>
                  )}
                </div>

                <span style={{ color: '#4b5563', fontSize: 12, flexShrink: 0 }}>
                  {new Date(s.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <p
                style={{
                  color: '#9ca3af',
                  fontSize: 14,
                  margin: '0 0 14px',
                  lineHeight: 1.7,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {s.message}
              </p>

              <a
                href={`mailto:${s.email}?subject=Re: Your message to Menuberg`}
                style={{
                  fontSize: 13,
                  color: '#38BDF8',
                  textDecoration: 'none',
                  padding: '6px 14px',
                  background: 'rgba(56,189,248,0.08)',
                  border: '1px solid rgba(56,189,248,0.2)',
                  borderRadius: 8,
                  display: 'inline-block',
                }}
              >
                Reply by email →
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}