'use client'

import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'

interface Props {
  restaurantSlug: string
  restaurantName: string
}

export default function QRPage({ restaurantSlug, restaurantName }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [menuUrl, setMenuUrl] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const url = `${window.location.origin}/menu/${restaurantSlug}`
    setMenuUrl(url)

    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: 280,
        margin: 2,
        color: { dark: '#0D1B2A', light: '#ffffff' },
      })
    }
  }, [restaurantSlug])

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const padding = 32
    const labelHeight = 56
    const exportCanvas = document.createElement('canvas')
    exportCanvas.width = canvas.width + padding * 2
    exportCanvas.height = canvas.height + padding * 2 + labelHeight
    const ctx = exportCanvas.getContext('2d')!

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height)
    ctx.drawImage(canvas, padding, padding)

    ctx.fillStyle = '#0D1B2A'
    ctx.font = 'bold 18px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(restaurantName, exportCanvas.width / 2, canvas.height + padding + 28)

    ctx.fillStyle = '#38BDF8'
    ctx.font = '12px system-ui, sans-serif'
    ctx.fillText(menuUrl, exportCanvas.width / 2, canvas.height + padding + 48)

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
        <div className="bg-white rounded-xl p-3 border border-sky-100">
          <canvas ref={canvasRef} className="rounded-lg" />
        </div>

        <div className="text-center">
          <p className="font-semibold text-[#0D1B2A]">{restaurantName}</p>
          <p className="text-sky-400 text-xs mt-1 font-mono">{menuUrl}</p>
        </div>

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