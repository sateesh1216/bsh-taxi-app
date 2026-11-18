import AsyncStorage from "@react-native-async-storage/async-storage";
import { scopedKey } from "./scope";
import { cloudReady, pullBookings, pushBooking } from "./cloud";

export interface SavedEnquiry {
  number: string;
  title: string;
  rows: { label: string; value: string }[];
  fare: number | null;
  createdAt: string;
  whatsapp: string;
  paid?: boolean;
}

const BASE = "bsh_enquiries_v1"; // guest data keeps the old key, accounts get BASE:uid

function normalizeEnquiry(raw: unknown): SavedEnquiry | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const num = r.number != null ? String(r.number) : "";
  const rows = Array.isArray(r.rows)
    ? r.rows
        .filter((x): x is Record<string, unknown> => Boolean(x && typeof x === "object"))
        .map((x) => ({ label: String(x.label ?? ""), value: String(x.value ?? "") }))
    : [];
  return {
    number: num,
    title: typeof r.title === "string" && r.title ? r.title : "Booking",
    rows,
    fare: typeof r.fare === "number" && Number.isFinite(r.fare) ? r.fare : null,
    createdAt: typeof r.createdAt === "string" ? r.createdAt : "",
    whatsapp: typeof r.whatsapp === "string" ? r.whatsapp : "",
    ...(r.paid !== undefined ? { paid: Boolean(r.paid) } : {}),
  };
}

function parseList(raw: string | null): SavedEnquiry[] {
  if (!raw) return [];
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) return [];
  return parsed.map(normalizeEnquiry).filter((x): x is SavedEnquiry => x !== null);
}

export async function listEnquiries(): Promise<SavedEnquiry[]> {
  try {
    return parseList(await AsyncStorage.getItem(scopedKey(BASE)));
  } catch {
    return [];
  }
}

export async function saveEnquiry(e: SavedEnquiry) {
  const clean = normalizeEnquiry(e);
  if (!clean) return;
  const all = await listEnquiries();
  await AsyncStorage.setItem(scopedKey(BASE), JSON.stringify([clean, ...all.filter((x) => x.number !== clean.number)].slice(0, 50)));
  void pushBooking(clean); // saved to the account in the background when signed in
}

export async function getEnquiry(number: string) {
  const key = String(number ?? "");
  return (await listEnquiries()).find((e) => e.number === key) ?? null;
}

/** After sign-in: move bookings made as a guest on this phone into the account. */
export async function adoptGuestEnquiries() {
  const raw = await AsyncStorage.getItem(BASE);
  if (!raw) return;
  try {
    const guest = parseList(raw);
    const mine = await listEnquiries();
    const merged = [...mine, ...guest.filter((g) => !mine.some((m) => m.number === g.number))]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 50);
    await AsyncStorage.setItem(scopedKey(BASE), JSON.stringify(merged));
    await AsyncStorage.removeItem(BASE);
  } catch {
    /* keep guest data untouched */
  }
}

/** Merge the account's bookings (cloud) with this phone's list and push anything the cloud is missing. */
export async function syncBookings(): Promise<{ items: SavedEnquiry[]; synced: boolean }> {
  const local = await listEnquiries();
  if (!cloudReady()) return { items: local, synced: false };
  const remote = await pullBookings();
  if (!remote) return { items: local, synced: false };
  const have = new Set(remote.map((r) => r.number));
  await Promise.all(local.filter((l) => !have.has(l.number)).map((l) => pushBooking(l)));
  const merged = [...remote, ...local.filter((l) => !have.has(l.number))].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 100);
  await AsyncStorage.setItem(scopedKey(BASE), JSON.stringify(merged));
  return { items: merged, synced: true };
}
