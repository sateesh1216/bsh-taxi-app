import { destinations, outstations, services } from "../data/site";

export type Hit = { key: string; title: string; subtitle: string; href: string };

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]+/g, " ");

const INDEX: (Hit & { hay: string })[] = [
  ...destinations.map((d) => ({ key: `d-${d.slug}`, title: d.name, subtitle: `Destination · ${d.category}`, href: `/destinations/${d.slug}`, hay: norm([d.name, d.category, ...(d.places ?? []).map((p) => p.name)].join(" ")) })),
  ...outstations.map((o) => ({ key: `o-${o.slug}`, title: o.name, subtitle: `Outstation taxi · ${o.category}`, href: `/outstation/${o.slug}`, hay: norm([o.name, o.category, ...(o.places ?? []).map((p) => p.name)].join(" ")) })),
  ...services.map((s) => ({ key: `s-${s.slug}`, title: s.title, subtitle: "Service", href: `/services/${s.slug}`, hay: norm(s.title) })),
];

/** Every typed word must match the start of a word in the item. */
export function searchSite(query: string, limit = 8): Hit[] {
  const words = norm(query).split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  return INDEX.filter((i) => words.every((w) => i.hay.split(" ").some((h) => h.startsWith(w)))).slice(0, limit);
}
