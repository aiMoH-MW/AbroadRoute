import { supabase } from "@/lib/supabase/client";
import { supabaseAdmin } from "@/lib/supabase/server";
import { Country, University } from "@/types";
import {
  getSanityCountries,
  getSanityUniversities,
} from "@/lib/sanity/fetchers";
import {
  mapSupabaseCountry,
  mapSanityCountry,
  mapSupabaseUniversity,
  mapSanityUniversity,
} from "./mappers";
import { withLiveExchangeRates } from "@/lib/exchangeRates";

// ============================================================
// Strict backend fetchers.
//
// Unlike fetchLiveCountries / fetchLiveUniversities in
// lib/supabase/dataFetchers, these never substitute masterData.
// A Supabase failure throws so the caller can render an error
// state; an empty table returns an empty list. Sanity is treated
// as a supplementary source, so its failures are logged, not
// thrown — losing CMS overrides should not blank the page when
// Supabase answered fine.
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

  const bySlug = new Map<string, Country>();
  (data || []).forEach((row: any) => {
    const country = mapSupabaseCountry(row);
    if (country.slug) bySlug.set(country.slug, country);
  });

  // Sanity overrides win over Supabase for matching slugs.
  try {
    const sanityCountries = await getSanityCountries();
    (sanityCountries || []).forEach((sc: any) => {
      const mapped = mapSanityCountry(sc);
      if (mapped) bySlug.set(mapped.slug, mapped);
    });
  } catch (err) {
    console.warn("Sanity countries unavailable, using Supabase only:", err);
  }

  // Live exchange rates; the stored rate stays as the fallback
  return withLiveExchangeRates(Array.from(bySlug.values()));
}

export async function fetchUniversitiesFromBackend(): Promise<University[]> {
  const { data, error } = await db().from("universities").select("*");

  if (error) {
    throw new Error(`Supabase universities fetch failed: ${error.message}`);
  }

  const bySlug = new Map<string, University>();
  (data || []).forEach((row: any) => {
    const uni = mapSupabaseUniversity(row);
    if (uni) bySlug.set(uni.slug, uni);
  });

  try {
    const sanityUnis = await getSanityUniversities();
    (sanityUnis || []).forEach((su: any) => {
      const mapped = mapSanityUniversity(su);
      if (mapped) bySlug.set(mapped.slug, mapped);
    });
  } catch (err) {
    console.warn("Sanity universities unavailable, using Supabase only:", err);
  }

  return Array.from(bySlug.values());
}
