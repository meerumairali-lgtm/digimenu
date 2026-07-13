'use client'

import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'

interface Props {
  restaurantSlug: string
  restaurantName: string
  logoUrl?: string | null
}

function nameFontSize(name: string, base: number): number {
  const len = name.length
  if (len <= 14) return base
  if (len <= 20) return base * 0.85
  if (len <= 28) return base * 0.7
  return base * 0.55
}

const PRINT_DPI = 300
const CARD_WIDTH_IN = 5.85   // 148.5mm
const CARD_HEIGHT_IN = 8.27  // 210mm
const QR_INCHES = 2

export default function QRPage({ restaurantSlug, restaurantName, logoUrl }: Props) {
  const previewRef = useRef<HTMLCanvasElement>(null)
  const [menuUrl, setMenuUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [logoLoadFailed, setLogoLoadFailed] = useState(false)

  useEffect(() => {
    const url = `https://${restaurantSlug}.menuberg.com`
    setMenuUrl(url)
  }, [restaurantSlug])

  function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = (e) => reject(e)
      img.src = src
    })
  }

  function fitText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, startSize: number, weight = 'bold') {
    let fontSize = startSize
    while (true) {
      ctx.font = `${weight} ${fontSize}px system-ui, sans-serif`
      if (ctx.measureText(text).width <= maxWidth || fontSize <= 10) break
      fontSize -= 1
    }
    ctx.fillText(text, x, y)
    return fontSize
  }

  // dpi controls overall resolution: low dpi for the on-screen
  // preview (fast to render), full 300 for the actual download.
  async function drawCard(canvas: HTMLCanvasElement, dpi: number) {
    const width = Math.round(CARD_WIDTH_IN * dpi)
    const height = Math.round(CARD_HEIGHT_IN * dpi)
    const qrSize = Math.round(QR_INCHES * dpi)

    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)

    const sidePadding = width * 0.08
    let cursorY = height * 0.10

    // ── Logo + restaurant name ──
    let logoImg: HTMLImageElement | null = null
    if (logoUrl) {
      try {
        logoImg = await loadImage(logoUrl)
        setLogoLoadFailed(false)
      } catch {
        logoImg = null
        setLogoLoadFailed(true)
      }
    }

    const nameBaseSize = width * 0.075
    const headerBlockHeight = logoImg ? width * 0.22 : nameBaseSize * 1.4

    if (logoImg) {
      const logoSize = headerBlockHeight
      // Logo above, name below — clean centered stack for a tall card.
      const logoX = (width - logoSize) / 2
      ctx.save()
      ctx.beginPath()
      ctx.arc(width / 2, cursorY + logoSize / 2, logoSize / 2, 0, Math.PI * 2)
      ctx.closePath()
      ctx.clip()
      ctx.drawImage(logoImg, logoX, cursorY, logoSize, logoSize)
      ctx.restore()

      ctx.strokeStyle = '#E0F2FE'
      ctx.lineWidth = Math.max(2, width * 0.002)
      ctx.beginPath()
      ctx.arc(width / 2, cursorY + logoSize / 2, logoSize / 2, 0, Math.PI * 2)
      ctx.stroke()

      cursorY += logoSize + height * 0.025

      ctx.fillStyle = '#0D1B2A'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      const nameSize = nameFontSize(restaurantName, nameBaseSize)
      fitText(ctx, restaurantName, width / 2, cursorY + nameSize / 2, width - sidePadding * 2, nameSize)
      cursorY += nameSize * 1.4
    } else {
      // No logo — name alone, centered, generous size.
      ctx.fillStyle = '#0D1B2A'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      const nameSize = nameFontSize(restaurantName, nameBaseSize * 1.15)
      fitText(ctx, restaurantName, width / 2, cursorY + nameSize / 2, width - sidePadding * 2, nameSize)
      cursorY += nameSize * 1.5
    }

    cursorY += height * 0.03

    // ── "Scan for menu" creative line ──
    ctx.fillStyle = '#38BDF8'
    const scanSize = width * 0.045
    ctx.font = `600 italic ${scanSize}px system-ui, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('✦  Scan for menu  ✦', width / 2, cursorY + scanSize / 2)
    cursorY += scanSize * 2.2

    // ── QR code, true 2"x2" ──
    const qrX = (width - qrSize) / 2
    const qrCanvas = document.createElement('canvas')
    await QRCode.toCanvas(qrCanvas, menuUrl || `https://${restaurantSlug}.menuberg.com`, {
      width: qrSize,
      margin: 1,
      color: { dark: '#0D1B2A', light: '#ffffff' },
    })

    // Soft card behind the QR for visual polish
    const qrPad = qrSize * 0.08
    ctx.fillStyle = '#F8FAFC'
    roundRect(ctx, qrX - qrPad, cursorY - qrPad, qrSize + qrPad * 2, qrSize + qrPad * 2, qrSize * 0.06)
    ctx.fill()
    ctx.drawImage(qrCanvas, qrX, cursorY, qrSize, qrSize)
    cursorY += qrSize + qrPad * 2 + height * 0.035

    // ── Menu URL ──
    ctx.fillStyle = '#64748B'
    const urlSize = width * 0.028
    ctx.font = `${urlSize}px system-ui, monospace`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    fitText(ctx, menuUrl, width / 2, cursorY, width - sidePadding * 2, urlSize, '400')
    cursorY += urlSize * 2.5

    // ── Footer: Powered by Menuberg ──
    ctx.fillStyle = '#94A3B8'
    const footerSize = width * 0.03
    ctx.font = `600 ${footerSize}px system-ui, sans-serif`
    ctx.fillText('Powered by Menuberg', width / 2, height - height * 0.06)
  }

  function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.arcTo(x + w, y, x + w, y + h, r)
    ctx.arcTo(x + w, y + h, x, y + h, r)
    ctx.arcTo(x, y + h, x, y, r)
    ctx.arcTo(x, y, x + w, y, r)
    ctx.closePath()
  }

  useEffect(() => {
    if (!menuUrl || !previewRef.current) return
    // Light DPI for a fast, smooth on-screen preview.
    drawCard(previewRef.current, 72)
  }, [menuUrl, logoUrl, restaurantName])

  const handleDownload = async () => {
    if (!menuUrl) return
    const exportCanvas = document.createElement('canvas')
    await drawCard(exportCanvas, PRINT_DPI)

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
        <canvas ref={previewRef} className="rounded-lg max-w-full h-auto border border-slate-100" style={{ maxHeight: 500 }} />

        {logoLoadFailed && (
          <p className="text-xs text-amber-600 text-center">
            Your logo couldn't be loaded for the QR card — check it's uploaded correctly in Settings.
          </p>
        )}

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
        Prints at half-A4 size (148.5mm × 210mm) with a true 2×2 inch QR code, at 300 DPI.
      </p>
    </div>
  )
}