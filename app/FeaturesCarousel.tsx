'use client'
import { useEffect, useState, useRef } from 'react'

interface Feature {
  icon: string
  title: string
  desc: string
  image: string
}

interface Props {
  features: Feature[]
}

export default function FeaturesCarousel({ features }: Props) {
  const [active, setActive] = useState(0)
  const [transitioning, setTransitioning] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const touchStartX = useRef(0)

  function goTo(index: number) {
    if (transitioning || features.length === 0) return
    setTransitioning(true)
    setTimeout(() => {
      setActive((index + features.length) % features.length)
      setTransitioning(false)
    }, 300)
  }

  function next() { goTo(active + 1) }
  function prev() { goTo(active - 1) }

  useEffect(() => {
    if (features.length === 0) return
    timerRef.current = setInterval(next, 4500)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [active, features.length])

  function onTouchStart(e: React.TouchEvent) { touchStartX.current = e.touches[0].clientX }
  function onTouchEnd(e: React.TouchEvent) {
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev()
  }

  function getIndex(offset: number) {
    return (active + offset + features.length) % features.length
  }

  if (features.length === 0) return null

  const positions = [
    { offset: -1, scale: 0.78, translateX: -58, zIndex: 1, opacity: 0.7 },
    { offset: 0,  scale: 1,    translateX: 0,   zIndex: 3, opacity: 1   },
    { offset: 1,  scale: 0.78, translateX: 58,  zIndex: 1, opacity: 0.7 },
  ]

  return (
    <section style={{ padding: "6rem 0 5rem", background: "#fff", borderTop: "1px solid #f0f0f0", borderBottom: "1px solid #f0f0f0", overflow: "hidden" }}>
      <div style={{ textAlign: "center", marginBottom: "3.5rem", padding: "0 2rem" }}>
        <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase" as const, color: "#f97316", marginBottom: "0.8rem" }}>
          Why DigiMenu
        </div>
        <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, color: "#111", marginBottom: "1rem", letterSpacing: "-1px" }}>
          Everything a restaurant<br />actually needs
        </h2>
        <p style={{ fontSize: "16px", color: "#666", maxWidth: "420px", margin: "0 auto", lineHeight: 1.7 }}>
          No bloated website builder. Just the features that bring customers in.
        </p>
      </div>

      <div
        style={{ position: "relative", height: "420px", display: "flex", alignItems: "center", justifyContent: "center" }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {positions.map(({ offset, scale, translateX, zIndex, opacity }) => {
          const index = getIndex(offset)
          const feature = features[index]
          const isActive = offset === 0

          return (
            <div
              key={index}
              onClick={() => offset !== 0 && goTo(active + offset)}
              style={{
                position: "absolute", width: "300px", height: "380px",
                borderRadius: "20px", overflow: "hidden",
                transform: `translateX(${translateX}%) scale(${scale})`,
                transition: "all 0.35s cubic-bezier(0.4,0,0.2,1)",
                zIndex, opacity,
                cursor: offset !== 0 ? "pointer" : "default",
                boxShadow: isActive ? "0 24px 60px rgba(0,0,0,0.15)" : "0 8px 24px rgba(0,0,0,0.08)",
              }}
            >
              <div style={{ position: "absolute", inset: 0, background: "#fff4ed", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "80px" }}>
                {feature.icon}
                <img
                  src={feature.image}
                  alt={feature.title}
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              </div>
              {isActive && (
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)", padding: "2rem 1.5rem 1.8rem" }}>
                  <h3 style={{ margin: "0 0 6px", fontSize: "20px", fontWeight: 700, color: "#fff", letterSpacing: "-0.3px" }}>{feature.title}</h3>
                  <p style={{ margin: 0, fontSize: "14px", color: "rgba(255,255,255,0.8)", lineHeight: 1.5 }}>{feature.desc}</p>
                </div>
              )}
              {!isActive && (
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)", padding: "1.5rem 1.2rem 1.2rem" }}>
                  <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: "#fff" }}>{feature.title}</h3>
                </div>
              )}
            </div>
          )
        })}

        <button onClick={prev} style={{ position: "absolute", left: "calc(50% - 220px)", zIndex: 10, width: "36px", height: "36px", borderRadius: "50%", background: "rgba(255,255,255,0.9)", border: "1px solid #e5e5e5", cursor: "pointer", fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center", color: "#333", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>‹</button>
        <button onClick={next} style={{ position: "absolute", right: "calc(50% - 220px)", zIndex: 10, width: "36px", height: "36px", borderRadius: "50%", background: "rgba(255,255,255,0.9)", border: "1px solid #e5e5e5", cursor: "pointer", fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center", color: "#333", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>›</button>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginTop: "1.5rem" }}>
        {features.map((_, i) => (
          <div key={i} onClick={() => goTo(i)} style={{ width: active === i ? 24 : 6, height: 6, borderRadius: 3, background: active === i ? "#f97316" : "#e5e5e5", cursor: "pointer", transition: "all 0.25s" }} />
        ))}
      </div>
    </section>
  )
}