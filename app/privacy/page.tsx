import { createClient } from "@/lib/supabase/server";
import LandingNav from "@/app/components/LandingNav";

export const dynamic = "force-dynamic";

export default async function PrivacyPage() {
    const supabase = await createClient();
    const { data: content } = await supabase
        .from("landing_content")
        .select("key, value")
        .in("key", ["contact_email", "contact_phone"]);

    const contactEmail =
        content?.find((c) => c.key === "contact_email")?.value ??
        "meerumairali@gmail.com";
    const contactPhone = content?.find((c) => c.key === "contact_phone")?.value;

    const lastUpdated = "June 19, 2026";

    return (
        <div className="min-h-screen bg-[#0D1B2A] text-white">
            <LandingNav />

            <main className="pt-32 pb-20 px-6 max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
                <p className="text-sm text-gray-400 mb-10">Last updated: {lastUpdated}</p>

                <div className="space-y-8 text-gray-200 leading-relaxed">
                    <section>
                        <p>
                            This Privacy Policy explains what information Menuberg
                            collects, how it is used, and how it is protected. Menuberg is
                            currently operated as an individual/sole proprietorship based
                            in Pakistan.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-[#7DD3FC] mb-3">
                            1. Information we collect
                        </h2>
                        <ul className="list-disc list-inside space-y-2">
                            <li>
                                Account information: name, email address, and password
                                (handled securely via our authentication provider).
                            </li>
                            <li>
                                Business information: restaurant name, menu items, prices,
                                images, contact details, and other content you choose to
                                upload.
                            </li>
                            <li>
                                Billing information: your selected pricing tier, country
                                used for tier assignment, and transaction records. Card and
                                payment details are collected and processed directly by our
                                third-party payment processor — we do not store full card
                                numbers ourselves.
                            </li>
                            <li>
                                Usage data: approximate location (derived from IP address,
                                used only to determine regional pricing and currency
                                estimates), menu page views, and basic analytics.
                            </li>
                            <li>
                                Contact form submissions: name, email, phone, and message
                                content if you contact us through the website.
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-[#7DD3FC] mb-3">
                            2. How we use this information
                        </h2>
                        <p>
                            We use the information above to operate and provide the
                            Service, process payments and subscriptions, determine
                            applicable regional pricing, respond to support requests,
                            send important account or billing notices, and improve the
                            reliability and performance of the platform.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-[#7DD3FC] mb-3">
                            3. How we store and protect data
                        </h2>
                        <p>
                            Data is stored using Supabase, with row-level security
                            policies restricting access so that each restaurant account
                            can only access its own data, and administrative data (such
                            as billing records) is restricted to authorized
                            administrators only. We take reasonable technical measures to
                            protect your data but cannot guarantee absolute security of
                            any system connected to the internet.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-[#7DD3FC] mb-3">
                            4. Third parties we use
                        </h2>
                        <ul className="list-disc list-inside space-y-2">
                            <li>A payment processor, to handle subscription billing.</li>
                            <li>
                                A hosting provider, to serve the website and store
                                application data.
                            </li>
                            <li>
                                An IP-geolocation service, used only to estimate your
                                country for pricing purposes; we do not use this for
                                tracking or advertising.
                            </li>
                            <li>
                                A currency-exchange-rate service, used only to display an
                                informational local-currency estimate at checkout.
                            </li>
                        </ul>
                        <p className="mt-3">
                            We do not sell your personal information to third parties.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-[#7DD3FC] mb-3">
                            5. Public menu pages
                        </h2>
                        <p>
                            Information you add to your menu (restaurant name, items,
                            prices, images, contact details, social links) is displayed
                            publicly on your menu page, since this is the core purpose of
                            the Service. Do not include information there that you do not
                            want visible to the public.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-[#7DD3FC] mb-3">
                            6. Data retention
                        </h2>
                        <p>
                            We retain account and business data for as long as your
                            account is active. If you request account deletion, we will
                            remove your business and menu data within a reasonable time,
                            except where we are required to retain billing or transaction
                            records for legal, accounting, or fraud-prevention purposes.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-[#7DD3FC] mb-3">
                            7. Your rights
                        </h2>
                        <p>
                            You may request access to, correction of, or deletion of your
                            personal data by contacting us using the details below. We
                            will respond within a reasonable timeframe.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-[#7DD3FC] mb-3">
                            8. Changes to this policy
                        </h2>
                        <p>
                            We may update this Privacy Policy from time to time. Material
                            changes will be reflected by updating the "Last updated" date
                            above.
                        </p>
                    </section>

                    <p>
                        Questions about this Privacy Policy or your data can be sent through our{" "}
                        <a href="/#contact" className="text-[#38BDF8] underline">
                            contact form
                        </a>
                        .
                    </p>
                </div>
            </main>
        </div>
    );
}