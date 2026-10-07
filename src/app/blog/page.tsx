import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getAllArticles } from "@/lib/sanity/fetchers";
import {
  Clock,
  Calendar,
  ArrowRight,
  BookOpen,
  Compass,
  ShieldCheck,
} from "lucide-react";

export const metadata = {
  title: "Study Abroad Blog & Admissions News | Abroadroute",
  description:
    "Official Abroadroute blog: authentic visa rule updates, country comparisons, scholarship alerts, and student success stories for international degrees.",
};

export default async function BlogDirectoryPage() {
  const articles = await getAllArticles();

  return (
    <div className="min-h-screen bg-[#FDFCF7] text-[#103B47] flex flex-col justify-between">
      <Header />

      <main className="flex-1 pb-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-[#103B47] via-[#103B47] to-[#0B2830] text-[#FDFCF7] py-16 sm:py-20 border-b border-[#1D5A6C]/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#D9CFB8]/40 bg-[#F5EFE0]/10 px-3.5 py-1 text-xs font-semibold text-[#A8CDBD]">
                <BookOpen className="h-3.5 w-3.5 text-[#D89A3E]" />
                <span>Official Abroadroute Admissions Journal</span>
              </div>
              <h1 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-white leading-tight">
                Admissions News, Insights &{" "}
                <span className="text-[#EBC783]">Visa Updates</span>
              </h1>
              <p className="mt-3 font-sans text-xs sm:text-sm md:text-base text-[#A8CDBD] leading-relaxed max-w-2xl font-normal">
                Real-time regulatory analyses, blocked account cost changes in{" "}
                <span className="font-mono font-semibold text-white">
                  ₹ Lakhs
                </span>
                , and strategy breakdowns compiled by Dnyanal Educon
                counsellors.
              </p>
            </div>
          </div>
        </section>

        {/* Directory Grid */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12">
          {/* Section Heading & Stats */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D9CFB8]/60 pb-5">
            <div>
              <h2 className="text-xl sm:text-2xl font-display font-medium text-[#103B47]">
                Latest Blog Posts & Guides ({articles.length})
              </h2>
              <p className="text-xs text-[#6B6B6B] mt-0.5 font-sans">
                Published via Sanity Content Lake. Live regulatory updates for
                2027 intake applicants.
              </p>
            </div>
            <Link
              href="/studio"
              className="min-h-[44px] inline-flex items-center gap-1.5 rounded-xl border border-[#1D5A6C] bg-white px-4 py-2 text-xs font-sans font-semibold text-[#1D5A6C] hover:bg-[#1D5A6C] hover:text-[#F5EFE0] transition shadow-xs self-start sm:self-auto"
            >
              Author Studio →
            </Link>
          </div>

          {/* Cards Grid */}
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <div
                key={article._id}
                className="flex flex-col justify-between rounded-2xl border border-[#D9CFB8] bg-white p-6 sm:p-7 shadow-xs hover:shadow-md hover:border-[#1D5A6C] transition group"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-[#6B6B6B]">
                    <span className="font-mono font-bold text-[#1D5A6C] bg-[#F5EFE0] border border-[#D9CFB8] px-2.5 py-0.5 rounded-md text-[11px]">
                      {article.tag}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-mono text-[#6B6B6B]">
                      <Clock className="h-3 w-3 text-[#D89A3E]" />
                      {article.readTime}
                    </span>
                  </div>

                  <Link href={`/blog/${article.slug}`}>
                    <h3 className="mt-4 font-display text-lg sm:text-xl font-medium leading-snug text-[#103B47] group-hover:text-[#D89A3E] transition">
                      {article.title}
                    </h3>
                  </Link>

                  <p className="mt-2.5 text-xs sm:text-[13px] leading-relaxed text-[#3A3A3A] font-sans font-normal line-clamp-3">
                    {article.excerpt}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-[#D9CFB8]/60 pt-4 text-xs text-[#6B6B6B]">
                  <span className="text-[11px] font-mono flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-[#1D5A6C]" />
                    {article.date}
                  </span>

                  <Link
                    href={`/blog/${article.slug}`}
                    className="min-h-[44px] font-sans font-semibold text-[#1D5A6C] group-hover:text-[#D89A3E] inline-flex items-center gap-1 text-xs transition"
                  >
                    Read Article <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
