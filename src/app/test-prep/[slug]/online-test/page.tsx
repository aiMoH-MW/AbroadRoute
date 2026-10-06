import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { getTestPrepExamBySlug } from "@/lib/supabase/dataFetchers";
import { OnlineTestRegistration } from "@/components/test-prep/OnlineTestRegistration";
import { getTestSettings } from "@/lib/testPrep/settings";

// Rendered per request so admin changes in Test Module Settings apply immediately.
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const exam = await getTestPrepExamBySlug(slug);

  if (!exam) {
    return { title: "Exam Not Found | Abroadroute" };
  }

  return {
    title: `${exam.shortName} Online Mock Test | Abroadroute`,
    description: `Take a free ${exam.name} online mock test and get your results by email.`,
    robots: { index: false, follow: false },
  };
}

export default async function OnlineTestPage({ params }: Props) {
  const { slug } = await params;
  const exam = await getTestPrepExamBySlug(slug);

  if (!exam) {
    notFound();
  }

  const settings = await getTestSettings(exam.slug);

  return (
    <div className="min-h-screen bg-[#FDFCF7] flex flex-col">
      <header className="border-b border-[#D9CFB8]/60 bg-white/80 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="font-serif text-lg font-bold text-[#103B47]"
          >
            Abroadroute
          </Link>
          <span className="text-xs font-semibold text-slate-500">
            {exam.shortName} Online Test
          </span>
        </div>
      </header>

      <main className="flex-1 px-4 py-10 sm:px-6">
        {settings?.enabled ? (
          <OnlineTestRegistration
            exam={{
              slug: exam.slug,
              name: exam.name,
              shortName: exam.shortName,
              fullName: exam.fullName,
              targetCountry: exam.targetCountries[0],
              sections: exam.sections.map((s) => s.name),
              durationMinutes: settings.durationMinutes,
              questionCount: settings.questionsPerPaper,
              instructions: settings.instructions,
            }}
          />
        ) : (
          <div className="mx-auto max-w-xl rounded-3xl border border-[#D9CFB8]/80 bg-white p-8 text-center shadow-sm">
            <h1 className="font-serif text-xl font-bold text-[#103B47]">
              {exam.shortName} Online Test Unavailable
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              This test is not available right now. Please check back soon.
            </p>
            <Link
              href={`/test-prep/${exam.slug}`}
              className="mt-6 inline-flex min-h-[44px] items-center rounded-xl bg-[#D89A3E] px-5 py-2 text-sm font-bold text-slate-950"
            >
              Back to {exam.shortName} Guide
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
