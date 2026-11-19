// Turns bookings from the backend into the shapes the app screens use.
import type { BackendBooking, BookingStatus } from "./api";
import type { SavedEnquiry } from "./storage";
import { whatsappMessageFromRows } from "./booking";

export const num = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const SERVICE_TITLE = (s: string) => {
  const v = s.toLowerCase();
  if (v.includes("airport")) return "Airport Taxi";
  if (v.includes("outstation")) return "Outstation Cab";
  if (v.includes("tour") || v.includes("package")) return "Tour Packages";
  return "Local Taxi";
};

export const serviceTitle = (b: Pick<BackendBooking, "service_type" | "tour_package_type">) =>
  SERVICE_TITLE(`${b.service_type ?? ""} ${b.tour_package_type ? "tour" : ""}`);

const hhmm = (t?: string | null) => (t ? String(t).slice(0, 5) : "");

/** Rows in the same labels the booking screen writes (so "Book again" works on server bookings too). */
export function bookingRows(b: BackendBooking): { label: string; value: string }[] {
  const title = serviceTitle(b);
  const notes = b.notes ?? "";
  const rows: { label: string; value: string }[] = [];
  if (title === "Tour Packages") {
    rows.push({ label: "Package", value: b.tour_package_type || "" });
  } else if (title === "Local Taxi") {
    rows.push({ label: "Pickup", value: b.pickup_location || "" });
    const pkg = /Local package:\s*(.+?)\.\s/i.exec(notes)?.[1];
    if (pkg) rows.push({ label: "Package", value: pkg });
  } else if (title === "Outstation Cab") {
    rows.push({ label: "From", value: b.pickup_location || "" }, { label: "To", value: b.drop_location || "" });
    rows.push({ label: "Trip", value: /round trip/i.test(notes) ? "Round Trip" : "One Way" });
  } else {
    rows.push({ label: "From", value: b.pickup_location || "" }, { label: "To", value: b.drop_location || "" });
  }
  if (b.travel_date) rows.push({ label: "Date", value: String(b.travel_date).slice(0, 10) });
  if (b.travel_time) rows.push({ label: "Time", value: hhmm(b.travel_time) });
  if (b.vehicle) rows.push({ label: "Car", value: b.vehicle });
  if (b.customer_name) rows.push({ label: "Name", value: b.customer_name });
  if (b.mobile) rows.push({ label: "Mobile", value: b.mobile });
  return rows.filter((r) => r.value);
}

export function toSaved(b: BackendBooking): SavedEnquiry {
  const number = String(b.enquiry_number ?? b.id);
  const rows = bookingRows(b);
  return {
    id: b.id,
    number,
    title: serviceTitle(b),
    rows,
    fare: num(b.final_price) ?? num(b.fixed_amount),
    createdAt: b.created_at,
    whatsapp: whatsappMessageFromRows(serviceTitle(b), rows, number),
    paid: b.payment_status === "paid",
    status: b.status,
    paymentStatus: b.payment_status ?? undefined,
  };
}

export const STATUS_LABEL: Record<BookingStatus, string> = {
  pending: "Request received",
  contacted: "Team contacted you",
  confirmed: "Confirmed",
  completed: "Trip completed",
  cancelled: "Cancelled",
};

export const statusLabel = (s?: string) => STATUS_LABEL[(s ?? "") as BookingStatus] ?? "Request received";

export const PAYMENT_LABEL: Record<string, string> = { unpaid: "Unpaid", partial: "Part paid", paid: "Paid" };
