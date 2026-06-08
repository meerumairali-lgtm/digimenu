"use client";

import { use } from "react";
import { menu } from "../../data/menu";
import { notFound } from "next/navigation";

export default function RestaurantPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const restaurant = menu[slug];
  if (!restaurant) return notFound();

  const categoryIds = restaurant.categories.map(c =>
    c.title.toLowerCase().replace(/\s+/g, "-")
  );

  return (
    <main style={{ fontFamily: "'DM Sans', sans-serif", background: "#fafaf8", maxWidth: "480px", margin: "0 auto", minHeight: "100vh" }}>

      {/* HEADER — clean, restaurant focused */}
      <div style={{ background: "#1a1a1a", color: "#fff", padding: "2rem 1.2rem 1.5rem", textAlign: "center" }}>
        {/* Logo placeholder — shows initials if no logo */}
        <div style={{ width: "70px", height: "70px", borderRadius: "50%", background: "#c8a96e", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem", fontSize: "24px", fontWeight: 700, color: "#1a1a1a", fontFamily: "Georgia, serif" }}>
          {restaurant.name.charAt(0)}
        </div>
        <div style={{ fontFamily: "Georgia, serif", fontSize: "24px", fontWeight: 700, lineHeight: 1.2, marginBottom: "4px" }}>{restaurant.name}</div>
        {restaurant.tagline && <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", marginBottom: "0" }}>{restaurant.tagline}</div>}
      </div>

      {/* MENU LABEL */}
      <div style={{ background: "#fff", padding: "0.8rem 1rem", borderBottom: "1px solid #eee", textAlign: "center" }}>
        <span style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "2px", textTransform: "uppercase" as const, color: "#c8a96e" }}>Our Menu</span>
      </div>

      {/* STICKY TABS */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: "#fff", borderBottom: "1px solid #eee", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div id="tabs-container" style={{ display: "flex", overflowX: "auto" as const, scrollbarWidth: "none" as any }}>
          {restaurant.categories.map((cat, i) => (
            <button
              key={i}
              id={`tab-${categoryIds[i]}`}
              onClick={() => {
                const el = document.getElementById(`section-${categoryIds[i]}`);
                const tabsEl = document.getElementById("tabs-container");
                if (el && tabsEl) {
                  const offset = tabsEl.offsetHeight + 48;
                  window.scrollTo({ top: el.offsetTop - offset, behavior: "smooth" });
                }
              }}
              style={{
                flexShrink: 0,
                padding: "12px 18px",
                fontSize: "13px",
                fontWeight: 500,
                color: i === 0 ? "#1a1a1a" : "#888",
                cursor: "pointer",
                whiteSpace: "nowrap" as const,
                background: "none",
                border: "none",
                borderBottom: i === 0 ? "2px solid #c8a96e" : "2px solid transparent",
              }}
            >
              {cat.title}
            </button>
          ))}
        </div>
      </div>

      {/* MENU SECTIONS */}
      <div style={{ paddingBottom: "2rem" }}>
        {restaurant.categories.map((category, ci) => (
          <div key={ci} id={`section-${categoryIds[ci]}`} style={{ padding: "1.5rem 1rem 0.5rem" }}>
            <div style={{ fontFamily: "Georgia, serif", fontSize: "20px", fontWeight: 700, color: "#1a1a1a", marginBottom: "1rem", paddingBottom: "0.5rem", borderBottom: "2px solid #c8a96e" }}>
              {category.title}
            </div>
            {category.items.map((item, ii) => (
              <div key={ii} style={{ display: "flex", gap: "12px", padding: "1rem 0", borderBottom: ii < category.items.length - 1 ? "1px solid #f0f0f0" : "none", alignItems: "flex-start" }}>
                <div style={{ width: "80px", height: "80px", borderRadius: "10px", background: "#e8e4dc", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", flexShrink: 0 }}>
                  🍽️
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "15px", fontWeight: 500, color: "#1a1a1a", marginBottom: "4px" }}>{item.name}</div>
                  {item.description && <div style={{ fontSize: "12px", color: "#999", lineHeight: 1.5, marginBottom: "8px" }}>{item.description}</div>}
                  <div style={{ fontSize: "15px", fontWeight: 500, color: "#c8a96e" }}>Rs {item.price}</div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* CONTACT & SOCIALS FOOTER */}
      <div style={{ background: "#1a1a1a", color: "#fff", padding: "2rem 1.2rem", marginTop: "1rem" }}>
        <div style={{ fontFamily: "Georgia, serif", fontSize: "16px", color: "#c8a96e", marginBottom: "1.2rem", textAlign: "center" }}>Find Us</div>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: "10px", marginBottom: "1.5rem" }}>
          {restaurant.address && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "rgba(255,255,255,0.6)" }}>
              <span>📍</span><span>{restaurant.address}</span>
            </div>
          )}
          {restaurant.phone && (
            <a href={`tel:${restaurant.phone}`} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>
              <span>📞</span><span>{restaurant.phone}</span>
            </a>
          )}
          {restaurant.email && (
            <a href={`mailto:${restaurant.email}`} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>
              <span>✉️</span><span>{restaurant.email}</span>
            </a>
          )}
          {restaurant.whatsapp && (
            <a href={`https://wa.me/${restaurant.whatsapp.replace(/\D/g, "")}`} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "#25D366", textDecoration: "none" }}>
              <span>💬</span><span>Chat on WhatsApp</span>
            </a>
          )}
        </div>

        {/* Social buttons */}
        {(restaurant.instagram || restaurant.facebook) && (
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" as const, marginBottom: "1.5rem" }}>
            {restaurant.instagram && (
              <a href={restaurant.instagram} style={{ fontSize: "12px", padding: "6px 14px", borderRadius: "20px", border: "1px solid rgba(225,48,108,0.4)", color: "#E1306C", textDecoration: "none" }}>📸 Instagram</a>
            )}
            {restaurant.facebook && (
              <a href={restaurant.facebook} style={{ fontSize: "12px", padding: "6px 14px", borderRadius: "20px", border: "1px solid rgba(24,119,242,0.4)", color: "#1877F2", textDecoration: "none" }}>👍 Facebook</a>
            )}
          </div>
        )}

        {/* Powered by */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "1rem", textAlign: "center", fontSize: "11px", color: "rgba(255,255,255,0.2)" }}>
          Powered by <span style={{ color: "#c8a96e", fontWeight: 500 }}>DigiMenu</span> · Digital menus for everyone
        </div>
      </div>

      {/* SCROLL SPY */}
      <script dangerouslySetInnerHTML={{ __html: `
        const ids = ${JSON.stringify(categoryIds)};
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(e => {
            if(e.isIntersecting) {
              ids.forEach(id => {
                const tab = document.getElementById('tab-' + id);
                if(tab) {
                  const isActive = e.target.id === 'section-' + id;
                  tab.style.color = isActive ? '#1a1a1a' : '#888';
                  tab.style.borderBottom = isActive ? '2px solid #c8a96e' : '2px solid transparent';
                  if(isActive) tab.scrollIntoView({behavior:'smooth', block:'nearest', inline:'center'});
                }
              });
            }
          });
        }, { rootMargin: '-30% 0px -60% 0px', threshold: 0 });
        ids.forEach(id => {
          const el = document.getElementById('section-' + id);
          if(el) observer.observe(el);
        });
      `}} />

    </main>
  );
}