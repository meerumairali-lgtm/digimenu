import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import Link from "next/link";
import LandingNav from "@/app/components/LandingNav";
import { Check } from "lucide-react";
import { getUsdExchangeRates } from "@/lib/currency";
import { getCurrencyForCountry, convertUsd, formatCurrency } from "@/lib/currencyDisplay";

export const dynamic = "force-dynamic";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing | Affordable Restaurant Website Builder | Menuberg",
  description:
    "Simple, affordable pricing for Menuberg's restaurant website builder. Create a professional restaurant website with no complicated setup. Cancel anytime.",
  alternates: {
    canonical: "https://www.menuberg.com/pricing",
  },
  openGraph: {
    title: "Pricing | Affordable Restaurant Website Builder | Menuberg",
    description:
      "Simple, affordable pricing for Menuberg's restaurant website builder. Create a professional restaurant website with no complicated setup. Cancel anytime.",
    url: "https://www.menuberg.com/pricing",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Pricing | Affordable Restaurant Website Builder | Menuberg",
  },
};


function isReservedIP(ip: string): boolean {
  if (!ip) return true;
  if (ip === "::1" || ip === "127.0.0.1") return true;
  if (ip.startsWith("192.168.")) return true;
  if (ip.startsWith("10.")) return true;
  if (ip.startsWith("169.254.")) return true;
  if (ip.startsWith("fc") || ip.startsWith("fd")) return true;

  const match = ip.match(/^172\.(\d+)\./);
  if (match) {
    const secondOctet = parseInt(match[1], 10);
    if (secondOctet >= 16 && secondOctet <= 31) return true;
  }

  return false;
}

async function detectCountryCode(): Promise<string | null> {
  try {
    const headersList = await headers();
    const forwarded = headersList.get("x-forwarded-for");
    const rawIp = forwarded ? forwarded.split(",")[0].trim() : null;
    const useIp = rawIp && !isReservedIP(rawIp) ? rawIp : null;
    const url = useIp
      ? `https://ipapi.co/${useIp}/json/`
      : `https://ipapi.co/json/`;

    const res = await fetch(url, {
      headers: { "User-Agent": "Menuberg/1.0" },
      cache: "no-store",
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (data.error) return null;

    return data.country_code || null;
  } catch {
    return null;
  }
}

export default async function PricingPage() {
  const supabase = await createClient();

  const { data: pricing } = await supabase
    .from("pricing_tiers")
    .select("monthly_price")
    .eq("id", "standard")
    .single();

  const countryCode = await detectCountryCode();
  const currency = getCurrencyForCountry(countryCode);
  const rates = await getUsdExchangeRates();

  const displayPrice =
    pricing?.monthly_price != null
      ? convertUsd(pricing.monthly_price, currency, rates)
      : null;

  const features = [
    'Your website live at — your-restaurant.menuberg.com',
    'Unlimited categories, items, and photos',
    'High-quality QR codes to print on tables and packaging',
    'Customize your website with 4 themes and 4 layouts.',
    'Complete pages featuring your Menu, About section, and Contact info',
    'Instant updates to change prices or hide sold-out items',
    'Fully mobile-responsive for all screen sizes',
  ];



  return (
    <div className="min-h-screen bg-[#0D1B2A] text-white">
      <LandingNav />

      <main className="pt-32 pb-20 px-6 max-w-xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-[#7DD3FC] text-lg">
            One simple monthly subscription. Cancel anytime.
          </p>
          <div className="mt-6 flex items-end justify-center gap-1">
            <span className="text-5xl font-extrabold text-white">
              {displayPrice != null ? formatCurrency(displayPrice, currency) : "—"}
            </span>
            <span className="text-lg text-gray-400 mb-1">/month</span>
          </div>
        </div>

        <div>
          <ul className="space-y-3 my-8">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-[#38BDF8] mt-0.5 shrink-0" />
                <span className="text-gray-200">{f}</span>
              </li>
            ))}
          </ul>

          <Link
            href="/signup"
            className="block text-center bg-[#38BDF8] hover:bg-[#7DD3FC] text-[#0D1B2A] font-semibold py-3 rounded-lg transition-colors"
          >
            Get started
          </Link>
        </div>

        <p className="text-center text-sm text-gray-500 mt-8">
          Cancel anytime, no contract.
        </p>

        <div className="text-center mt-16 text-sm text-gray-500">
          <Link href="/terms" className="hover:text-[#7DD3FC] mr-4">
            Terms of Service
          </Link>
          <Link href="/privacy" className="hover:text-[#7DD3FC] mr-4">
            Privacy Policy
          </Link>
          <Link href="/refund" className="hover:text-[#7DD3FC]">
            Refund Policy
          </Link>
        </div>
      </main>
    </div>
  );
}