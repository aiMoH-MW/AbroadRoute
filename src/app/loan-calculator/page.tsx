import { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LoanCalculatorClient } from "@/components/tools/LoanCalculatorClient";

export const metadata: Metadata = {
  title: "Study Abroad Education Loan & EMI Calculator | AbroadRoute",
  description:
    "Calculate your study abroad education loan EMI in INR, including interest during the course and grace period, and compare education loan lenders.",
  alternates: {
    canonical: "/loan-calculator",
  },
};

export default function LoanCalculatorPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FDFCF7]">
      <Header />
      <main className="flex-1">
        <LoanCalculatorClient />
      </main>
      <Footer />
    </div>
  );
}
