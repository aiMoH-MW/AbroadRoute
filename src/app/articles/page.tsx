import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getAllArticles } from "@/lib/sanity/fetchers";
import { Clock, Calendar, ArrowRight, BookOpen, Compass, ShieldCheck, Search } from "lucide-react";
import { show } from "@/components/tools/NotProvided";
import { fetchSiteStats, withCount } from "@/lib/siteStats";


export const metadata = {
  title: "Study Abroad Guides & Visa Updates (2026-2027) | Abroadroute",
  description:
    "Comprehensive admissions guides, country pillar overviews, visa regulations, and scholarship checklists written for Indian students planning study abroad.",
};

export default async function ArticlesDirectoryPage() {
  const [articles, stats] = await Promise.all([
    getAllArticles(),
    fetchSiteStats(),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <Header />

      <main className="flex-1 pb-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-[#102C57] via-[#0D2346] to-[#091A36] text-white py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1 text-xs font-semibold text-slate-200">
                <BookOpen className="h-3.5 w-3.5 text-[#EA5C2B]" />
                Admissions Intelligence & Research
              </div>
              <h1 className="mt-4 font-serif text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                Study Abroad Guides & <span className="text-[#EA5C2B]">Visa Updates</span>
              </h1>
              <p className="mt-3 text-sm text-slate-300 leading-relaxed max-w-2xl">
                Authoritative, research-backed admissions checklists, living cost analyses in ₹ Lakhs, and embassy regulations written by international education strategists.
              </p>
            </div>
          </div>
        </section>

        {/* Directory Grid */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12">
          {/* Section Heading & Stats */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <h2 className="text-xl font-bold text-[#102C57]">
                All Published Guides ({articles.length})
              </h2>
              <p className="text-xs text-slate-500">
                Sorted by newest publication date. Constantly updated with 2027 intake guidelines.
              </p>
            </div>
            <Link
              href="/studio"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition shadow-xs self-start sm:self-auto"
            >
              Author Studio →
            </Link>
          </div>

          {/* Cards Grid */}
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <div
                key={article._id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:shadow-md hover:border-slate-300 transition group"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-bold text-[#EA5C2B] bg-[#EA5C2B]/10 px-2.5 py-0.5 rounded-full text-[11px]">
                      {article.tag}
                    </span>
                    <span className="flex items-center gap-1 text-[11px]">
                      <Clock className="h-3 w-3 text-slate-400" />
                      {show(article.readTime)}
                    </span>
                  </div>

                  <Link href={`/articles/${article.slug}`}>
                    <h3 className="mt-4 text-base font-bold leading-snug text-[#102C57] group-hover:text-[#EA5C2B] transition">
                      {article.title}
                    </h3>
                  </Link>

                  <p className="mt-2.5 text-xs leading-relaxed text-slate-600 line-clamp-3">
                    {article.excerpt}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
                  <span className="text-[11px] flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-slate-400" />
                    {show(article.date)}
                  </span>

                  <Link
                    href={`/articles/${article.slug}`}
                    className="font-bold text-[#102C57] group-hover:text-[#EA5C2B] inline-flex items-center gap-1 text-xs transition"
                  >
                    Read Guide <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Free Counselling Bottom Banner */}
          <div className="mt-16 rounded-3xl bg-white border border-slate-200 p-8 sm:p-10 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#EA5C2B]">
                Personalized Roadmap
              </span>
              <h3 className="mt-1 text-xl sm:text-2xl font-black text-[#102C57]">
                Not sure which country or university fits your budget?
              </h3>
              <p className="mt-1.5 text-xs text-slate-600 max-w-xl leading-relaxed">
                Connect with an admissions strategist for verified 2027 intake options, visa probability, and INR cost calculations.
              </p>
            </div>
            <Link
              href="/#destinations-grid"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#EA5C2B] px-6 py-3.5 text-xs font-bold text-white shadow-md hover:bg-[#ff7240] transition shrink-0"
            >
              Explore {withCount(stats.countries, "Destinations")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
