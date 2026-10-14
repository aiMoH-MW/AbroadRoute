import { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CostCalculatorWidget } from "@/components/home/CostCalculatorWidget";

export const metadata: Metadata = {
  title:
    "Study Abroad Cost of Living & Tuition Calculator (INR) | AbroadRoute",
  description:
    "Calculate total study abroad expenses in INR. Compare tuition, accommodation, food, transport and other living costs by university, program and city for Indian students.",
};

export default function CostCalculatorPage() {
  return (
    <div className="min-h-screen bg-[#FDFCF7] flex flex-col justify-between">
      <Header />
      <main className="flex-1 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8 text-center">
          <h1 className="font-serif text-4xl font-extrabold text-[#103B47] sm:text-5xl">
            Study Abroad Cost of Living & Tuition Calculator
          </h1>
          <p className="mt-3 text-sm text-[#6B6B6B] max-w-2xl mx-auto">
            Calculate tuition and living costs for your chosen university,
            program and city, converted directly into INR Lakhs.
          </p>
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
          <CostCalculatorWidget />
        </div>
      </main>
      <Footer />
    </div>
  );
}
