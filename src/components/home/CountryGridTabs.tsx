"use client";

import { useState } from "react";

// Counts come from the rendered country list; omitted = label only
export function CountryGridTabs({
  allCount,
  anchorCount,
}: {
  allCount?: number;
  anchorCount?: number;
}) {
  const [activeTab, setActiveTab] = useState<string>("Anchor Six");

  const handleTab = (tab: string) => {
    setActiveTab(tab);
    const items = document.querySelectorAll<HTMLElement>("[data-country-tier]");
    items.forEach((item) => {
      const tier = item.getAttribute("data-country-tier");
      const isAnchor = item.getAttribute("data-is-anchor") === "true";
      if (tab === "All") {
        item.style.display = "";
      } else if (tab === "Anchor Six") {
        item.style.display = isAnchor ? "" : "none";
      } else {
        item.style.display = tier === tab ? "" : "none";
      }
    });
  };

  return (
    <div className="flex flex-wrap gap-1.5 rounded-full bg-[#D9CFB8]/40 p-1.5 border border-[#D9CFB8]/60">
      {(["Anchor Six", "All", "Tier 1", "Tier 2", "Tier 3"] as const).map(
        (tab) => (
          <button
            key={tab}
            onClick={() => handleTab(tab)}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
              activeTab === tab
                ? "bg-[#1D5A6C] text-white shadow-sm"
                : "text-[#103B47] hover:text-[#D89A3E]"
            }`}
          >
            {tab === "Anchor Six" && anchorCount
              ? `Anchor Six (${anchorCount})`
              : tab === "All" && allCount
                ? `All (${allCount})`
                : tab}
          </button>
        ),
      )}
    </div>
  );
}
