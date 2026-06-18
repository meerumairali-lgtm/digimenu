import Link from 'next/link'
import Image from 'next/image'
import FeaturesCarousel from './FeaturesCarousel'
import { createClient } from '@/lib/supabase/server'
import LandingNav from './components/LandingNav'
import ContactSection from './components/ContactSection'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = await createClient()
  const { data: rows } = await supabase.from('landing_content').select('key, value')

  const cms: Record<string, string> = {}
    ; (rows || []).forEach(r => { cms[r.key] = r.value || '' })

  const c = {
    heroBadge: cms.hero_badge || '✦ Now live in 12+ countries',
    heroLine1: cms.hero_title_line1 || 'Your restaurant,',
    heroLine2: cms.hero_title_line2 || 'online in minutes.',
    heroLine3: cms.hero_title_line3 || 'Not months.',
    heroSubtitle: cms.hero_subtitle || 'A beautiful digital menu for the price of a burger a month. No coding. No expensive web agency. Just scan & order.',
    heroCta1: cms.hero_cta_primary || 'Create your menu free →',
    heroCta2: cms.hero_cta_secondary || 'See a live example',
    stat1v: cms.stat_1_value || '2,400+',
    stat1l: cms.stat_1_label || 'Restaurants live',
    stat2v: cms.stat_2_value || '47',
    stat2l: cms.stat_2_label || 'Countries',
    stat3v: cms.stat_3_value || '$4.99',
    stat3l: cms.stat_3_label || 'Per month',
    stat4v: cms.stat_4_value || '5 min',
    stat4l: cms.stat_4_label || 'To go live',
    ctaTitle: cms.cta_banner_title || 'Ready to take your menu digital?',
    ctaSubtitle: cms.cta_banner_subtitle || 'Join thousands of restaurants already using Menuberg.',
    // Contact section
    contactHeading: cms.contact_heading || "Let's get in touch",
    contactSubheading: cms.contact_subheading || "Can't find what you're looking for? Send us a message and we'll get back to you as soon as possible.",
    contactEmail: cms.contact_email || 'hello@menuberg.com',
    contactPhone: cms.contact_phone || '',
    contactAddress: cms.contact_address || '',
  }

  let features: { icon: string; title: string; desc: string; image: string }[] = []
  try { features = JSON.parse(cms.features || '[]') } catch { features = [] }

  return (
    <main style={{ fontFamily: "'Inter', -apple-system, sans-serif", background: "#ffffff", color: "#111111", minHeight: "100vh" }}>

      <LandingNav />

      {/* HERO */}
      <section style={{ padding: "6rem 2rem 5rem", textAlign: "center", background: "#0D1B2A" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.3)", color: "#38BDF8", fontSize: "12px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase" as const, padding: "6px 16px", borderRadius: "20px", marginBottom: "2rem" }}>
          {c.heroBadge}
        </div>
        <h1 style={{ fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 800, lineHeight: 1.05, marginBottom: "1.5rem", letterSpacing: "-2px", color: "#ffffff" }}>
          {c.heroLine1}<br />
          <span style={{ color: "#38BDF8" }}>{c.heroLine2}</span><br />
          {c.heroLine3}
        </h1>
        <p style={{ fontSize: "18px", color: "#7DD3FC", maxWidth: "500px", margin: "0 auto 2.5rem", lineHeight: 1.7 }}>
          {c.heroSubtitle}
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" as const }}>
          <Link href="/signup" style={{ background: "#38BDF8", color: "#0D1B2A", padding: "15px 32px", borderRadius: "10px", fontSize: "16px", fontWeight: 700, textDecoration: "none" }}>
            {c.heroCta1}
          </Link>
          <Link href="/spicy-box" style={{ background: "transparent", color: "#ffffff", padding: "15px 32px", borderRadius: "10px", fontSize: "16px", fontWeight: 500, textDecoration: "none", border: "1px solid rgba(255,255,255,0.2)" }}>
            {c.heroCta2}
          </Link>
        </div>
        <p style={{ marginTop: "1.2rem", fontSize: "13px", color: "rgba(125,211,252,0.6)" }}>
          Setup in under 5 minutes · No credit card required
        </p>
      </section>

      {/* STATS */}
      <div style={{ padding: "2.5rem 2rem", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", gap: "4rem", flexWrap: "wrap" as const, background: "#E0F2FE" }}>
        {[
          [c.stat1v, c.stat1l],
          [c.stat2v, c.stat2l],
          [c.stat3v, c.stat3l],
          [c.stat4v, c.stat4l],
        ].map(([num, label]) => (
          <div key={label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: "30px", fontWeight: 800, color: "#0D1B2A", letterSpacing: "-1px" }}>{num}</div>
            <div style={{ fontSize: "13px", color: "#1A3A5C", marginTop: "4px" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* FEATURES */}
      <div id="features">
        <FeaturesCarousel features={features} />
      </div>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{ padding: "6rem 2rem", background: "#fafafa", borderTop: "1px solid #f0f0f0", borderBottom: "1px solid #f0f0f0" }}>
        <div style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto 3.5rem" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase" as const, color: "#38BDF8", marginBottom: "0.8rem" }}>How it works</div>
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
              <div style={{ width: "52px", height: "52px", background: "#E0F2FE", border: "2px solid #7DD3FC", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.2rem", fontSize: "20px", fontWeight: 800, color: "#0D1B2A" }}>
                {num}
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#111", marginBottom: "0.5rem" }}>{title}</h3>
              <p style={{ fontSize: "14px", color: "#888", lineHeight: 1.6, margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ padding: "6rem 2rem", textAlign: "center", background: "#fff" }}>
        <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase" as const, color: "#38BDF8", marginBottom: "0.8rem" }}>Pricing</div>
        <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, color: "#111", marginBottom: "0.5rem", letterSpacing: "-1px" }}>
          Less than a burger a month
        </h2>
        <p style={{ fontSize: "16px", color: "#888", marginBottom: "3rem" }}>
          Honest, simple pricing. Cancel anytime.
        </p>

        <div style={{ maxWidth: "440px", margin: "0 auto", background: "#fff", border: "2px solid #38BDF8", borderRadius: "20px", padding: "2.5rem 2rem", textAlign: "left", position: "relative", boxShadow: "0 20px 60px rgba(56,189,248,0.1)" }}>
          <div style={{ position: "absolute", top: "-14px", left: "50%", transform: "translateX(-50%)", background: "#38BDF8", color: "#0D1B2A", fontSize: "11px", fontWeight: 700, padding: "5px 20px", borderRadius: "20px", whiteSpace: "nowrap" as const, letterSpacing: "0.5px" }}>
            Your professional digital storefront
          </div>

          {/* Subscription Section with Premium Limited Offer Badge */}
          <div style={{ marginBottom: "1.5rem", paddingBottom: "1.5rem", borderBottom: "1px solid #f0f0f0" }}>
            <div style={{ fontSize: "11px", color: "#aaa", textTransform: "uppercase" as const, letterSpacing: "1px", marginBottom: "0.8rem" }}>Subscription</div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
              <div>
                {/* Crossed out old price */}
                <div style={{ fontSize: "16px", color: "#aaa", textDecoration: "line-through", fontWeight: 500, marginBottom: "2px", marginLeft: "2px" }}>
                  $12.50
                </div>
                {/* New price */}
                <div style={{ display: "flex", alignItems: "flex-start", color: "#111", fontWeight: 800, letterSpacing: "-2px", lineHeight: 1 }}>
                  <span style={{ fontSize: "22px", color: "#38BDF8", fontWeight: 700, marginTop: "4px", marginRight: "2px" }}>$</span>
                  <span style={{ fontSize: "48px" }}>4.99</span>
                  <span style={{ fontSize: "15px", color: "#aaa", fontWeight: 400, letterSpacing: 0, alignSelf: "flex-end", marginBottom: "6px", marginLeft: "4px" }}>/month</span>
                </div>
              </div>

              {/* Premium Badge */}
              <div style={{ background: "#0D1B2A", border: "1px solid rgba(245, 158, 11, 0.3)", borderRadius: "8px", padding: "6px 12px", textAlign: "center", boxShadow: "0 4px 12px rgba(13,27,42,0.15)" }}>
                <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.7)", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase" as const, marginBottom: "1px" }}>
                  Limited Time Offer
                </div>
                <div style={{ fontSize: "14px", color: "#F59E0B", fontWeight: 800, letterSpacing: "0.5px" }}>
                  60% OFF
                </div>
              </div>
            </div>

            <p style={{ fontSize: "13px", color: "#888", margin: "12px 0 0" }}>Less than the price of a burger. Keep your menu live, modern, and always online.</p>
          </div>

          {/* One-Time Setup */}
          <div style={{ marginBottom: "2rem" }}>
            <div style={{ fontSize: "11px", color: "#aaa", textTransform: "uppercase" as const, letterSpacing: "1px", marginBottom: "0.5rem" }}>One-Time Setup Fee</div>

            <div style={{ display: "flex", alignItems: "flex-start", color: "#444", fontWeight: 800, letterSpacing: "-1px", lineHeight: 1 }}>
              <span style={{ fontSize: "18px", color: "#38BDF8", fontWeight: 700, marginTop: "2px", marginRight: "2px" }}>$</span>
              <span style={{ fontSize: "36px" }}>17.90</span>
            </div>

            <p style={{ fontSize: "13px", color: "#888", margin: "10px 0 0" }}>
              <strong>We set it up for you.</strong> Send us your menu and we’ll configure your page so it's ready to launch flawlessly.
            </p>
          </div>

          {/* Value Props */}
          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 2rem", display: "flex", flexDirection: "column" as const, gap: "12px" }}>
            {[
              "Your storefront live at — menuberg.com/yourname",
              "High-quality QR codes to print on tables and packaging",
              "Unlimited categories, items, and photos",
              "An affordable digital presence that works just like a website",
              "Complete pages featuring your Menu, About section, and Contact info",
              "Instant updates to change prices or hide sold-out items",
              "Fully mobile-responsive for all screen sizes"
            ].map(f => (
              <li key={f} style={{ fontSize: "14px", color: "#333", display: "flex", alignItems: "flex-start", gap: "10px", lineHeight: "1.4" }}>
                <span style={{ color: "#38BDF8", fontWeight: 700, flexShrink: 0, fontSize: "16px" }}>✓</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>

          {/* Action CTA */}
          <Link href="/signup" style={{ display: "block", padding: "15px", borderRadius: "10px", fontSize: "16px", fontWeight: 700, background: "#38BDF8", color: "#0D1B2A", textDecoration: "none", textAlign: "center" as const }}>
            Launch your storefront
          </Link>
        </div>

        <p style={{ marginTop: "1.5rem", fontSize: "13px", color: "#bbb" }}>7-day free trial · Cancel anytime · No contract or setup hassle</p>
      </section>

            {/* CONTACT */}
      <ContactSection
        heading={c.contactHeading}
        subheading={c.contactSubheading}
        email={c.contactEmail}
        phone={c.contactPhone}
        address={c.contactAddress}
      />

      {/* CTA BANNER */}
      <section style={{ margin: "0 2rem 5rem", background: "#0D1B2A", borderRadius: "20px", padding: "4rem 2rem", textAlign: "center" }}>
        <h2 style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 800, color: "#fff", marginBottom: "1rem", letterSpacing: "-1px" }}>
          {c.ctaTitle}
        </h2>
        <p style={{ fontSize: "16px", color: "#7DD3FC", marginBottom: "2rem" }}>
          {c.ctaSubtitle}
        </p>
        <Link href="/signup" style={{ display: "inline-block", background: "#38BDF8", color: "#0D1B2A", padding: "15px 36px", borderRadius: "10px", fontSize: "16px", fontWeight: 700, textDecoration: "none" }}>
          Start for free →
        </Link>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: "2rem", borderTop: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" as const, gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Image src="/logo.png" alt="Menuberg" width={28} height={28} style={{ objectFit: "contain" }} />
          <span style={{ fontSize: "18px", fontWeight: 700, color: "#0D1B2A" }}>Menuberg <span style={{ color: "#bbb", fontSize: "14px", fontWeight: 400 }}>· Digital menus for everyone</span></span>
        </div>
        <div style={{ display: "flex", gap: "1.5rem" }}>
          <a href="#" style={{ fontSize: "13px", color: "#aaa", textDecoration: "none" }}>About</a>
          <a href="#contact" style={{ fontSize: "13px", color: "#aaa", textDecoration: "none" }}>Contact</a>
          <a href="#" style={{ fontSize: "13px", color: "#aaa", textDecoration: "none" }}>Privacy</a>
        </div>
        <p style={{ fontSize: "12px", color: "#ccc", width: "100%", margin: 0 }}>© 2025 Menuberg. Built for small restaurants worldwide.</p>
      </footer>

    </main>
  )
}