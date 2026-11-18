import { CAR_TYPES, LOCAL_FARES, LOCAL_PACKAGES, TERMS_AND_CONDITIONS, TOUR_FARES, TOUR_PACKAGES, type CarId, type LocalPackageId, type TourId } from "../data/catalog";
import type { BookingPayload, PayNowPayload } from "./api";
import type { Key } from "./i18n";

export type Account = { email: string };

export type ServiceKind = "local" | "outstation" | "airport" | "tour";
export const KINDS: ServiceKind[] = ["local", "outstation", "airport", "tour"];
export const KIND_LABEL: Record<ServiceKind, string> = { local: "Local", outstation: "Outstation", airport: "Airport", tour: "Tours" };
const SERVICE_TYPE: Record<ServiceKind, string> = { local: "Local Taxi", outstation: "Outstation Cab", airport: "Airport Taxi", tour: "Tour Package" };
export const AIRPORT = "Visakhapatnam Airport";

export interface Draft {
  kind: ServiceKind;
  pickup: string;
  drop: string;
  round: boolean;
  fromAirport: boolean;
  localPkg: LocalPackageId;
  tourId: TourId;
  carId: CarId;
  date: Date;
  time: Date;
  name: string;
  mobile: string;
  email: string;
}

export function newDraft(kind: ServiceKind, drop = ""): Draft {
  const t = new Date();
  t.setHours(9, 0, 0, 0);
  return {
    kind, pickup: kind === "outstation" ? "Visakhapatnam" : "", drop, round: false, fromAirport: true,
    localPkg: LOCAL_PACKAGES[0].id, tourId: TOUR_PACKAGES[0].id, carId: CAR_TYPES[0].id,
    date: new Date(), time: t, name: "", mobile: "", email: "",
  };
}

export const formatCurrency = (n: number | string | null | undefined) => {
  const v = Number(n);
  return n === null || n === undefined || !Number.isFinite(v) ? "—" : `₹${Math.round(v).toLocaleString("en-IN")}`;
};

const pad = (n: number) => String(n).padStart(2, "0");
export const toISODate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const toHHMM = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

/** 10-digit Indian mobile number, or null when invalid (same rule as the website). */
export function cleanIndianMobile(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  const ten = digits.length > 10 ? digits.slice(-10) : digits;
  return /^[6-9]\d{9}$/.test(ten) ? ten : null;
}

export const car = (d: Draft) => CAR_TYPES.find((c) => c.id === d.carId) ?? CAR_TYPES[0];
export const localPkg = (d: Draft) => LOCAL_PACKAGES.find((p) => p.id === d.localPkg) ?? LOCAL_PACKAGES[0];
export const tourPkg = (d: Draft) => TOUR_PACKAGES.find((t) => t.id === d.tourId) ?? TOUR_PACKAGES[0];

/** Fixed fare for local and tour; null means "confirmed on call". */
export function fareFor(d: Draft): number | null {
  if (d.kind === "local") return LOCAL_FARES[d.carId][d.localPkg];
  if (d.kind === "tour") return TOUR_FARES[d.tourId][d.carId];
  return null;
}

export function validateTrip(d: Draft): Key | null {
  if (d.kind === "local" && d.pickup.trim().length < 3) return "v_pickup_addr";
  if (d.kind === "outstation" && (d.pickup.trim().length < 2 || d.drop.trim().length < 2)) return "v_pickup_drop";
  if (d.kind === "airport" && d.pickup.trim().length < 2) return d.fromAirport ? "v_airport_drop" : "v_airport_pickup";
  return null;
}

export function validateContact(d: Draft): Key | null {
  if (d.name.trim().length < 2) return "v_name";
  if (!cleanIndianMobile(d.mobile)) return "v_mobile";
  const email = d.email.trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "v_email";
  return null;
}

export const validate = (d: Draft): Key | null => validateTrip(d) ?? validateContact(d);

export function rows(d: Draft): { label: string; value: string }[] {
  const c = car(d);
  const r: { label: string; value: string }[] = [];
  if (d.kind === "tour") r.push({ label: "Package", value: tourPkg(d).name });
  if (d.kind === "local") { r.push({ label: "Pickup", value: d.pickup.trim() }, { label: "Package", value: localPkg(d).label }); }
  if (d.kind === "outstation") r.push({ label: "From", value: d.pickup.trim() }, { label: "To", value: d.drop.trim() }, { label: "Trip", value: d.round ? "Round Trip" : "One Way" });
  if (d.kind === "airport") r.push({ label: "From", value: d.fromAirport ? AIRPORT : d.pickup.trim() }, { label: "To", value: d.fromAirport ? d.pickup.trim() : AIRPORT });
  r.push({ label: "Date", value: toISODate(d.date) });
  if (d.kind !== "tour") r.push({ label: "Time", value: toHHMM(d.time) });
  r.push({ label: "Car", value: c.name }, { label: "Name", value: d.name.trim() }, { label: "Mobile", value: cleanIndianMobile(d.mobile) ?? d.mobile });
  return r;
}

export function buildPayload(d: Draft, account?: Account): BookingPayload {
  const c = car(d);
  const base = { customer_name: d.name.trim(), mobile: cleanIndianMobile(d.mobile) ?? d.mobile.trim(), customer_email: d.email.trim() || account?.email || undefined, vehicle: c.name, passengers: c.seats };
  const who = account?.email ? ` App account: ${account.email}.` : "";
  const fare = fareFor(d);
  if (d.kind === "local") {
    return { ...base, service_type: SERVICE_TYPE.local, pickup_location: d.pickup.trim(), drop_location: d.pickup.trim(), travel_date: toISODate(d.date), travel_time: toHHMM(d.time), notes: `Local package: ${localPkg(d).label}. Fare shown in app: ${formatCurrency(fare)}. Booked from app.${who}` };
  }
  if (d.kind === "outstation") {
    return { ...base, service_type: SERVICE_TYPE.outstation, pickup_location: d.pickup.trim(), drop_location: d.drop.trim(), travel_date: toISODate(d.date), travel_time: toHHMM(d.time), notes: `${d.round ? "Round Trip" : "One Way"}. Fare to be confirmed on call. Booked from app.${who}` };
  }
  if (d.kind === "airport") {
    return { ...base, service_type: SERVICE_TYPE.airport, pickup_location: d.fromAirport ? AIRPORT : d.pickup.trim(), drop_location: d.fromAirport ? d.pickup.trim() : AIRPORT, travel_date: toISODate(d.date), travel_time: toHHMM(d.time), notes: `${d.fromAirport ? "Airport to City" : "City to Airport"}. Fare to be confirmed on call. Booked from app.${who}` };
  }
  const t = tourPkg(d);
  return { ...base, service_type: SERVICE_TYPE.tour, tour_package_type: t.name, travel_date: toISODate(d.date), notes: `Tour: ${t.name} (${t.days}D/${t.nights}N). Fare shown in app: ${formatCurrency(fare)}. Booked from app.${who}` };
}

export function buildPayNow(d: Draft, account?: Account): PayNowPayload {
  return { ...buildPayload(d, account), planA: d.kind === "tour" ? d.tourId : d.localPkg, vehicle_key: d.carId };
}

export function whatsappMessage(d: Draft, enquiryNumber?: string): string {
  const fare = fareFor(d);
  const lines = ["Hi BSH Taxi Services! I'd like to book a cab.", "", `*${SERVICE_TYPE[d.kind]}*`, ...rows(d).map((r) => `${r.label}: ${r.value}`)];
  if (d.kind === "tour") lines.push("", "*Places Covered:*", ...tourPkg(d).highlights.map((h, i) => `${i + 1}. ${h}`));
  lines.push("", `Fare: ${fare !== null ? formatCurrency(fare) : "Please confirm on call"}`);
  if (enquiryNumber) lines.push(`Enquiry no: ${enquiryNumber}`);
  lines.push("", "*Terms & Conditions:*", ...TERMS_AND_CONDITIONS.map((t, i) => `${i + 1}. ${t}`));
  return lines.join("\n");
}
