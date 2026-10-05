import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { TEST_PREP_EXAMS } from "@/lib/data/testPrepData";
import { OnlineTestRegistration } from "@/components/test-prep/OnlineTestRegistration";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return TEST_PREP_EXAMS.map((exam) => ({
    slug: exam.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const exam = TEST_PREP_EXAMS.find(
    (e) => e.slug.toLowerCase() === slug.toLowerCase(),
  );

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
  const exam = TEST_PREP_EXAMS.find(
    (e) => e.slug.toLowerCase() === slug.toLowerCase(),
  );

  if (!exam) {
    notFound();
  }

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
        <OnlineTestRegistration
          exam={{
            slug: exam.slug,
            name: exam.name,
            shortName: exam.shortName,
            fullName: exam.fullName,
            targetCountry: exam.targetCountries[0],
            sections: exam.sections.map((s) => s.name),
          }}
        />
      </main>
    </div>
  );
}
