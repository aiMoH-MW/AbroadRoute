import { Metadata } from "next";
import { fitMetaDescription } from "@/lib/seo/metaUtils";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CompareNavHeader } from "@/components/tools/CompareNavHeader";
import { CourseCompareClient } from "@/components/tools/CourseCompareClient";

export const metadata: Metadata = {
  title:
    "Compare Courses & Degrees Side-by-Side (Syllabus, Fees, IELTS & ROI) | AbroadRoute",
  description: fitMetaDescription(
    "Compare international degree programs and courses side-by-side. Evaluate syllabus modules, tuition fees in INR, IELTS cutoff scores, post-study work permit durations, and ROI ratings.",
  ),
  alternates: {
    canonical: "https://abroadroute.com/compare/courses",
  },
};

export default function CourseComparePage() {
  return (
    <div className="flex min-h-screen flex-col justify-between bg-[#FDFCF7]">
      <Header />
      <main className="flex-1">
        <CompareNavHeader activeTab="courses" />
        <CourseCompareClient />
      </main>
      <Footer />
    </div>
  );
}
