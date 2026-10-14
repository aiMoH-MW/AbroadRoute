import { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ROICalculatorClient } from "@/components/tools/ROICalculatorClient";

export const metadata: Metadata = {
  title: "Executive MBA (EMBA) ROI & Career Gain Calculator | AbroadRoute",
  description:
    "Calculate your post-EMBA salary leap, break-even payback period in years, and 10-year cumulative career wealth gain across top international business schools.",
  alternates: {
    canonical: "/roi-calculator",
  },
};

export default function ROICalculatorPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FDFCF7]">
      <Header />
      <main className="flex-1">
        <ROICalculatorClient />
      </main>
      <Footer />
    </div>
  );
}
