import { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Terms of Service | Platform Usage Guidelines | AbroadRoute",
  description:
    "Official terms of service for AbroadRoute (a brand by Dnyanal Educon Pvt. Ltd.). Review platform usage rules, student portal guidelines, B2B marketplace terms, and compliance standards.",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#FDFCF7] flex flex-col justify-between">
      <Header />
      <main className="flex-1 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-[#D9CFB8]/60 bg-white p-8 sm:p-12 shadow-xs space-y-6 text-[#1A1A1A] text-sm leading-relaxed">
            <div className="border-b border-[#D9CFB8]/40 pb-6">
              <h1 className="font-display text-3xl font-bold text-[#1D5A6C] sm:text-4xl">
                Terms of Service
              </h1>
              <p className="mt-1 text-xs text-slate-500">
                Effective Date: September 2026 | AbroadRoute · Dnyanal Educon
                Pvt. Ltd.
              </p>
            </div>

            <h2 className="font-display text-lg font-bold text-[#1D5A6C] pt-2">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using AbroadRoute, a brand by Dnyanal Educon Pvt.
              Ltd. (Founder Director: Nikhita Pradeep Deshmukh), you agree to be
              bound by these Terms of Service.
            </p>

            <h2 className="font-display text-lg font-bold text-[#1D5A6C] pt-2">
              2. Educational Discovery & Advice Disclaimer
            </h2>
            <p>
              AbroadRoute provides discovery tools, rankings, tuition
              calculators, and ✦ Route AI counseling assistance for
              informational purposes. Admission cutoffs, currency exchange
              rates, and visa regulations are subject to change by respective
              universities and foreign governments.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
