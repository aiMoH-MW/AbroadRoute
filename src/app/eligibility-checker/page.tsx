import { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { EligibilityCheckerClient } from "@/components/tools/EligibilityCheckerClient";

export const metadata: Metadata = {
  title: "Study Abroad Admission Eligibility Checker | Abroadroute",
  description:
    "Check your eligibility for universities abroad using your percentage or CGPA, IELTS, TOEFL, PTE or Duolingo score, GRE, backlogs and NEET. See strong, possible and ambitious matches and what is missing.",
  alternates: {
    canonical: "/eligibility-checker",
  },
};

export default function EligibilityCheckerPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FDFCF7]">
      <Header />
      <main className="flex-1">
        <EligibilityCheckerClient />
      </main>
      <Footer />
    </div>
  );
}
