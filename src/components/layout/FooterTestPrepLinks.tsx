"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchTestPrepExams } from "@/lib/supabase/dataFetchers";
import type { TestPrepExam } from "@/types";

/**
 * Exam links for the footer, loaded from Supabase in the browser. A client
 * component because Footer is also rendered inside client pages, where an
 * async server component cannot be used.
 */
export function FooterTestPrepLinks() {
  const [exams, setExams] = useState<TestPrepExam[]>([]);

  useEffect(() => {
    let active = true;
    fetchTestPrepExams().then((list) => active && setExams(list));
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      {exams.map((exam) => (
        <li key={exam.id}>
          <Link
            href={`/test-prep/${exam.slug}`}
            className="text-slate-400 hover:text-white transition"
          >
            {exam.name}
          </Link>
        </li>
      ))}
    </>
  );
}
