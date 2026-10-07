"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CountryFlag } from "@/components/ui/CountryFlag";
import {
  fetchLiveCountries,
  fetchLivePrograms,
} from "@/lib/supabase/dataFetchers";
import type { Country, Program } from "@/types";

const MAX_DESTINATIONS = 8;
const TIER_ORDER: Record<string, number> = {
  "Tier 1": 0,
  "Tier 2": 1,
  "Tier 3": 2,
};

// Shared per page load so the link lists and the counts make one request each.
let countriesPromise: Promise<Country[]> | null = null;
let programsPromise: Promise<Program[]> | null = null;

function loadCountries() {
  countriesPromise ??= fetchLiveCountries();
  return countriesPromise;
}

function loadPrograms() {
  programsPromise ??= fetchLivePrograms();
  return programsPromise;
}

function useLoaded<T>(load: () => Promise<T[]>): T[] {
  const [items, setItems] = useState<T[]>([]);

  useEffect(() => {
    let active = true;
    load().then((list) => active && setItems(list));
    return () => {
      active = false;
    };
  }, [load]);

  return items;
}

/**
 * Destination and program links for the footer, loaded from Supabase in the
 * browser. Client components for the same reason as FooterTestPrepLinks:
 * Footer is also rendered inside client pages.
 */
export function FooterDestinationLinks() {
  const countries = useLoaded(loadCountries);
  const shown = [...countries]
    .sort((a, b) => (TIER_ORDER[a.tier] ?? 9) - (TIER_ORDER[b.tier] ?? 9))
    .slice(0, MAX_DESTINATIONS);

  return (
    <>
      {shown.map((country) => (
        <li key={country.id}>
          <Link
            href={`/study-in-${country.slug}`}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition"
          >
            <CountryFlag code={country.code} name={country.name} size="sm" />
            <span>Study in {country.name}</span>
          </Link>
        </li>
      ))}
    </>
  );
}

export function FooterProgramLinks() {
  const programs = useLoaded(loadPrograms);

  return (
    <>
      {programs.map((program) => (
        <li key={program.id}>
          <Link
            href={`/programs/${program.slug}`}
            className="text-slate-400 hover:text-white transition"
          >
            {program.name}
          </Link>
        </li>
      ))}
    </>
  );
}

/**
 * Live count of destinations or programs followed by a label, e.g.
 * "19 destinations". Renders just the label until the data has loaded.
 */
export function FooterCatalogCount({
  of,
  label,
}: {
  of: "destinations" | "programs";
  label: string;
}) {
  const items = useLoaded<unknown>(
    of === "destinations" ? loadCountries : loadPrograms,
  );

  return <>{items.length > 0 ? `${items.length} ${label}` : label}</>;
}
