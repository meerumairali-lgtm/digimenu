"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

interface Props {
  restaurantSlug: string;
  restaurantName: string;
}

export default function QRPage({ restaurantSlug, restaurantName }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [menuUrl, setMenuUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const url = `${window.location.origin}/menu/${restaurantSlug}`;
    setMenuUrl(url);

    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: 280,
        margin: 2,
        color: { dark: "#0f172a", light: "#ffffff" },
      });
    }
  }, [restaurantSlug]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const padding = 32;
    const labelHeight = 56;
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = canvas.width + padding * 2;
    exportCanvas.height = canvas.height + padding * 2 + labelHeight;
    const ctx = exportCanvas.getContext("2d")!;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    ctx.drawImage(canvas, padding, padding);

    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 18px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(restaurantName, exportCanvas.width / 2, canvas.height + padding + 28);

    ctx.fillStyle = "#64748b";
    ctx.font = "12px system-ui, sans-serif";
    ctx.fillText(menuUrl, exportCanvas.width / 2, canvas.height + padding + 48);

    const link = document.createElement("a");
    link.download = `${restaurantSlug}-qr-code.png`;
    link.href = exportCanvas.toDataURL("image/png");
    link.click();
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(menuUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-semibold text-slate-900 mb-1">QR Code</h1>
      <p className="text-slate-500 mb-8 text-sm">
        Print or share this — customers scan it to view your menu.
      </p>

      <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col items-center gap-6">
        <div className="bg-white rounded-xl p-3 border border-slate-100">
          <canvas ref={canvasRef} className="rounded-lg" />
        </div>

        <div className="text-center">
          <p className="font-semibold text-slate-900">{restaurantName}</p>
          <p className="text-slate-400 text-xs mt-1 font-mono">{menuUrl}</p>
        </div>

        <div className="flex gap-3 w-full">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            {copied ? "✓ Copied!" : "Copy link"}
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            Download PNG
          </button>
        </div>
      </div>

      <p className="text-center text-xs text-slate-400 mt-5">
        Tip: print at 2×2 inches minimum for reliable scanning.
      </p>
    </div>
  );
}