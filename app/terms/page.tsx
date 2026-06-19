import { createClient } from "@/lib/supabase/server";
import LandingNav from "@/app/components/LandingNav";

export const dynamic = "force-dynamic";

export default async function TermsPage() {
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
                <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
                <p className="text-sm text-gray-400 mb-10">Last updated: {lastUpdated}</p>

                <div className="space-y-8 text-gray-200 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-semibold text-[#7DD3FC] mb-3">
                            1. Who we are
                        </h2>
                        <p>
                            Menuberg ("we," "us," "our") is a digital menu platform
                            currently operated as an individual/sole proprietorship based
                            in Pakistan. We are in the process of evaluating registration
                            as a limited liability company in the United States; if and
                            when that registration is completed, these Terms will be
                            updated to reflect the new operating entity, and continued use
                            of the Service after such an update will constitute acceptance
                            of the revised Terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-[#7DD3FC] mb-3">
                            2. The Service
                        </h2>
                        <p>
                            Menuberg provides restaurants and food businesses with a
                            digital menu platform, including a hosted public menu page,
                            QR code generation, a management dashboard, and related
                            features ("Service"). By creating an account, you agree to
                            these Terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-[#7DD3FC] mb-3">
                            3. Accounts and eligibility
                        </h2>
                        <p>
                            You must provide accurate information when creating an
                            account. You are responsible for maintaining the
                            confidentiality of your login credentials and for all activity
                            under your account. You must be authorized to act on behalf of
                            the business you register.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-[#7DD3FC] mb-3">
                            4. Fees and billing
                        </h2>
                        <p>
                            Use of the Service requires payment of a one-time setup fee
                            and a recurring monthly subscription fee, the amount of which
                            depends on your country at the time of signup. Current pricing
                            is published on our{" "}
                            <a href="/pricing" className="text-[#38BDF8] underline">
                                Pricing page
                            </a>
                            . Payments are processed through our third-party payment
                            processor. Subscriptions renew automatically each billing
                            period until cancelled. You may cancel your subscription at
                            any time from your dashboard settings; cancellation stops
                            future billing but does not, on its own, entitle you to a
                            refund for the current billing period except as described in
                            our{" "}
                            <a href="/refund" className="text-[#38BDF8] underline">
                                Refund Policy
                            </a>
                            .
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-[#7DD3FC] mb-3">
                            5. Acceptable use
                        </h2>
                        <p>
                            You agree not to use the Service to upload unlawful, infringing,
                            or harmful content, to misrepresent your business, to attempt
                            to disrupt or gain unauthorized access to the platform, or to
                            use the Service in violation of any applicable law.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-[#7DD3FC] mb-3">
                            6. Content ownership
                        </h2>
                        <p>
                            You retain ownership of the menu content, images, and business
                            information you upload. You grant us a limited license to
                            host, display, and process that content solely for the
                            purpose of operating the Service for you.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-[#7DD3FC] mb-3">
                            7. Suspension and termination
                        </h2>
                        <p>
                            We may suspend or terminate accounts that violate these Terms,
                            fail to maintain active billing, or are used in a way that
                            poses risk to the Service or other users. You may stop using
                            the Service and request account deletion at any time by
                            contacting us.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-[#7DD3FC] mb-3">
                            8. Service availability
                        </h2>
                        <p>
                            We aim to keep the Service available and reliable but do not
                            guarantee uninterrupted access. The Service is provided "as
                            is" without warranties of any kind, to the maximum extent
                            permitted by law.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-[#7DD3FC] mb-3">
                            9. Limitation of liability
                        </h2>
                        <p>
                            To the maximum extent permitted by applicable law, we are not
                            liable for indirect, incidental, or consequential damages
                            arising from your use of the Service. Our total liability for
                            any claim relating to the Service is limited to the amount you
                            paid us in the twelve months preceding the claim.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-[#7DD3FC] mb-3">
                            10. Governing law
                        </h2>
                        <p>
                            These Terms are currently governed by the laws of Pakistan,
                            reflecting our current place of operation. Should our
                            operating entity change to a US LLC, an updated governing law
                            clause will be published and will apply going forward.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-[#7DD3FC] mb-3">
                            11. Changes to these Terms
                        </h2>
                        <p>
                            We may update these Terms from time to time. Material changes
                            will be reflected by updating the "Last updated" date above.
                            Continued use of the Service after changes take effect
                            constitutes acceptance of the updated Terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-[#7DD3FC] mb-3">
                            12. Contact
                        </h2>
                        <p>
                            Questions about these Terms can be sent through our{" "}
                            <a href="/#contact" className="text-[#38BDF8] underline">
                                contact form
                            </a>
                            .
                        </p>
                    </section>
                </div>
            </main>
        </div>
    );
}