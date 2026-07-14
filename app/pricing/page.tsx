import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import Link from "next/link";
import LandingNav from "@/app/components/LandingNav";
import { Check } from "lucide-react";
import { getUsdExchangeRates } from "@/lib/currency";
import { getCurrencyForCountry, convertUsd, formatCurrency } from "@/lib/currencyDisplay";

export const dynamic = "force-dynamic";

interface PricingTier {
  id: string;
  label: string;
  setup_fee: number;
  monthly_price: number;
  intro_discount_active: boolean;
  intro_monthly_price: number | null;
  intro_duration_months: number;
  countries: string[];
}

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

  const { data: tiers } = await supabase
    .from("pricing_tiers")
    .select(
      "id, label, setup_fee, monthly_price, intro_discount_active, intro_monthly_price, intro_duration_months, countries"
    );

  const allTiers = (tiers as PricingTier[]) || [];
  const tierA = allTiers.find((t) => t.id === "tier_a");
  const tierB = allTiers.find((t) => t.id === "tier_b");

  const countryCode = await detectCountryCode();
  const isTierB =
    countryCode && tierB?.countries?.includes(countryCode) ? true : false;

  const tier = isTierB ? tierB : tierA;
  const currency = getCurrencyForCountry(countryCode);
  const rates = await getUsdExchangeRates();

  const features = [
    'Your website live at — your-restaurant.menuberg.com',
    'Unlimited categories, items, and photos',
    'High-quality QR codes to print on tables and packaging',
    'Customize your website with 4 themes and 4 layouts.',
    'Complete pages featuring your Menu, About section, and Contact info',
    'Instant updates to change prices or hide sold-out items',
    'Fully mobile-responsive for all screen sizes',
  ];

  const showIntro = tier?.intro_discount_active && tier?.intro_monthly_price != null;
  const displayPriceUsd = showIntro ? tier!.intro_monthly_price! : tier?.monthly_price;
  const crossedPriceUsd = showIntro ? tier?.monthly_price : null;
  const introMonths = tier?.intro_duration_months ?? 3;

  const displayPrice =
    displayPriceUsd != null ? convertUsd(displayPriceUsd, currency, rates) : null;
  const crossedPrice =
    crossedPriceUsd != null ? convertUsd(crossedPriceUsd, currency, rates) : null;
  const setupFee =
    tier?.setup_fee != null ? convertUsd(tier.setup_fee, currency, rates) : null;

  const discountPercent =
    showIntro && tier && tier.monthly_price
      ? Math.round((1 - tier.intro_monthly_price! / tier.monthly_price) * 100)
      : null;

  return (
    <div className="min-h-screen bg-[#0D1B2A] text-white">
      <LandingNav />

      <main className="pt-32 pb-20 px-6 max-w-xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-[#7DD3FC] text-lg">
            One small setup fee, then a low monthly subscription. Cancel
            anytime.
          </p>
        </div>

        <div className="bg-[#112240] border-2 border-[#38BDF8] rounded-2xl p-8 flex flex-col relative">
          {showIntro && discountPercent != null && discountPercent > 0 && (
            <span className="absolute -top-3 left-8 bg-[#0D1B2A] border border-[#F59E0B]/30 text-[#F59E0B] text-xs font-bold px-3 py-1 rounded-full">
              LIMITED TIME — {discountPercent}% OFF
            </span>
          )}

          <div className="mb-2 flex items-baseline gap-3">
            {crossedPrice != null && (
              <span className="text-lg text-gray-500 line-through">
                {formatCurrency(crossedPrice, currency)}
              </span>
            )}
          </div>

          <div className="mb-2">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold">
                {displayPrice != null ? formatCurrency(displayPrice, currency) : "—"}
              </span>
              <span className="text-[#7DD3FC]">/month</span>
            </div>
            <p className="text-sm text-gray-400 mt-1">
              + {setupFee != null ? formatCurrency(setupFee, currency) : "—"} one-time setup fee
            </p>
            {showIntro && (
              <p className="text-sm text-[#7DD3FC] mt-2">
                For your first <strong>{introMonths} months</strong>, then{" "}
                {crossedPrice != null ? formatCurrency(crossedPrice, currency) : "—"}/month after.
              </p>
            )}
          </div>

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