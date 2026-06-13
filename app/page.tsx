import Link from 'next/link'
import FeaturesCarousel from './FeaturesCarousel'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = await createClient()
  const { data: rows } = await supabase.from('landing_content').select('key, value')

  const cms: Record<string, string> = {}
  ;(rows || []).forEach(r => { cms[r.key] = r.value || '' })

  const c = {
    heroBadge:        cms.hero_badge        || '✦ Now live in 12+ countries',
    heroLine1:        cms.hero_title_line1  || 'Your restaurant,',
    heroLine2:        cms.hero_title_line2  || 'online in minutes.',
    heroLine3:        cms.hero_title_line3  || 'Not months.',
    heroSubtitle:     cms.hero_subtitle     || 'A beautiful digital menu for the price of a burger a month. No coding. No expensive web agency. Just scan & order.',
    heroCta1:         cms.hero_cta_primary  || 'Create your menu free →',
    heroCta2:         cms.hero_cta_secondary || 'See a live example',
    stat1v:           cms.stat_1_value      || '2,400+',
    stat1l:           cms.stat_1_label      || 'Restaurants live',
    stat2v:           cms.stat_2_value      || '47',
    stat2l:           cms.stat_2_label      || 'Countries',
    stat3v:           cms.stat_3_value      || '$4.99',
    stat3l:           cms.stat_3_label      || 'Per month',
    stat4v:           cms.stat_4_value      || '5 min',
    stat4l:           cms.stat_4_label      || 'To go live',
    ctaTitle:         cms.cta_banner_title  || 'Ready to take your menu digital?',
    ctaSubtitle:      cms.cta_banner_subtitle || 'Join thousands of restaurants already using DigiMenu.',
  }

  let features: { icon: string; title: string; desc: string; image: string }[] = []
  try { features = JSON.parse(cms.features || '[]') } catch { features = [] }

  return (
    <main style={{ fontFamily: "'Inter', -apple-system, sans-serif", background: "#ffffff", color: "#111111", minHeight: "100vh" }}>

      {/* NAV */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 2rem", borderBottom: "1px solid #f0f0f0", position: "sticky", top: 0, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)", zIndex: 100 }}>
        <div style={{ fontSize: "20px", fontWeight: 700, color: "#f97316" }}>
          Digi<span style={{ color: "#111" }}>Menu</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link href="/login" style={{ fontSize: "14px", color: "#666", textDecoration: "none" }}>Log in</Link>
          <Link href="/signup" style={{ background: "#f97316", color: "#fff", padding: "8px 20px", borderRadius: "8px", fontSize: "14px", fontWeight: 600, textDecoration: "none" }}>
            Get started free
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ padding: "6rem 2rem 5rem", textAlign: "center", borderBottom: "1px solid #f0f0f0", background: "#fff" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#fff4ed", border: "1px solid #fed7aa", color: "#f97316", fontSize: "12px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase" as const, padding: "6px 16px", borderRadius: "20px", marginBottom: "2rem" }}>
          {c.heroBadge}
        </div>
        <h1 style={{ fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 800, lineHeight: 1.05, marginBottom: "1.5rem", letterSpacing: "-2px", color: "#111" }}>
          {c.heroLine1}<br />
          <span style={{ color: "#f97316" }}>{c.heroLine2}</span><br />
          {c.heroLine3}
        </h1>
        <p style={{ fontSize: "18px", color: "#666", maxWidth: "500px", margin: "0 auto 2.5rem", lineHeight: 1.7 }}>
          {c.heroSubtitle}
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" as const }}>
          <Link href="/signup" style={{ background: "#f97316", color: "#fff", padding: "15px 32px", borderRadius: "10px", fontSize: "16px", fontWeight: 600, textDecoration: "none" }}>
            {c.heroCta1}
          </Link>
          <Link href="/menu/spicy-box" style={{ background: "#fff", color: "#111", padding: "15px 32px", borderRadius: "10px", fontSize: "16px", fontWeight: 500, textDecoration: "none", border: "1px solid #e5e5e5" }}>
            {c.heroCta2}
          </Link>
        </div>
        <p style={{ marginTop: "1.2rem", fontSize: "13px", color: "#aaa" }}>
          Setup in under 5 minutes · No credit card required
        </p>
      </section>

      {/* STATS */}
      <div style={{ padding: "2.5rem 2rem", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", gap: "4rem", flexWrap: "wrap" as const, background: "#fafafa" }}>
        {[
          [c.stat1v, c.stat1l],
          [c.stat2v, c.stat2l],
          [c.stat3v, c.stat3l],
          [c.stat4v, c.stat4l],
        ].map(([num, label]) => (
          <div key={label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: "30px", fontWeight: 800, color: "#f97316", letterSpacing: "-1px" }}>{num}</div>
            <div style={{ fontSize: "13px", color: "#888", marginTop: "4px" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* FEATURES */}
      <FeaturesCarousel features={features} />

      {/* HOW IT WORKS */}
      <section style={{ padding: "6rem 2rem", background: "#fafafa", borderTop: "1px solid #f0f0f0", borderBottom: "1px solid #f0f0f0" }}>
        <div style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto 3.5rem" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase" as const, color: "#f97316", marginBottom: "0.8rem" }}>How it works</div>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, color: "#111", letterSpacing: "-1px" }}>
            From zero to live menu<br />in 3 simple steps
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "2rem", maxWidth: "800px", margin: "0 auto" }}>
          {[
            ["1", "Sign up free", "Create your account and choose your restaurant's unique URL in minutes."],
            ["2", "Build your menu", "Add categories, dishes, prices, photos and contact details easily."],
            ["3", "Print & share", "Download your QR code, stick it on your table, share your link everywhere."],
          ].map(([num, title, desc]) => (
            <div key={String(num)} style={{ textAlign: "center" }}>
              <div style={{ width: "52px", height: "52px", background: "#fff4ed", border: "2px solid #fed7aa", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.2rem", fontSize: "20px", fontWeight: 800, color: "#f97316" }}>
                {num}
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#111", marginBottom: "0.5rem" }}>{title}</h3>
              <p style={{ fontSize: "14px", color: "#888", lineHeight: 1.6, margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section style={{ padding: "6rem 2rem", textAlign: "center", background: "#fff" }}>
        <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase" as const, color: "#f97316", marginBottom: "0.8rem" }}>Pricing</div>
        <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, color: "#111", marginBottom: "0.5rem", letterSpacing: "-1px" }}>
          Less than a burger a month
        </h2>
        <p style={{ fontSize: "16px", color: "#888", marginBottom: "3rem" }}>
          Honest, simple pricing. Cancel anytime.
        </p>
        <div style={{ maxWidth: "440px", margin: "0 auto", background: "#fff", border: "2px solid #f97316", borderRadius: "20px", padding: "2.5rem 2rem", textAlign: "left", position: "relative", boxShadow: "0 20px 60px rgba(249,115,22,0.1)" }}>
          <div style={{ position: "absolute", top: "-14px", left: "50%", transform: "translateX(-50%)", background: "#f97316", color: "#fff", fontSize: "11px", fontWeight: 700, padding: "5px 20px", borderRadius: "20px", whiteSpace: "nowrap" as const, letterSpacing: "0.5px" }}>
            Everything included
          </div>
          <div style={{ marginBottom: "1.5rem", paddingBottom: "1.5rem", borderBottom: "1px solid #f0f0f0" }}>
            <div style={{ fontSize: "11px", color: "#aaa", textTransform: "uppercase" as const, letterSpacing: "1px", marginBottom: "0.5rem" }}>One-time setup</div>
            <div style={{ fontSize: "44px", fontWeight: 800, color: "#111", lineHeight: 1, letterSpacing: "-2px" }}>
              <sup style={{ fontSize: "20px", color: "#f97316", verticalAlign: "top", marginTop: "10px", fontWeight: 700 }}>$</sup>17.90
            </div>
            <p style={{ fontSize: "13px", color: "#888", margin: "8px 0 0" }}>Pay once. Your menu page is created, configured and ready to share.</p>
          </div>
          <div style={{ marginBottom: "2rem" }}>
            <div style={{ fontSize: "11px", color: "#aaa", textTransform: "uppercase" as const, letterSpacing: "1px", marginBottom: "0.5rem" }}>Then just</div>
            <div style={{ fontSize: "44px", fontWeight: 800, color: "#111", lineHeight: 1, letterSpacing: "-2px" }}>
              <sup style={{ fontSize: "20px", color: "#f97316", verticalAlign: "top", marginTop: "10px", fontWeight: 700 }}>$</sup>4.99
              <sub style={{ fontSize: "15px", color: "#aaa", fontWeight: 400, letterSpacing: 0 }}>/month</sub>
            </div>
            <p style={{ fontSize: "13px", color: "#888", margin: "8px 0 0" }}>Less than a coffee. Keep your menu live, updated and always accessible.</p>
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 2rem", display: "flex", flexDirection: "column" as const, gap: "10px" }}>
            {["Your own URL — digimenu.com/yourname","QR code you can print anywhere","Unlimited categories & menu items","4 menu layouts + 4 themes","WhatsApp, socials & contact info","Instant updates anytime","Mobile-perfect on every device"].map(f => (
              <li key={f} style={{ fontSize: "14px", color: "#444", display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ color: "#f97316", fontWeight: 700, flexShrink: 0, fontSize: "16px" }}>✓</span>{f}
              </li>
            ))}
          </ul>
          <Link href="/signup" style={{ display: "block", padding: "15px", borderRadius: "10px", fontSize: "16px", fontWeight: 700, background: "#f97316", color: "#fff", textDecoration: "none", textAlign: "center" as const }}>
            Get your menu now →
          </Link>
        </div>
        <p style={{ marginTop: "1.5rem", fontSize: "13px", color: "#bbb" }}>7-day free trial · Cancel anytime · No hidden fees</p>
      </section>

      {/* CTA BANNER */}
      <section style={{ margin: "0 2rem 5rem", background: "#f97316", borderRadius: "20px", padding: "4rem 2rem", textAlign: "center" }}>
        <h2 style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 800, color: "#fff", marginBottom: "1rem", letterSpacing: "-1px" }}>
          {c.ctaTitle}
        </h2>
        <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.8)", marginBottom: "2rem" }}>
          {c.ctaSubtitle}
        </p>
        <Link href="/signup" style={{ display: "inline-block", background: "#fff", color: "#f97316", padding: "15px 36px", borderRadius: "10px", fontSize: "16px", fontWeight: 700, textDecoration: "none" }}>
          Start for free →
        </Link>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: "2rem", borderTop: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" as const, gap: "1rem" }}>
        <div style={{ fontSize: "18px", fontWeight: 700, color: "#f97316" }}>
          DigiMenu <span style={{ color: "#bbb", fontSize: "14px", fontWeight: 400 }}>· Digital menus for everyone</span>
        </div>
        <div style={{ display: "flex", gap: "1.5rem" }}>
          {["About", "Contact", "Privacy"].map(l => (
            <a key={l} href="#" style={{ fontSize: "13px", color: "#aaa", textDecoration: "none" }}>{l}</a>
          ))}
        </div>
        <p style={{ fontSize: "12px", color: "#ccc", width: "100%", margin: 0 }}>© 2025 DigiMenu. Built for small restaurants worldwide.</p>
      </footer>

    </main>
  )
}