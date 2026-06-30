'use client'

import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'

interface Props {
  restaurantSlug: string
  restaurantName: string
  logoUrl?: string | null
}

// Scales the restaurant name down in steps for longer names, so it
// stays readable on the exported PNG instead of clipping or wrapping
// awkwardly. Mirrors the same approach used on the public menu page.
function nameFontSize(name: string): number {
  const len = name.length
  if (len <= 14) return 30
  if (len <= 20) return 25
  if (len <= 28) return 20
  return 16
}

export default function QRPage({ restaurantSlug, restaurantName, logoUrl }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const previewRef = useRef<HTMLCanvasElement>(null)
  const [menuUrl, setMenuUrl] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const url = `${window.location.origin}/${restaurantSlug}`
    setMenuUrl(url)
  }, [restaurantSlug])

  // Draws the full branded card (logo/name header, QR in a bordered
  // box, "Powered by" footer) onto a given canvas. Used both for the
  // on-screen preview and the downloaded PNG, so they always match.
  async function drawCard(canvas: HTMLCanvasElement, scale: number) {
    const width = 360 * scale
    const headerHeight = 84 * scale
    const qrBoxSize = 280 * scale
    const qrBoxPadding = 24 * scale
    const footerHeight = 50 * scale
    const sidePadding = 20 * scale
    const gap = 16 * scale

    const height = headerHeight + gap + (qrBoxSize + qrBoxPadding * 2) + gap + footerHeight

    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)

    // ── Header: logo + name ──
    let logoImg: HTMLImageElement | null = null
    if (logoUrl) {
      try {
        logoImg = await loadImage(logoUrl)
      } catch {
        logoImg = null // fall back to name-only header if it fails to load
      }
    }

    const headerY = sidePadding
    const headerInnerHeight = headerHeight - sidePadding

    ctx.strokeStyle = '#0D1B2A'
    ctx.lineWidth = 3 * scale

    if (logoImg) {
      // Logo circle, left-aligned; name in a box to the right —
      // matches the reference: logo + name side by side.
      const logoSize = headerInnerHeight
      const logoX = sidePadding
      const logoCenterX = logoX + logoSize / 2
      const logoCenterY = headerY + logoSize / 2

      ctx.save()
      ctx.beginPath()
      ctx.arc(logoCenterX, logoCenterY, logoSize / 2, 0, Math.PI * 2)
      ctx.closePath()
      ctx.clip()
      ctx.drawImage(logoImg, logoX, headerY, logoSize, logoSize)
      ctx.restore()

      ctx.beginPath()
      ctx.arc(logoCenterX, logoCenterY, logoSize / 2, 0, Math.PI * 2)
      ctx.stroke()

      const nameBoxX = logoX + logoSize + (12 * scale)
      const nameBoxWidth = width - nameBoxX - sidePadding
      ctx.strokeRect(nameBoxX, headerY, nameBoxWidth, headerInnerHeight)

      ctx.fillStyle = '#0D1B2A'
      ctx.font = `bold ${nameFontSize(restaurantName) * scale}px system-ui, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      fitText(ctx, restaurantName, nameBoxX + nameBoxWidth / 2, headerY + headerInnerHeight / 2, nameBoxWidth - (16 * scale))
    } else {
      // No logo — restaurant name centered, full width.
      ctx.strokeRect(sidePadding, headerY, width - sidePadding * 2, headerInnerHeight)
      ctx.fillStyle = '#0D1B2A'
      ctx.font = `bold ${nameFontSize(restaurantName) * scale}px system-ui, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      fitText(ctx, restaurantName, width / 2, headerY + headerInnerHeight / 2, width - sidePadding * 2 - (16 * scale))
    }

    // ── QR box ──
    const qrBoxY = headerY + headerInnerHeight + gap
    const qrBoxX = (width - (qrBoxSize + qrBoxPadding * 2)) / 2
    const qrBoxOuter = qrBoxSize + qrBoxPadding * 2

    ctx.strokeRect(qrBoxX, qrBoxY, qrBoxOuter, qrBoxOuter)

    const qrCanvas = document.createElement('canvas')
    await QRCode.toCanvas(qrCanvas, menuUrl || `${window.location.origin}/${restaurantSlug}`, {
      width: qrBoxSize,
      margin: 0,
      color: { dark: '#0D1B2A', light: '#ffffff' },
    })
    ctx.drawImage(qrCanvas, qrBoxX + qrBoxPadding, qrBoxY + qrBoxPadding, qrBoxSize, qrBoxSize)

    // ── Footer ──
    const footerY = qrBoxY + qrBoxOuter + gap
    ctx.strokeRect(sidePadding, footerY, width - sidePadding * 2, footerHeight)
    ctx.fillStyle = '#0D1B2A'
    ctx.font = `bold ${13 * scale}px system-ui, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('Powered By: Menuberg.com', width / 2, footerY + footerHeight / 2)
  }

  // Shrinks font size in steps until the text fits within maxWidth,
  // so very long names never overflow their box on the card.
  function fitText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number) {
    let fontSize = parseInt(ctx.font.match(/\d+/)?.[0] || '20', 10)
    const fontFamily = ctx.font.split('px ')[1] || 'system-ui, sans-serif'
    while (ctx.measureText(text).width > maxWidth && fontSize > 10) {
      fontSize -= 1
      ctx.font = `bold ${fontSize}px ${fontFamily}`
    }
    ctx.fillText(text, x, y)
  }

  function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = src
    })
  }

  // Render the on-screen preview whenever the relevant data is ready.
  useEffect(() => {
    if (!menuUrl || !previewRef.current) return
    drawCard(previewRef.current, 1)
  }, [menuUrl, logoUrl, restaurantName])

  const handleDownload = async () => {
    if (!menuUrl) return
    const exportCanvas = document.createElement('canvas')
    // Draw at 3x scale for a crisp, print-ready PNG.
    await drawCard(exportCanvas, 3)

    const link = document.createElement('a')
    link.download = `${restaurantSlug}-qr-code.png`
    link.href = exportCanvas.toDataURL('image/png')
    link.click()
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(menuUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-semibold text-slate-900 mb-1">QR Code</h1>
      <p className="text-slate-500 mb-8 text-sm">
        Print or share this — customers scan it to view your menu.
      </p>

      <div className="bg-white border border-sky-100 rounded-2xl p-8 flex flex-col items-center gap-6">
        <canvas ref={previewRef} className="rounded-lg max-w-full h-auto" />

        <p className="text-sky-400 text-xs font-mono break-all text-center">{menuUrl}</p>

        <div className="flex gap-3 w-full">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-sky-200 rounded-xl text-sm font-medium text-[#0D1B2A] hover:bg-sky-50 transition-colors"
          >
            {copied ? '✓ Copied!' : 'Copy link'}
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0D1B2A] hover:bg-[#112240] text-white rounded-xl text-sm font-medium transition-colors"
          >
            Download PNG
          </button>
        </div>
      </div>

      <p className="text-center text-xs text-sky-400 mt-5">
        Tip: print at 2×2 inches minimum for reliable scanning.
      </p>
    </div>
  )
}