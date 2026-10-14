import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  CheckCircle2,
  Clock,
  Building2,
  HelpCircle,
  FileText,
  Mail,
  Scale,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Cancellation & Refund Policy | AbroadRoute",
  description:
    "Official cancellation and refund policy for AbroadRoute (a brand by Dnyanal Educon Pvt. Ltd.). Review transparent guidelines for B2B lead wallet recharges, disputes, and student services.",
  openGraph: {
    title: "Cancellation & Refund Policy | AbroadRoute",
    description:
      "Official cancellation and refund policy for AbroadRoute. Review transparent guidelines for B2B lead wallet recharges, disputes, and student services.",
    url: "https://abroadroute.com/refund-policy",
    type: "website",
  },
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FDFCF7] flex flex-col justify-between">
      <Header />

      <main className="flex-1 pb-20 pt-6 sm:pt-10">
        {/* Breadcrumb */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link href="/" className="hover:text-[#1D5A6C] transition">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-[#1D5A6C] font-bold">Refund Policy</span>
          </div>
        </div>

        {/* Content Container */}
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-[#D9CFB8]/60 bg-white p-8 sm:p-12 shadow-xs space-y-8 text-[#1A1A1A] text-sm leading-relaxed">
            {/* Header Title */}
            <div className="border-b border-[#D9CFB8]/40 pb-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 border border-amber-200/60 px-3 py-1 text-xs font-bold text-[#D89A3E] uppercase tracking-wider mb-3">
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Transparent Financial Governance</span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#1D5A6C]">
                Cancellation & Refund Policy
              </h1>
              <p className="mt-2 text-xs text-slate-500">
                Effective Date: September 2026 | Last Updated: September 2026 |
                AbroadRoute · Dnyanal Educon Pvt. Ltd.
              </p>
            </div>

            {/* Section 1 */}
            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-[#1D5A6C] flex items-center gap-2">
                <Scale className="h-5 w-5 text-[#D89A3E]" />
                <span>1. Overview & Operating Entity</span>
              </h2>
              <p>
                AbroadRoute (hereinafter referred to as{" "}
                <strong>&quot;Platform&quot;</strong>,{" "}
                <strong>&quot;We&quot;</strong>, <strong>&quot;Us&quot;</strong>
                , or <strong>&quot;Our&quot;</strong>) is an authoritative
                international education discovery and admissions platform
                operated by <strong>Dnyanal Educon Pvt. Ltd.</strong> (Founder
                Director: Nikhita Pradeep Deshmukh), incorporated under the laws
                of India.
              </p>
              <p>
                This Policy governs all financial transactions, lead disputes,
                wallet balances, service fee refunds, and subscription
                cancellations across our multi-stakeholder ecosystem comprising
                Students, B2B Education Consultants, and University Partners.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-3 border-t border-slate-100 pt-6">
              <h2 className="font-serif text-lg font-bold text-[#102C57] flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <span>
                  2. Student Services Policy (100% Free Core Admissions)
                </span>
              </h2>
              <p>
                All core educational discovery, AI counseling sessions,
                university comparison tools, living cost calculators, test prep
                syllabi, and initial admissions counseling provided directly to
                students are <strong>100% free of charge</strong> with zero
                upfront fees.
              </p>
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/70 space-y-2 text-xs">
                <p className="font-bold text-slate-900">
                  Third-Party & Official University Application Fees:
                </p>
                <p className="text-slate-600">
                  Payments made by students directly to foreign universities
                  (e.g., application evaluation fees, tuition deposit,
                  Uni-Assist processing fees) or standardized testing bodies
                  (IDP IELTS, ETS TOEFL/GRE, GMAC GMAT, Pearson VUE NCLEX/PTE)
                  are strictly governed by the refund policies of those
                  individual institutions and examination authorities.
                  AbroadRoute does not collect or hold foreign university
                  tuition deposits.
                </p>
              </div>
            </section>

            {/* Section 3 */}
            <section className="space-y-4 border-t border-slate-100 pt-6">
              <h2 className="font-serif text-lg font-bold text-[#102C57] flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-700" />
                <span>3. B2B Consultant Portal & Lead Wallet Refund Terms</span>
              </h2>
              <p>
                Authorized overseas education consultants and B2B partners who
                purchase verified, DPDP Act 2023-consented student leads operate
                on a prepaid <strong>Buyer Wallet</strong> model.
              </p>

              <div className="space-y-3 text-xs">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                  <h3 className="font-bold text-slate-900 text-sm mb-1">
                    A. Lead Dispute & Auto-Refund Window
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    Buyers are entitled to file a 1-click lead dispute through
                    the B2B Portal within <strong>48 hours</strong> of lead
                    delivery for any of the following valid rejection
                    categories:
                  </p>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-600">
                    <li>
                      <strong>Invalid Contact Information:</strong> Invalid
                      phone number, unallocated number, or SMS OTP failure.
                    </li>
                    <li>
                      <strong>Out of Scope:</strong> Student's budget, intake
                      year, or discipline fails stated tier criteria.
                    </li>
                    <li>
                      <strong>Duplicate Lead:</strong> The identical student
                      profile was already delivered to the buyer within the
                      preceding 30 days.
                    </li>
                    <li>
                      <strong>Uninterested / Accidental Submission:</strong>{" "}
                      Student confirms they did not request overseas admissions
                      counseling upon immediate first contact.
                    </li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                  <h3 className="font-bold text-slate-900 text-sm mb-1">
                    B. Dispute Review SLA & Wallet Credit
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    Our compliance triage team reviews all disputes within{" "}
                    <strong>24 business hours</strong>. Upon approval, 100% of
                    the Cost-Per-Lead (CPL) charged is automatically credited
                    back to the buyer&apos;s active wallet balance within{" "}
                    <strong>1 hour</strong> of dispute approval.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                  <h3 className="font-bold text-slate-900 text-sm mb-1">
                    C. Unused Wallet Balance Refund on Account Termination
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    If an authorized B2B partner elects to close their active
                    portal account, any remaining unspent prepaid wallet balance
                    (excluding promotional or referral bonus credits) will be
                    refunded to the original source bank account or payment
                    method within <strong>5 to 7 business days</strong> after
                    mandatory KYC verification and tax reconciliation.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section className="space-y-3 border-t border-slate-100 pt-6">
              <h2 className="font-serif text-lg font-bold text-[#102C57] flex items-center gap-2">
                <FileText className="h-5 w-5 text-amber-700" />
                <span>4. University Partner Institutional Subscriptions</span>
              </h2>
              <p>
                Accredited universities and colleges subscribing to featured
                institutional profiles, marketing spotlight slots, or direct
                recruitment packages are governed by their respective
                Institutional Service Agreement (ISA).
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
                <li>
                  <strong>Pre-Launch Cancellation:</strong> Written cancellation
                  requested at least 15 calendar days prior to campaign
                  initiation will receive an 85% refund (15% administrative and
                  setup fee withheld).
                </li>
                <li>
                  <strong>Post-Launch Term:</strong> Once promotional listings
                  or marketing campaigns have gone live on the platform, fees
                  for that active billing cycle are non-refundable.
                </li>
              </ul>
            </section>

            {/* Section 5 */}
            <section className="space-y-3 border-t border-slate-100 pt-6">
              <h2 className="font-serif text-lg font-bold text-[#102C57] flex items-center gap-2">
                <Clock className="h-5 w-5 text-indigo-700" />
                <span>5. Payment Gateways & Processing Mode</span>
              </h2>
              <p>
                All online transactions are processed through RBI-authorized
                payment aggregators (including <strong>Razorpay</strong>,{" "}
                <strong>Stripe</strong>, and Unified Payments Interface - UPI).
              </p>
              <p className="text-xs text-slate-600">
                Refunds issued to bank accounts will reflect with the original
                descriptor <em>&quot;RAZORPAY*ABROADROUTE&quot;</em> or{" "}
                <em>&quot;DNYANAL EDUCON&quot;</em> depending on your issuing
                bank&apos;s settlement schedule.
              </p>
            </section>

            {/* Section 6 */}
            <section className="space-y-4 border-t border-slate-100 pt-6">
              <h2 className="font-display text-lg font-bold text-[#1D5A6C] flex items-center gap-2">
                <Mail className="h-5 w-5 text-[#D89A3E]" />
                <span>6. Grievance Officer & Dispute Resolution Desk</span>
              </h2>
              <p>
                For any questions regarding billing discrepancies, dispute
                escalations, or refund inquiries, please contact our dedicated
                financial grievance desk:
              </p>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-2 text-xs">
                <p>
                  <strong>Entity Name:</strong> Dnyanal Educon Pvt. Ltd.
                  (AbroadRoute)
                </p>
                <p>
                  <strong>Founder Director:</strong> Nikhita Pradeep Deshmukh
                </p>
                <p>
                  <strong>Department:</strong> Financial Compliance & Dispute
                  Desk
                </p>
                <p>
                  <strong>Grievance Email:</strong>{" "}
                  <a
                    href="mailto:billing@abroadroute.com"
                    className="text-[#1D5A6C] font-bold hover:underline"
                  >
                    billing@abroadroute.com
                  </a>
                </p>
                <p>
                  <strong>Support Phone:</strong> +91 20 4860 1122 (Mon - Fri,
                  10:00 AM - 6:00 PM IST)
                </p>
                <p>
                  <strong>Registered Address:</strong> Pune IT Park, Aundh Road,
                  Pune, Maharashtra 411020, India
                </p>
                <p className="text-slate-500 pt-1">
                  <strong>Resolution SLA:</strong> All formal grievances are
                  acknowledged within 24 hours and definitively resolved within
                  48 to 72 business hours.
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
