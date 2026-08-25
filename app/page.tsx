import Link from 'next/link'
import Image from 'next/image'
import FeaturesCarousel from './FeaturesCarousel'
import { createClient } from '@/lib/supabase/server'
import LandingNav from './components/LandingNav'
import ContactSection from './components/ContactSection'
import PricingBanner from './components/PricingBanner'
import LivePriceStat from '@/app/components/LivePriceStat'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Menuberg — Restaurant Website & Menu Builder | Live in Minutes',
  description: 'Build a beautiful digital menu website for your restaurant or café in minutes. No coding, no expensive web agency. QR code menus, custom themes, and your own website — all in one place.',
  openGraph: {
    title: 'Menuberg — Restaurant Website & Menu Builder',
    description: 'Build a beautiful digital menu website for your restaurant in minutes. No coding required.',
    type: 'website',
    url: 'https://www.menuberg.com',
  },
  alternates: { canonical: "https://www.menuberg.com" },
  twitter: {
    card: 'summary_large_image',
    title: 'Menuberg — Restaurant Website & Menu Builder',
    description: 'Build a beautiful digital menu website for your restaurant in minutes.',
  },
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Menuberg',
  url: 'https://www.menuberg.com',
  logo: 'https://www.menuberg.com/logo.png',
  description: 'Menuberg is a website and menu builder for restaurants and cafés — create a digital menu website with QR codes in minutes, no coding required.',
  sameAs: [] as string[], // add social media profile URLs here if/when you have them (Instagram, Facebook, etc.)
}

const softwareJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Menuberg',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description: 'Build a restaurant or café website and digital menu with QR code ordering — no coding required.',
  offers: {
    '@type': 'Offer',
    price: '2.00',
    priceCurrency: 'USD',
    description: 'Starting monthly price, varies by region',
  },
}


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
    stat3v: cms.stat_3_value || '',
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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />
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
            <a href="https://the-regent-room.menuberg.com" style={{ background: "transparent", color: "#ffffff", padding: "15px 32px", borderRadius: "10px", fontSize: "16px", fontWeight: 500, textDecoration: "none", border: "1px solid rgba(255,255,255,0.2)" }}>
              {c.heroCta2}
            </a>
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
          ].map(([num, label], i) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "30px", fontWeight: 800, color: "#0D1B2A", letterSpacing: "-1px" }}>
                {i === 2 ? <LivePriceStat /> : num}
              </div>
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
              From zero to live website page<br />in 3 simple steps
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "2rem", maxWidth: "800px", margin: "0 auto" }}>
            {[
              ["1", "Sign up free", "Create your account and choose your restaurant's unique URL in minutes."],
              ["2", "Build your website", "Add your categories, dishes, prices, photos, and contact details. Choose a theme and layout."],
              ["3", "Go live & Go", "Launch your website, download your QR code, and share your business with the world."],
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
        <PricingBanner />

        {/* CONTACT */}
        <ContactSection
          heading={c.contactHeading}
          subheading={c.contactSubheading}
          email={c.contactEmail}
          phone={c.contactPhone}
          address={c.contactAddress}
        />

        {/* CTA BANNER */}
        <section style={{ margin: "5rem 2rem 5rem", background: "#0D1B2A", borderRadius: "20px", padding: "4rem 2rem", textAlign: "center" }}>
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
            <span style={{ fontSize: "18px", fontWeight: 700, color: "#0D1B2A" }}>Menuberg <span style={{ color: "#bbb", fontSize: "14px", fontWeight: 400 }}>· Every business deserve a website</span></span>
          </div>
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" as const }}>
            <Link href="/pricing" style={{ fontSize: "13px", color: "#aaa", textDecoration: "none" }}>Pricing</Link>
            <a href="#contact" style={{ fontSize: "13px", color: "#aaa", textDecoration: "none" }}>Contact</a>
            <Link href="/terms" style={{ fontSize: "13px", color: "#aaa", textDecoration: "none" }}>Terms</Link>
            <Link href="/privacy" style={{ fontSize: "13px", color: "#aaa", textDecoration: "none" }}>Privacy</Link>
            <Link href="/refund" style={{ fontSize: "13px", color: "#aaa", textDecoration: "none" }}>Refund Policy</Link>
          </div>
          <p style={{ fontSize: "12px", color: "#ccc", width: "100%", margin: 0 }}>© 2025 Menuberg. Built for small restaurants worldwide.</p>
        </footer>

      </main>
    </>
  )
}