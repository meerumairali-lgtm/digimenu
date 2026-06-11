import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import DashboardNav from "./DashboardNav";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

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
    .from('menu_items')
    .select('*', { count: 'exact', head: true })
    .eq('restaurant_id', restaurant.id)
    .eq('is_available', true)

  const menuUrl = `/menu/${restaurant.slug}`;

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav menuUrl={menuUrl} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-900">
            {restaurant.name}
          </h1>

          <p className="text-slate-500 text-sm mt-1">
            Menu live at{" "}
            <a
              href={menuUrl}
              target="_blank"
              rel="noreferrer"
              className="text-slate-700 underline underline-offset-2 hover:text-slate-900"
            >
              {`${process.env.NEXT_PUBLIC_SITE_URL ?? ""}${menuUrl}`}
            </a>
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <Link
            href="/dashboard/menu"
            className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-colors"
          >
            <p className="text-xs text-slate-400 mb-1">Categories</p>
            <p className="text-2xl font-semibold text-slate-900">
              {categoryCount ?? 0}
            </p>
          </Link>

          <Link href="/dashboard/menu" className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-colors">
            <p className="text-xs text-slate-400 mb-1">Menu items</p>
            <p className="text-2xl font-semibold text-slate-900">{availableCount ?? 0}
              <span className="text-sm font-normal text-slate-400"> / {itemCount ?? 0}</span>
            </p>
          </Link>

          <a
            href={menuUrl}
            target="_blank"
            rel="noreferrer"
            className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-colors"
          >
            <p className="text-xs text-slate-400 mb-1">Status</p>
            <p className="text-lg font-semibold text-green-600 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
              Live
            </p>
          </a>
        </div>

        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">
          Quick actions
        </p>

        <div className="grid sm:grid-cols-3 gap-3">
          <Link href="/dashboard/menu" className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-colors">
            <p className="text-xs text-slate-400 mb-1">Menu items</p>
            <p className="text-2xl font-semibold text-slate-900">{itemCount ?? 0}</p>
          </Link>

          <Link
            href="/dashboard/qr"
            className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 hover:shadow-sm transition-all"
          >
            <p className="font-medium text-slate-900 text-sm">Get QR code</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Download and print for your tables
            </p>
          </Link>

          <Link
            href="/dashboard/settings"
            className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 hover:shadow-sm transition-all"
          >
            <p className="font-medium text-slate-900 text-sm">Settings</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Profile, social links, contact info
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
}