import { Metadata } from "next";
import { fitMetaDescription } from "@/lib/seo/metaUtils";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CompareNavHeader } from "@/components/tools/CompareNavHeader";
import { UniversityCompareClient } from "@/components/tools/UniversityCompareClient";

export const metadata: Metadata = {
  title:
    "Compare Universities Side-by-Side (QS Rank, INR Fees & Visas) | AbroadRoute",
  description: fitMetaDescription(
    "Compare up to 5 global universities side-by-side. Analyze QS world rankings, annual tuition fees in INR, minimum IELTS cutoffs, GRE waivers, and post-study work visa rights.",
  ),
  alternates: {
    canonical: "https://abroadroute.com/compare/universities",
  },
};

export default function UniversityComparePage() {
  return (
    <div className="flex min-h-screen flex-col justify-between bg-[#FDFCF7]">
      <Header />
      <main className="flex-1">
        <CompareNavHeader activeTab="universities" />
        <UniversityCompareClient />
      </main>
      <Footer />
    </div>
  );
}
