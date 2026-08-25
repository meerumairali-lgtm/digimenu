import { createClient } from "@/lib/supabase/server";
import LandingNav from "@/app/components/LandingNav";

export const dynamic = "force-dynamic";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy | Menuberg",
  description:
    "Learn about Menuberg's refund policy, eligibility, cancellation terms, and how to request a refund for your restaurant website subscription.",
  alternates: {
    canonical: "https://www.menuberg.com/refund",
  },
  openGraph: {
    title: "Refund Policy | Menuberg",
    description:
      "Learn about Menuberg's refund policy, eligibility, cancellation terms, and how to request a refund for your restaurant website subscription.",
    url: "https://www.menuberg.com/refund",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Refund Policy | Menuberg",
  },
};

export default async function RefundPage() {
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
                <h1 className="text-3xl font-bold mb-2">Refund Policy</h1>
                <p className="text-sm text-gray-400 mb-10">Last updated: {lastUpdated}</p>

                <div className="space-y-8 text-gray-200 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-semibold text-[#7DD3FC] mb-3">
                            1. Our approach
                        </h2>
                        <p>
                            We want Menuberg to work reliably for your business. Refunds
                            are evaluated case by case, and are issued when you were
                            unable to use the Service due to an issue on our side —
                            such as a platform outage, a billing error, a technical fault
                            that prevented your menu or dashboard from functioning, or a
                            charge that was processed incorrectly.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-[#7DD3FC] mb-3">
                            2. What is eligible for a refund
                        </h2>
                        <ul className="list-disc list-inside space-y-2">
                            <li>
                                You were charged but the Service was unavailable or
                                non-functional due to an error, bug, or outage on our side.
                            </li>
                            <li>
                                You were billed in error — for example, charged twice, or
                                charged after a cancellation that should have taken effect.
                            </li>
                            <li>
                                A setup fee was charged but your account could not be set up
                                due to a technical issue caused by the platform.
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-[#7DD3FC] mb-3">
                            3. What is generally not eligible for a refund
                        </h2>
                        <ul className="list-disc list-inside space-y-2">
                            <li>
                                Change of mind, no longer needing the Service, or
                                dissatisfaction unrelated to a technical or billing fault.
                            </li>
                            <li>
                                Not using the Service during a billing period in which it
                                was working normally.
                            </li>
                            <li>
                                Issues caused by incorrect information entered by you, or by
                                third-party services outside our control.
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-[#7DD3FC] mb-3">
                            4. How to request a refund
                        </h2>
                        <p>
                            There is no fixed deadline to request a refund — contact us as
                            soon as you notice an issue and we will review it. To request
                            a refund, email us at{" "}

                            href={`mailto:${contactEmail}`}
                            className="text-[#38BDF8] underline"
                            <a>
                                {contactEmail}
                            </a>
                            {contactPhone ? ` or call ${contactPhone}` : ""}, including
                            your account email and a description of the issue. We will
                            review each request individually and respond with our
                            decision.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-[#7DD3FC] mb-3">
                            5. How refunds are issued
                        </h2>
                        <p>
                            Approved refunds are returned to the original payment method
                            through our payment processor. Processing times may vary
                            depending on your bank or card provider.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-[#7DD3FC] mb-3">
                            6. Subscription cancellation
                        </h2>
                        <p>
                            Cancelling your subscription stops future billing but does
                            not automatically refund the current billing period, unless
                            the cancellation was due to a fault on our side as described
                            above.
                        </p>
                    </section>

                    <p>
                        There is no fixed deadline to request a refund — contact us as soon as
                        you notice an issue using our{" "}
                        <a href="/#contact" className="text-[#38BDF8] underline">
                            contact form
                        </a>
                        , including your account email and a description of the issue. We will
                        review each request individually and respond with our decision.
                    </p>
                </div>
            </main>
        </div>
    );
}