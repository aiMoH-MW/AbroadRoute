import { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ScholarshipFinderClient } from "@/components/tools/ScholarshipFinderClient";

export const metadata: Metadata = {
  title:
    "Study Abroad Scholarships for Indian Students (2026-2027) | AbroadRoute",
  description:
    "Explore fully funded study abroad scholarships open to Indian students (DAAD, Chevening, Fulbright-Nehru, Erasmus Mundus, Women in STEM) with award values, deadlines and application help.",
  alternates: {
    canonical: "/scholarships",
  },
};

export default function ScholarshipsPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50">
      <Header />
      <main className="flex-1">
        <ScholarshipFinderClient />
      </main>
      <Footer />
    </div>
  );
}
