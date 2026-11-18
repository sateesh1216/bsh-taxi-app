import { fixedPriceSlugs, outstationPrices, perKmRates, type VehicleOption } from "../data/site";

export type Pricing = { mode: "fixed"; price: number } | { mode: "perKm"; rate: number; label: string };

export const getPricingMode = (slug: string) => (fixedPriceSlugs.includes(slug) ? "fixed" : "perKm");

/** Same rules as the website: fixed round-trip price for listed routes, otherwise a per-km rate. */
export function getOutstationPricing(slug: string, vehicleSlug: string): Pricing {
  if (getPricingMode(slug) === "fixed") return { mode: "fixed", price: outstationPrices[slug]?.[vehicleSlug] ?? 0 };
  const rate = perKmRates[vehicleSlug] ?? 0;
  return { mode: "perKm", rate, label: `₹${rate}/km` };
}

/** Rough round-trip estimate from distance (website formula). */
export function calculateOutstationFare(distanceKm: number, v: VehicleOption): number {
  const raw = distanceKm * 2 * v.extraKmRate;
  return Math.max(Math.ceil(raw / 100) * 100, v.basePackagePrice);
}
