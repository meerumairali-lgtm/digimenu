import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

// Counts how many of the "profile" fields on a restaurant row are filled in.
// Used to drive the "% profile complete" indicator on the Settings card.
function calculateProfileCompletion(restaurant: Record<string, any>): number {
  const simpleFields = [
    "name", "slug", "tagline", "phone", "phone_country_code", "address",
    "email", "whatsapp", "instagram", "facebook", "theme", "currency",
    "layout", "about", "google_maps_url", "country", "country_code",
    "state", "city",
  ];

  const filledSimple = simpleFields.filter(key => {
    const value = restaurant[key];
    return value !== null && value !== undefined && String(value).trim() !== "";
  }).length;

  // opening_hours is an object, not a string — treat it as filled if it
  // exists and has at least one day set (it's null until Settings is saved once)
  const hoursFilled =
    restaurant.opening_hours && Object.keys(restaurant.opening_hours).length > 0 ? 1 : 0;

  const totalFields = simpleFields.length + 1;
  const filledFields = filledSimple + hoursFilled;

  return Math.round((filledFields / totalFields) * 100);
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!restaurant) redirect("/dashboard/setup");

  const { count: categoryCount } = await supabase
    .from("categories")
    .select("*", { count: "exact", head: true })
    .eq("restaurant_id", restaurant.id);

  const { count: itemCount } = await supabase
    .from("menu_items")
    .select("*", { count: "exact", head: true })
    .eq("restaurant_id", restaurant.id);

  const { count: availableCount } = await supabase
    .from("menu_items")
    .select("*", { count: "exact", head: true })
    .eq("restaurant_id", restaurant.id)
    .eq("is_available", true);

  // Today's page views preview
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const { count: todayViews } = await supabase
    .from("page_views")
    .select("*", { count: "exact", head: true })
    .eq("restaurant_id", restaurant.id)
    .gte("visited_at", todayStart.toISOString())

  const profileCompletion = calculateProfileCompletion(restaurant);

  const menuUrl = `/${restaurant.slug}`;
  const fullMenuUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}${menuUrl}`;

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">
          {restaurant.name}
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Menu live at{" "}
          <a href={fullMenuUrl} target="_blank" rel="noreferrer"
            className="text-sky-500 underline underline-offset-2 hover:text-sky-600">
            {fullMenuUrl}
          </a>
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <Link href="/dashboard/menu"
          className="bg-sky-50 border border-sky-100 rounded-xl p-4 hover:border-sky-200 transition-colors">
          <p className="text-xs text-sky-600 mb-1">Categories</p>
          <p className="text-2xl font-semibold text-[#0D1B2A]">{categoryCount ?? 0}</p>
        </Link>

        <Link href="/dashboard/menu"
          className="bg-sky-50 border border-sky-100 rounded-xl p-4 hover:border-sky-200 transition-colors">
          <p className="text-xs text-sky-600 mb-1">Menu items</p>
          <p className="text-2xl font-semibold text-[#0D1B2A]">
            {availableCount ?? 0}
            <span className="text-sm font-normal text-slate-400"> / {itemCount ?? 0}</span>
          </p>
        </Link>

        <a href={fullMenuUrl} target="_blank" rel="noreferrer"
          className="bg-sky-50 border border-sky-100 rounded-xl p-4 hover:border-sky-200 transition-colors">
          <p className="text-xs text-sky-600 mb-1">Status</p>
          <p className="text-lg font-semibold text-green-600 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
            Live
          </p>
        </a>
      </div>

      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">
        Quick actions
      </p>

      <div className="grid sm:grid-cols-4 gap-3">
        <Link href="/dashboard/menu"
          className="bg-white border border-slate-200 rounded-xl p-4 hover:border-sky-200 hover:bg-sky-50 transition-colors">
          <p className="text-xs text-slate-400 mb-1">Menu items</p>
          <p className="text-2xl font-semibold text-[#0D1B2A]">{itemCount ?? 0}</p>
        </Link>

        <Link href="/dashboard/qr"
          className="bg-white border border-slate-200 rounded-xl p-4 hover:border-sky-200 hover:bg-sky-50 transition-all">
          <p className="font-medium text-[#0D1B2A] text-sm">Get QR code</p>
          <p className="text-xs text-slate-400 mt-0.5">Download and print for your tables</p>
        </Link>

        <Link href="/dashboard/settings"
          className="bg-white border border-slate-200 rounded-xl p-4 hover:border-sky-200 hover:bg-sky-50 transition-all">
          <p className="font-medium text-[#0D1B2A] text-sm">Settings</p>
          <p
            className={`text-xs mt-0.5 font-semibold ${
              profileCompletion >= 100 ? "text-green-600" : "text-red-500"
            }`}
          >
            {profileCompletion >= 100 ? "Profile complete ✓" : `${profileCompletion}% profile complete`}
          </p>
        </Link>

        <Link href="/dashboard/analytics"
          className="bg-white border border-slate-200 rounded-xl p-4 hover:border-sky-200 hover:bg-sky-50 transition-all">
          <p className="font-medium text-[#0D1B2A] text-sm">Analytics</p>
          <p className="text-xs text-slate-400 mt-0.5">
            {todayViews ?? 0} visitor{todayViews === 1 ? '' : 's'} today
          </p>
        </Link>
      </div>
    </main>
  );
}