export default function Home() {
  return (
    <main style={{ fontFamily: "'DM Sans', sans-serif", background: "#0f0f0f", color: "#f5f0e8", minHeight: "100vh" }}>

      {/* NAV */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.2rem 2rem", borderBottom: "1px solid rgba(255,255,255,0.07)", position: "sticky", top: 0, background: "#0f0f0f", zIndex: 100 }}>
        <div style={{ fontFamily: "Georgia, serif", fontSize: "22px", color: "#c8a96e" }}>Digi<span style={{ color: "#f5f0e8" }}>Menu</span></div>
        <a href="#" style={{ background: "#c8a96e", color: "#0f0f0f", padding: "8px 20px", borderRadius: "6px", fontSize: "13px", fontWeight: 500, textDecoration: "none" }}>Get Started Free</a>
      </nav>

      {/* HERO */}
      <section style={{ padding: "5rem 2rem 4rem", textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(200,169,110,0.1)", border: "1px solid rgba(200,169,110,0.3)", color: "#c8a96e", fontSize: "12px", fontWeight: 500, letterSpacing: "1.5px", textTransform: "uppercase" as const, padding: "6px 16px", borderRadius: "20px", marginBottom: "2rem" }}>
          ✦ Now live in 12+ countries
        </div>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(36px, 6vw, 58px)", fontWeight: 700, lineHeight: 1.1, marginBottom: "1.5rem" }}>
          Your restaurant,<br />
          <em style={{ color: "#c8a96e", fontStyle: "italic" }}>online in minutes.</em><br />
          Not months.
        </h1>
        <p style={{ fontSize: "17px", color: "rgba(245,240,232,0.55)", maxWidth: "480px", margin: "0 auto 2.5rem", lineHeight: 1.7 }}>
          A beautiful digital menu for the price of a burger a month. No coding. No expensive web agency. Just scan & eat.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" as const }}>
          <a href="#" style={{ background: "#c8a96e", color: "#0f0f0f", padding: "14px 28px", borderRadius: "8px", fontSize: "15px", fontWeight: 500, textDecoration: "none" }}>Create your menu free →</a>
          <a href="/spicy-box" style={{ background: "transparent", color: "#f5f0e8", padding: "14px 28px", borderRadius: "8px", fontSize: "15px", fontWeight: 500, textDecoration: "none", border: "1px solid rgba(255,255,255,0.2)" }}>See a live example</a>
        </div>
<p style={{ marginTop: "1.2rem", fontSize: "12px", color: "rgba(245,240,232,0.3)" }}>Setup in under 5 minutes · Cancel anytime</p>      </section>

      {/* STATS */}
      <div style={{ padding: "1.5rem 2rem", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center", gap: "3rem", flexWrap: "wrap" as const }}>
        {[["2,400+", "Restaurants live"], ["47", "Countries"], ["$4.99", "Starting per month"], ["5 min", "To go live"]].map(([num, label]) => (
          <div key={label} style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "Georgia, serif", fontSize: "26px", color: "#c8a96e" }}>{num}</div>
            <div style={{ fontSize: "12px", color: "rgba(245,240,232,0.4)", marginTop: "2px" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* FEATURES */}
      <section style={{ padding: "4rem 2rem" }}>
        <div style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "2px", textTransform: "uppercase" as const, color: "#c8a96e", marginBottom: "0.8rem" }}>Why DigiMenu</div>
        <h2 style={{ fontFamily: "Georgia, serif", fontSize: "36px", fontWeight: 700, color: "#f5f0e8", marginBottom: "1rem" }}>Everything a restaurant<br />actually needs</h2>
        <p style={{ fontSize: "15px", color: "rgba(245,240,232,0.5)", maxWidth: "420px", lineHeight: 1.7, marginBottom: "3rem" }}>No bloated website builder. Just the features that bring customers in.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", overflow: "hidden" }}>
          {[
            ["🔗", "Your own URL", "digimenu.com/yourrestaurant — share it anywhere, print it everywhere."],
            ["📱", "QR Code included", "Auto-generated QR code. Print, stick on table, done."],
            ["🍽️", "Beautiful menu", "Categories, photos, descriptions, prices. Stunning on any phone."],
            ["💬", "WhatsApp & socials", "One tap to WhatsApp you, follow on Instagram, find you on maps."],
            ["⚡", "Instant updates", "Change a price or add a dish — live in seconds."],
            ["🌍", "Works worldwide", "Built for small businesses from Karachi to London to New York."],
          ].map(([icon, title, desc]) => (
            <div key={title} style={{ background: "#0f0f0f", padding: "1.8rem 1.5rem" }}>
              <div style={{ width: "40px", height: "40px", background: "rgba(200,169,110,0.1)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem", fontSize: "20px" }}>{icon}</div>
              <h3 style={{ fontSize: "15px", fontWeight: 500, color: "#f5f0e8", marginBottom: "0.5rem" }}>{title}</h3>
              <p style={{ fontSize: "13px", color: "rgba(245,240,232,0.45)", lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: "4rem 2rem", background: "#141414", borderTop: "1px solid rgba(255,255,255,0.07)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "2px", textTransform: "uppercase" as const, color: "#c8a96e", marginBottom: "0.8rem" }}>How it works</div>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: "36px", fontWeight: 700, color: "#f5f0e8" }}>From zero to live menu<br />in 3 simple steps</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "2rem", marginTop: "3rem" }}>
          {[
            ["1", "Sign up", "Create your account and choose your restaurant's unique URL in minutes."],
            ["2", "Build your menu", "Add categories, dishes, prices, photos and contact details easily."],
            ["3", "Print & share", "Download your QR code, stick it on your table, share your link everywhere."],
          ].map(([num, title, desc]) => (
            <div key={num} style={{ textAlign: "center" }}>
              <div style={{ width: "48px", height: "48px", background: "rgba(200,169,110,0.1)", border: "1px solid rgba(200,169,110,0.3)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem", fontFamily: "Georgia, serif", fontSize: "20px", color: "#c8a96e" }}>{num}</div>
              <h3 style={{ fontSize: "15px", fontWeight: 500, color: "#f5f0e8", marginBottom: "0.5rem" }}>{title}</h3>
              <p style={{ fontSize: "13px", color: "rgba(245,240,232,0.45)", lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section style={{ padding: "4rem 2rem", textAlign: "center" }}>
        <div style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "2px", textTransform: "uppercase" as const, color: "#c8a96e", marginBottom: "0.8rem" }}>Pricing</div>
        <h2 style={{ fontFamily: "Georgia, serif", fontSize: "36px", fontWeight: 700, color: "#f5f0e8", marginBottom: "0.5rem" }}>Less than a burger a month</h2>
        <p style={{ fontSize: "15px", color: "rgba(245,240,232,0.5)", marginBottom: "3rem" }}>Honest, simple pricing. Cancel anytime.</p>
        <div style={{ maxWidth: "420px", margin: "0 auto", background: "#141414", border: "1px solid rgba(200,169,110,0.5)", borderRadius: "16px", padding: "2.5rem 2rem", textAlign: "left", position: "relative" }}>
          <div style={{ position: "absolute", top: "-13px", left: "50%", transform: "translateX(-50%)", background: "#c8a96e", color: "#0f0f0f", fontSize: "11px", fontWeight: 500, padding: "4px 18px", borderRadius: "20px", whiteSpace: "nowrap" as const }}>
            Everything included
          </div>

          {/* One time fee */}
          <div style={{ marginBottom: "1.5rem", paddingBottom: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ fontSize: "12px", color: "rgba(245,240,232,0.4)", textTransform: "uppercase" as const, letterSpacing: "1px", marginBottom: "0.5rem" }}>One-time setup</div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: "36px", color: "#f5f0e8", lineHeight: 1 }}>
              <sup style={{ fontSize: "18px", verticalAlign: "top", marginTop: "6px", color: "#c8a96e" }}>$</sup>17.90
            </div>
            <p style={{ fontSize: "13px", color: "rgba(245,240,232,0.45)", marginTop: "0.5rem" }}>Pay once. Your menu page is created, configured and ready to share.</p>
          </div>

          {/* Monthly fee */}
          <div style={{ marginBottom: "1.8rem" }}>
            <div style={{ fontSize: "12px", color: "rgba(245,240,232,0.4)", textTransform: "uppercase" as const, letterSpacing: "1px", marginBottom: "0.5rem" }}>Then just</div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: "36px", color: "#f5f0e8", lineHeight: 1 }}>
              <sup style={{ fontSize: "18px", verticalAlign: "top", marginTop: "6px", color: "#c8a96e" }}>$</sup>4.99<sub style={{ fontSize: "14px", color: "rgba(245,240,232,0.4)" }}>/month</sub>
            </div>
            <p style={{ fontSize: "13px", color: "rgba(245,240,232,0.45)", marginTop: "0.5rem" }}>Less than a coffee. Keep your menu live, updated and always accessible.</p>
          </div>

          {/* Features */}
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column" as const, gap: "8px", marginBottom: "2rem" }}>
            {[
              "Your own URL — digimenu.com/yourname",
              "QR code you can print anywhere",
              "Unlimited categories & menu items",
              "WhatsApp, socials & contact info",
              "Instant updates anytime",
              "Mobile-perfect on every device",
            ].map(f => (
              <li key={f} style={{ fontSize: "13px", color: "rgba(245,240,232,0.6)", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: "#c8a96e", fontWeight: 700, flexShrink: 0 }}>✓</span>{f}
              </li>
            ))}
          </ul>

          <button style={{ width: "100%", padding: "14px", borderRadius: "8px", fontSize: "15px", fontWeight: 500, cursor: "pointer", border: "none", background: "#c8a96e", color: "#0f0f0f" }}>
            Get your menu now →
          </button>
        </div>
        <p style={{ marginTop: "1.5rem", fontSize: "13px", color: "rgba(245,240,232,0.3)" }}>All plans include a one-time setup fee · 7-day free trial</p>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: "2rem", borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" as const, gap: "1rem" }}>
        <div style={{ fontFamily: "Georgia, serif", fontSize: "18px", color: "#c8a96e" }}>DigiMenu <span style={{ color: "rgba(245,240,232,0.4)", fontFamily: "'DM Sans', sans-serif", fontSize: "14px" }}>· Digital menus for everyone</span></div>
        <div style={{ display: "flex", gap: "1.5rem" }}>
          {["About", "Contact", "Privacy"].map(l => <a key={l} href="#" style={{ fontSize: "13px", color: "rgba(245,240,232,0.35)", textDecoration: "none" }}>{l}</a>)}
        </div>
        <p style={{ fontSize: "12px", color: "rgba(245,240,232,0.2)", width: "100%" }}>© 2025 DigiMenu. Built with ❤️ for small restaurants worldwide.</p>
      </footer>

    </main>
  );
}