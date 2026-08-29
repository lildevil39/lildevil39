import type { Currency } from "@nivora/shared";

/** TND has 3 minor units (millimes); EUR has 2 — see docs-seed-data.md. */
const MINOR_UNITS: Record<Currency, number> = { TND: 3, EUR: 2 };

export function formatMoney(amountMinorUnits: number, currency: Currency, locale = "fr-TN"): string {
  const divisor = 10 ** MINOR_UNITS[currency];
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: currency === "TND" ? 3 : 2,
  }).format(amountMinorUnits / divisor);
}
