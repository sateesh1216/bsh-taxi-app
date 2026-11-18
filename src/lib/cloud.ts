// Saves the signed-in user's bookings and profile in Firestore (REST), under users/{uid}.
// Security rules (firestore.rules) make each user able to read and write only their own documents.
import { FIREBASE_PROJECT_ID, cloudEnabled } from "./authConfig";
import type { SavedEnquiry } from "./storage";

const BASE = () => `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`;

type Session = { uid: string; getToken: () => Promise<string> };
let session: Session | null = null;
export const registerCloud = (s: Session | null) => { session = s; };
export const cloudReady = () => cloudEnabled && session !== null;

type FV = { stringValue?: string; integerValue?: string; booleanValue?: boolean; nullValue?: null };
type Doc = { name: string; fields?: Record<string, FV> };
const str = (v: string): FV => ({ stringValue: v });
const readStr = (f: Record<string, FV> | undefined, k: string) => f?.[k]?.stringValue ?? "";

async function call(method: "GET" | "PATCH", path: string, body?: unknown): Promise<Response> {
  const token = await session!.getToken();
  return fetch(`${BASE()}/${path}`, { method, headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
}

const safeId = (n: string) => n.replace(/[^A-Za-z0-9_-]/g, "_").slice(0, 100);

export async function pushBooking(e: SavedEnquiry): Promise<boolean> {
  if (!cloudReady()) return false;
  try {
    const fields: Record<string, FV> = {
      number: str(e.number), title: str(e.title), rows: str(JSON.stringify(e.rows)), createdAt: str(e.createdAt), whatsapp: str(e.whatsapp),
      fare: e.fare === null ? { nullValue: null } : { integerValue: String(Math.round(e.fare)) }, paid: { booleanValue: !!e.paid },
    };
    const res = await call("PATCH", `users/${session!.uid}/bookings/${safeId(e.number)}`, { fields });
    return res.ok;
  } catch {
    return false;
  }
}

/** All bookings stored in the account, or null when offline / not signed in. */
export async function pullBookings(): Promise<SavedEnquiry[] | null> {
  if (!cloudReady()) return null;
  try {
    const res = await call("GET", `users/${session!.uid}/bookings?pageSize=100`);
    if (!res.ok) return null;
    const json = (await res.json()) as { documents?: Doc[] };
    return (json.documents ?? []).map((d) => {
      const f = d.fields;
      let rows: SavedEnquiry["rows"] = [];
      try { rows = JSON.parse(readStr(f, "rows")) as SavedEnquiry["rows"]; } catch { /* keep empty */ }
      return { number: readStr(f, "number"), title: readStr(f, "title"), rows, fare: f?.fare?.integerValue !== undefined ? Number(f.fare.integerValue) : null, createdAt: readStr(f, "createdAt"), whatsapp: readStr(f, "whatsapp"), paid: !!f?.paid?.booleanValue };
    }).filter((b) => b.number);
  } catch {
    return null;
  }
}

export type CloudProfile = { name: string; email: string; home: string; office: string };

export async function pushProfile(p: CloudProfile): Promise<boolean> {
  if (!cloudReady()) return false;
  try {
    const res = await call("PATCH", `users/${session!.uid}`, { fields: { name: str(p.name), email: str(p.email), home: str(p.home), office: str(p.office) } });
    return res.ok;
  } catch {
    return false;
  }
}

export async function pullProfile(): Promise<CloudProfile | null> {
  if (!cloudReady()) return null;
  try {
    const res = await call("GET", `users/${session!.uid}`);
    if (!res.ok) return null;
    const d = (await res.json()) as Doc;
    return { name: readStr(d.fields, "name"), email: readStr(d.fields, "email"), home: readStr(d.fields, "home"), office: readStr(d.fields, "office") };
  } catch {
    return null;
  }
}
