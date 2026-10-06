"use client";

import { useEffect, useState } from "react";
import { SlidersHorizontal, Wand2 } from "lucide-react";
import { Program } from "@/types";
import { AdminTestSettingsTab } from "@/components/admin/AdminTestSettingsTab";
import { AdminQuestionExtractionTab } from "@/components/admin/AdminQuestionExtractionTab";

export type TestModuleSection = "settings" | "qa";

interface Props {
  programsList: Program[];
  initialSection?: TestModuleSection;
}

const SECTIONS: { id: TestModuleSection; label: string; icon: typeof Wand2 }[] = [
  { id: "settings", label: "Exam Settings", icon: SlidersHorizontal },
  { id: "qa", label: "Q&A Extraction", icon: Wand2 },
];

/**
 * Test Module admin: per-exam mock test settings plus the Q&A bank the
 * mock tests draw from (extracted from Study Data).
 */
export function AdminTestModuleTab({ programsList, initialSection = "settings" }: Props) {
  const [section, setSection] = useState<TestModuleSection>(initialSection);

  useEffect(() => {
    setSection(initialSection);
  }, [initialSection]);

  const changeSection = (next: TestModuleSection) => {
    setSection(next);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", "test-settings");
    url.searchParams.set("section", next);
    window.history.replaceState(null, "", `${url.pathname}${url.search}`);
  };

  return (
    <div className="space-y-6">
      <div className="inline-flex rounded-2xl border border-slate-200 bg-white p-1 shadow-xs">
        {SECTIONS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => changeSection(id)}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition ${
              section === id ? "bg-[#102C57] text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {section === "settings" ? (
        <AdminTestSettingsTab />
      ) : (
        <AdminQuestionExtractionTab programsList={programsList} />
      )}
    </div>
  );
}
