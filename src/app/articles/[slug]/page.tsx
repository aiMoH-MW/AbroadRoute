import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getArticleBySlug, getAllArticles } from "@/lib/sanity/fetchers";
import { show } from "@/components/tools/NotProvided";
import { fitMetaDescription } from "@/lib/seo/metaUtils";
import {
  Clock,
  Calendar,
  ArrowLeft,
  ArrowRight,
  Bot,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { PortableText } from "@portabletext/react";

export async function generateStaticParams() {
  const articles = await getAllArticles();
  return articles.map((article) => ({
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

  if (!article) return { title: "Article Not Found | AbroadRoute" };

  const rawDescription = `${article.excerpt || article.title} AbroadRoute guide for Indian students planning international education in 2026-2027.`;
  const formattedDesc = fitMetaDescription(rawDescription);

  return {
    title: `${article.title} | AbroadRoute Guides`,
    description: formattedDesc,
    openGraph: {
      title: article.title,
      description: formattedDesc,
      type: "article",
    },
    alternates: {
      canonical: `/articles/${article.slug}`,
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between">
      <Header />

      {/* Breadcrumb navigation */}
      <div className="border-b border-slate-200/80 bg-white py-2.5">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 sm:px-6 lg:px-8 text-xs font-semibold text-slate-500">
          <Link href="/" className="hover:text-[#102C57]">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <Link href="/articles" className="hover:text-[#102C57]">
            Guides & Updates
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-[#EA5C2B] font-bold truncate max-w-xs">
            {article.tag}
          </span>
        </div>
      </div>

      <main className="flex-1 mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 w-full">
        {/* Back Link */}
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#102C57] transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
          </Link>
        </div>

        {/* Header Header */}
        <header className="mt-6 border-b border-slate-200 pb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#EA5C2B]/10 px-3 py-1 text-xs font-bold text-[#EA5C2B]">
            {article.tag}
          </div>

          <h1 className="mt-4 font-serif text-3xl font-extrabold tracking-tight text-[#102C57] sm:text-4xl lg:text-5xl leading-tight">
            {article.title}
          </h1>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span>{show(article.date)}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-slate-400" />
              <span>{show(article.readTime)}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <CheckCircle2 className="h-4 w-4" />
              <span>Verified Admissions Research</span>
            </div>
          </div>
        </header>

        {/* Article Body */}
        <article className="prose prose-slate mt-8 max-w-none">
          <p className="text-lg font-medium leading-relaxed text-slate-700">
            {article.excerpt}
          </p>

          <div className="my-8 rounded-2xl border border-slate-200 bg-slate-50/70 p-6">
            <h3 className="font-bold text-sm text-[#102C57] flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#EA5C2B]" />
              Official Admissions & Regulatory Context
            </h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              This guide has been verified against official admissions portals,
              embassy guidelines, and university catalogs by the international
              education team at Dnyanal Educon Pvt. Ltd.
            </p>
          </div>

          {article.body &&
          Array.isArray(article.body) &&
          article.body.length > 0 ? (
            <div className="space-y-6 text-sm leading-relaxed text-slate-700">
              <PortableText value={article.body as any} />
            </div>
          ) : (
            <p className="text-sm text-slate-500">{show(null)}</p>
          )}

          {/* Author Card if present */}
          {article.author && (
            <div className="mt-10 flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-5 not-prose">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#102C57] text-white font-bold text-sm">
                {article.author.name.charAt(0)}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#EA5C2B]">
                  Article Author & Strategist
                </span>
                <h4 className="text-sm font-bold text-[#102C57]">
                  {article.author.name}
                </h4>
                <p className="text-xs text-slate-500">
                  {show(article.author.role)}
                </p>
                {article.author.bio && (
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                    {article.author.bio}
                  </p>
                )}
              </div>
            </div>
          )}
        </article>

        {/* Lead Capture Callout */}
        <div className="mt-12 rounded-3xl bg-gradient-to-r from-[#102C57] via-[#1a3d73] to-[#091A36] p-8 text-white shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                Free Admissions Assistance
              </span>
              <h3 className="mt-2 text-xl font-bold">
                Need Help Shortlisting Universities for This Program?
              </h3>
              <p className="mt-1 text-xs text-slate-300">
                Get a personalized list of 5 accredited universities matching
                your academic profile and budget in ₹ Lakhs.
              </p>
            </div>
            <Link
              href="/#destinations-grid"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#EA5C2B] px-6 py-3.5 text-xs font-bold text-white shadow-lg hover:bg-[#ff7240] transition shrink-0"
            >
              Explore Universities <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
