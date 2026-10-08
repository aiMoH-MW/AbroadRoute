import type { Country } from "@/types";

// Live currency rates from ExchangeRate-API's free open-access endpoint
// (no API key; rates refresh once a day). Their terms require a visible
// attribution link wherever the rates are shown: see EXCHANGE_RATE_SOURCE.
// https://www.exchangerate-api.com/docs/free

const RATES_URL = "https://open.er-api.com/v6/latest/INR";
const CACHE_MS = 6 * 60 * 60 * 1000; // upstream updates daily; 6h keeps us well within limits
const TIMEOUT_MS = 3000;

export const EXCHANGE_RATE_SOURCE = {
  name: "ExchangeRate-API",
  url: "https://www.exchangerate-api.com",
};

export interface LiveExchangeRates {
  // INR for one unit of each currency, e.g. { USD: 96.47, EUR: 108.46 }
  inrPerUnit: Record<string, number>;
  updatedAt: string; // ISO time the upstream rates were published
}

let cache: { value: LiveExchangeRates; fetchedAt: number } | null = null;

/** Live INR rates, cached in memory; null if the API is unavailable. */
export async function getLiveExchangeRates(): Promise<LiveExchangeRates | null> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_MS) return cache.value;

  try {
    const res = await fetch(RATES_URL, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      next: { revalidate: CACHE_MS / 1000 },
    } as RequestInit);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.result !== "success" || !json.rates) {
      throw new Error(json["error-type"] || "Unexpected response");
    }

    // The API gives units of each currency per 1 INR; invert to INR per unit
    const inrPerUnit: Record<string, number> = {};
    for (const [code, perINR] of Object.entries(json.rates)) {
      const value = Number(perINR);
      if (value > 0) inrPerUnit[code] = Number((1 / value).toPrecision(6));
    }

    const value: LiveExchangeRates = {
      inrPerUnit,
      updatedAt: new Date(json.time_last_update_unix * 1000).toISOString(),
    };
    cache = { value, fetchedAt: Date.now() };
    return value;
  } catch (err) {
    console.warn("Live exchange rates unavailable:", err);
    return cache?.value ?? null; // keep serving the last good rates
  }
}

/**
 * Countries with exchangeRateToINR replaced by the live rate for their
 * currency. Countries whose currency has no live rate (or when the API is
 * down) keep the rate stored in the database.
 */
export async function withLiveExchangeRates(
  countries: Country[],
): Promise<Country[]> {
  if (countries.length === 0) return countries;
  const live = await getLiveExchangeRates();
  if (!live) return countries;
  return countries.map((c) => {
    const rate = live.inrPerUnit[c.currency?.toUpperCase()];
    return rate
      ? { ...c, exchangeRateToINR: rate, exchangeRateUpdatedAt: live.updatedAt }
      : c;
  });
}

/** Display form of an INR rate: 2 decimals from ₹1 up, 3 significant digits below. */
export function formatINRRate(rate: number): string {
  if (!Number.isFinite(rate)) return "—";
  return rate >= 1
    ? rate.toLocaleString("en-IN", { maximumFractionDigits: 2 })
    : String(Number(rate.toPrecision(3)));
}
