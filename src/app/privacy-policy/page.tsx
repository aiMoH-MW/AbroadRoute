import { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | DPDP Act 2023 Compliance | AbroadRoute",
  description:
    "Official privacy policy for AbroadRoute (a brand by Dnyanal Educon Pvt. Ltd.). Learn how student personal data is protected under India DPDP Act 2023 with strict zero-spam data privacy.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FDFCF7] flex flex-col justify-between">
      <Header />
      <main className="flex-1 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-[#D9CFB8]/60 bg-white p-8 sm:p-12 shadow-xs space-y-6 text-[#1A1A1A] text-sm leading-relaxed">
            <div className="border-b border-[#D9CFB8]/40 pb-6">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#D89A3E] uppercase tracking-wider mb-2">
                <ShieldCheck className="h-4 w-4" /> DPDP Act 2023 & GDPR
                Compliant
              </div>
              <h1 className="font-display text-3xl font-bold text-[#1D5A6C] sm:text-4xl">
                Privacy Policy
              </h1>
              <p className="mt-1 text-xs text-slate-500">
                Last Updated: September 2026 | AbroadRoute · Dnyanal Educon Pvt.
                Ltd.
              </p>
            </div>

            <h2 className="font-display text-lg font-bold text-[#1D5A6C] pt-2">
              1. Introduction
            </h2>
            <p>
              AbroadRoute (a brand by Dnyanal Educon Pvt. Ltd., Founder
              Director: Nikhita Pradeep Deshmukh) is committed to protecting the
              privacy and personal data of Indian students, applicants, and
              educational partners. This Privacy Policy details how we collect,
              process, store, and safeguard your Personal Identifiable
              Information (PII) in accordance with the Digital Personal Data
              Protection (DPDP) Act, 2023.
            </p>

            <h2 className="font-display text-lg font-bold text-[#1D5A6C] pt-2">
              2. Data We Collect
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
              <li>
                <strong>Contact Information:</strong> Name, Email Address,
                Indian Mobile Number (+91) verified via SMS OTP.
              </li>
              <li>
                <strong>Academic Intent:</strong> Target Country, Target
                Discipline (MS, MBA, MBBS, Nursing, Ausbildung), Intake Year,
                and Academic Scores.
              </li>
              <li>
                <strong>Technical Identifiers:</strong> IP Address, browser
                type, device information, and session logs.
              </li>
            </ul>

            <h2 className="font-display text-lg font-bold text-[#1D5A6C] pt-2">
              3. Data Protection Officer (DPO)
            </h2>
            <p>
              In compliance with Section 19 of the DPDP Act 2023, our designated
              Data Protection Officer can be reached at:
              <br />
              <strong>Email:</strong> dpo@abroadroute.com
              <br />
              <strong>Entity:</strong> Dnyanal Educon Pvt. Ltd., Pune & Mumbai,
              Maharashtra, India.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
