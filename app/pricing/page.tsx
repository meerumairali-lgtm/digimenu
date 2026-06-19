import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import Link from "next/link";
import LandingNav from "@/app/components/LandingNav";
import { Check } from "lucide-react";

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

  const features = [
    "Custom QR code menu",
    "Unlimited menu items & categories",
    "Mobile-optimized public menu page",
    "Live menu editing dashboard",
    "Analytics on menu views",
    "Email support",
  ];

  const showIntro = tier?.intro_discount_active && tier?.intro_monthly_price != null;
  const displayPrice = showIntro ? tier!.intro_monthly_price! : tier?.monthly_price;
  const crossedPrice = showIntro ? tier?.monthly_price : null;
  const introMonths = tier?.intro_duration_months ?? 3;
  const discountPercent =
    showIntro && tier && crossedPrice
      ? Math.round((1 - tier.intro_monthly_price! / crossedPrice) * 100)
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
                ${crossedPrice.toFixed(2)}
              </span>
            )}
          </div>

          <div className="mb-2">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold">
                ${displayPrice?.toFixed(2) ?? "—"}
              </span>
              <span className="text-[#7DD3FC]">/month</span>
            </div>
            <p className="text-sm text-gray-400 mt-1">
              + ${tier?.setup_fee.toFixed(2) ?? "—"} one-time setup fee
            </p>
            {showIntro && (
              <p className="text-sm text-[#7DD3FC] mt-2">
                For your first <strong>{introMonths} months</strong>, then $
                {crossedPrice?.toFixed(2)}/month after.
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
          Prices shown in USD. Cancel anytime, no contract.
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