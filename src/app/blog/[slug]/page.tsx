import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getArticleBySlug, FALLBACK_ARTICLES } from "@/lib/sanity/fetchers";
import { fitMetaDescription } from "@/lib/seo/metaUtils";
import {
  Clock,
  Calendar,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { PortableText } from "@portabletext/react";

export async function generateStaticParams() {
  return FALLBACK_ARTICLES.map((article) => ({
    slug: article.slug,
  }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) return { title: "Post Not Found | Abroadroute" };

  const rawDescription = `${article.excerpt || article.title} Abroadroute blog for Indian students planning international education in 2026-2027.`;
  const formattedDesc = fitMetaDescription(rawDescription);

  return {
    title: `${article.title} | Abroadroute Blog`,
    description: formattedDesc,
    openGraph: {
      title: article.title,
      description: formattedDesc,
      type: "article",
    },
    alternates: {
      canonical: `/blog/${article.slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#FDFCF7] text-[#103B47] flex flex-col justify-between">
      <Header />

      {/* Breadcrumb navigation */}
      <div className="border-b border-[#D9CFB8]/60 bg-[#F5EFE0]/60 py-3">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 sm:px-6 lg:px-8 text-xs font-mono text-[#6B6B6B]">
          <Link href="/" className="hover:text-[#103B47] transition">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-[#D9CFB8]" />
          <Link href="/blog" className="hover:text-[#103B47] transition">
            Blog
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-[#D9CFB8]" />
          <span className="text-[#1D5A6C] font-bold truncate max-w-xs">
            {article.tag}
          </span>
        </div>
      </div>

      <main className="flex-1 mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 w-full">
        {/* Back Link */}
        <div className="mt-4">
          <Link
            href="/blog"
            className="min-h-[44px] inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#1D5A6C] hover:text-[#103B47] transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to All Articles
          </Link>
        </div>

        {/* Article Header */}
        <header className="mt-6 border-b border-[#D9CFB8]/60 pb-8">
          <div className="inline-flex items-center gap-2 rounded-md bg-[#F5EFE0] border border-[#D9CFB8] px-3 py-1 text-xs font-mono font-bold text-[#1D5A6C]">
            {article.tag}
          </div>

          <h1 className="mt-4 font-display text-3xl font-medium tracking-tight text-[#103B47] sm:text-4xl lg:text-5xl leading-tight">
            {article.title}
          </h1>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-mono text-[#6B6B6B]">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-[#1D5A6C]" />
              <span>{article.date}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-[#D89A3E]" />
              <span>{article.readTime}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5 text-[#1D5A6C] font-semibold font-sans">
              <CheckCircle2 className="h-4 w-4 text-[#1D5A6C]" />
              <span>Verified Admissions Intelligence</span>
            </div>
          </div>
        </header>

        {/* Article Body */}
        <article className="mt-8 max-w-none">
          <p className="text-lg sm:text-xl font-serif italic leading-relaxed text-[#103B47] bg-[#F5EFE0] p-6 rounded-2xl border border-[#D9CFB8]">
            {article.excerpt}
          </p>

          <div className="my-8 rounded-2xl border border-[#D9CFB8] bg-[#FDFCF7] p-6 shadow-xs">
            <h3 className="font-display font-medium text-base sm:text-lg text-[#103B47] flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#D89A3E]" />
              <span>Official Admissions & Regulatory Context</span>
            </h3>
            <p className="mt-2 text-xs sm:text-[13px] text-[#6B6B6B] leading-relaxed font-sans">
              This guide has been verified against official admissions portals,
              embassy guidelines, and university catalogs by the international
              education team at Dnyanal Educon Pvt. Ltd.
            </p>
          </div>

          {article.body &&
          Array.isArray(article.body) &&
          article.body.length > 0 ? (
            <div className="space-y-6 text-base sm:text-lg leading-relaxed text-[#1A1A1A] font-sans">
              <PortableText value={article.body as any} />
            </div>
          ) : (
            <div className="space-y-6 text-base sm:text-lg leading-relaxed text-[#1A1A1A] font-sans">
              <p>
                When planning an international educational journey,
                understanding the exact eligibility criteria, living expense
                structures, and immigration regulations is paramount for Indian
                students and families.
              </p>
              <p>
                Tuition costs, currency fluctuations, and embassy processing
                timelines require advance preparation. We advise students to
                start the verification process at least 6 to 9 months prior to
                university application deadlines.
              </p>
            </div>
          )}

          {/* Section 17 · Horizon Mark Signature */}
          <div className="horizon-mark large my-10">
            <div className="line"></div>
            <span className="star-glyph">✦</span>
            <div className="line"></div>
          </div>

          {/* Author Card if present */}
          {article.author && (
            <div className="mt-8 flex items-center gap-4 rounded-2xl border border-[#D9CFB8] bg-white p-5 not-prose shadow-xs">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#103B47] text-[#FDFCF7] font-mono font-bold text-sm">
                {article.author.name.charAt(0)}
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#D89A3E]">
                  Author & Admissions Strategist
                </span>
                <h4 className="text-base font-display font-medium text-[#103B47]">
                  {article.author.name}
                </h4>
                <p className="text-xs text-[#6B6B6B] font-sans">
                  {article.author.role || "Admissions Strategist"}
                </p>
                {article.author.bio && (
                  <p className="mt-1 text-xs text-[#6B6B6B] leading-relaxed font-sans">
                    {article.author.bio}
                  </p>
                )}
              </div>
            </div>
          )}
        </article>

        {/* Lead Capture Callout */}
        <div className="mt-12 rounded-3xl bg-gradient-to-br from-[#103B47] via-[#1D5A6C] to-[#0B2830] p-8 text-[#FDFCF7] shadow-xl border border-[#1D5A6C]">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#EBC783]">
                Free Admissions Assistance
              </span>
              <h3 className="mt-2 text-2xl sm:text-3xl font-display font-medium text-white">
                Need Help Shortlisting Universities for This Program?
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-[#A8CDBD] max-w-xl font-sans">
                Get a personalized list of 5 accredited universities matching
                your academic profile and budget in{" "}
                <span className="font-mono text-white font-semibold">
                  ₹ Lakhs
                </span>
                .
              </p>
            </div>
            <Link
              href="/#destinations-grid"
              className="min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl bg-[#D89A3E] px-6 py-3.5 text-xs sm:text-sm font-sans font-semibold text-[#103B47] shadow-lg hover:bg-[#EBC783] transition shrink-0 cursor-pointer"
            >
              <span>Explore Universities</span>{" "}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
