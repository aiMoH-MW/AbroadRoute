import { EXCHANGE_RATE_SOURCE } from "@/lib/exchangeRates";

interface ExchangeRateCreditProps {
  updatedAt?: string; // Country.exchangeRateUpdatedAt; absent = stored rate
  className?: string;
}

/**
 * "Live rates by ExchangeRate-API · updated 7 Oct 2026". The attribution link
 * is required by the free API's terms wherever its rates are shown.
 * Renders nothing when the rate is the stored fallback.
 */
export function ExchangeRateCredit({
  updatedAt,
  className = "",
}: ExchangeRateCreditProps) {
  if (!updatedAt) return null;
  const date = new Date(updatedAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return (
    <span className={className}>
      Live rates by{" "}
      <a
        href={EXCHANGE_RATE_SOURCE.url}
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:no-underline"
      >
        {EXCHANGE_RATE_SOURCE.name}
      </a>{" "}
      · updated {date}
    </span>
  );
}
