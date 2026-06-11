import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import QRPage from "./QRPage";

export default async function QRCodePage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: restaurant } = await supabase
        .from("restaurants")
        .select("slug, name")
        .eq("user_id", user.id)
        .single();

    if (!restaurant) redirect("/dashboard/setup");

    return (
        <QRPage
            restaurantSlug={restaurant.slug}
            restaurantName={restaurant.name}
        />
    );
}