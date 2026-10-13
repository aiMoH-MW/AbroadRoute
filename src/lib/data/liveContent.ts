import { supabase } from "@/lib/supabase/client";
import { supabaseAdmin } from "@/lib/supabase/server";
import { Country, University } from "@/types";
import {
  mapSupabaseCountry,
  mapSupabaseUniversity,
  UNIVERSITY_SELECT,
} from "./mappers";
import { withLiveExchangeRates } from "@/lib/exchangeRates";

// ============================================================
// Strict backend fetchers.
//
// Unlike fetchLiveCountries / fetchLiveUniversities in
// lib/supabase/dataFetchers, a Supabase failure here throws so
// the caller can render an error state; an empty table returns
// an empty list.
// ============================================================

function db() {
  return typeof window === "undefined" ? supabaseAdmin : supabase;
}

export async function fetchCountriesFromBackend(): Promise<Country[]> {
  const { data, error } = await db()
    .from("countries")
    .select("*")
    .eq("is_active", true);

  if (error) {
    throw new Error(`Supabase countries fetch failed: ${error.message}`);
  }

  const countries = (data || [])
    .map(mapSupabaseCountry)
    .filter((c: Country) => c.slug);

  // Live exchange rates; the stored rate stays as the fallback
  return withLiveExchangeRates(countries);
}

export async function fetchUniversitiesFromBackend(): Promise<University[]> {
  const [uniRes, cityRes] = await Promise.all([
    db().from("universities").select(UNIVERSITY_SELECT),
    db().from("cities").select("id, name"),
  ]);

  if (uniRes.error) {
    throw new Error(
      `Supabase universities fetch failed: ${uniRes.error.message}`,
    );
  }

  const cityNames = new Map<string, string>(
    (cityRes.data ?? []).map((c: any) => [String(c.id), c.name]),
  );
  return (uniRes.data || [])
    .map((u: any) => mapSupabaseUniversity(u, cityNames))
    .filter((u): u is University => u !== null);
}
