// =============================================================================
// API CLIENT (app -> backend). Same endpoints as the BSH website.
//   EXPO_PUBLIC_API_URL      backend base URL, no trailing "/api"
//   EXPO_PUBLIC_COMPANY_KEY  "BSH" (backend routes enquiries/payments by it)
// =============================================================================

import Constants from "expo-constants";
import { Platform } from "react-native";

/**
 * A phone cannot reach "localhost" (that is the phone itself, not your computer).
 * While developing, swap localhost / 127.0.0.1 for the computer running `expo start`.
 */
function resolveBase(raw: string): string {
  if (Platform.OS === "web" || !/\/\/(localhost|127\.0\.0\.1)(:|\/|$)/i.test(raw)) return raw;
  const host = (Constants.expoConfig?.hostUri || "").split(":")[0];
  return host ? raw.replace(/\/\/(localhost|127\.0\.0\.1)/i, `//${host}`) : raw;
}

export const API_BASE = resolveBase(
  (process.env.EXPO_PUBLIC_API_URL || "https://accountsdatabase.in")
    .trim()
    .replace(/\/+$/, "")
    .replace(/\/api$/i, ""),
);

export const COMPANY_KEY = (process.env.EXPO_PUBLIC_COMPANY_KEY || "BSH").trim().toUpperCase();

export class ApiError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status = 0, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

interface ApiEnvelope<T> {
  success?: boolean;
  message?: string;
  code?: string;
  data?: T;
}

/* -------------------------------------------------------------------------- */
/* Auth token plumbing (set by AuthProvider, see lib/auth.tsx)                */
/* -------------------------------------------------------------------------- */

type TokenHooks = {
  /** Current access token, refreshed when about to expire. null = signed out. */
  getToken: () => Promise<string | null>;
  /** Called after a 401 on a request that carried a token: refresh and return the new token (or null). */
  onUnauthorized: () => Promise<string | null>;
};

let hooks: TokenHooks | null = null;
export const setTokenHooks = (h: TokenHooks | null) => { hooks = h; };

interface RequestInit2 {
  method?: string;
  body?: unknown;
  /** "required" = must be signed in, "optional" = attach the token when signed in (default), "none" = never. */
  auth?: "required" | "optional" | "none";
}

async function request<T>(path: string, init: RequestInit2 = {}): Promise<T> {
  const mode = init.auth ?? "optional";
  let token: string | null = null;
  if (mode !== "none" && hooks) {
    try { token = await hooks.getToken(); } catch { token = null; }
  }
  if (mode === "required" && !token) throw new ApiError("Please sign in to continue.", 401, "AUTH_REQUIRED");

  const attempt = async (bearer: string | null): Promise<T> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30_000);
    try {
      const res = await fetch(`${API_BASE}/api${path}`, {
        method: init.method ?? "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Company-Key": COMPANY_KEY,
          ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
        },
        body: init.body === undefined ? undefined : JSON.stringify(init.body),
        signal: controller.signal,
      });

      let json: ApiEnvelope<T> = {};
      try {
        json = (await res.json()) as ApiEnvelope<T>;
      } catch {
        /* non-JSON response */
      }

      if (!res.ok || json.success === false) {
        throw new ApiError(json.message || "Something went wrong. Please try again.", res.status, json.code);
      }
      return json.data as T;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      if (err instanceof Error && err.name === "AbortError") {
        throw new ApiError("The server took too long to respond. Please try again.");
      }
      throw new ApiError(`Unable to reach the server (${API_BASE}). Please check your internet and try again.`);
    } finally {
      clearTimeout(timer);
    }
  };

  try {
    return await attempt(token);
  } catch (err) {
    // Access token expired or was revoked: refresh once and retry.
    if (err instanceof ApiError && err.status === 401 && token && hooks) {
      const fresh = await hooks.onUnauthorized().catch(() => null);
      if (fresh) return attempt(fresh);
      throw new ApiError("Your session expired. Please sign in again.", 401, "SESSION_EXPIRED");
    }
    throw err;
  }
}

/* -------------------------------------------------------------------------- */
/* Booking payload (shared by Enquiry + Pay Now)                              */
/* -------------------------------------------------------------------------- */

export interface BookingPayload {
  /** "Local Taxi" | "Outstation Cab" | "Airport Taxi" | "Tour Package" */
  service_type: string;
  tour_package_type?: string;
  pickup_location?: string;
  drop_location?: string;
  travel_date?: string; // YYYY-MM-DD
  travel_time?: string; // HH:MM
  passengers?: number;
  vehicle?: string;
  notes?: string;

  customer_name: string;
  mobile: string;
  customer_email?: string;
  /** Lets the owner see the enquiry came from the mobile app. */
  source?: "mobile_app";
}

export interface PayNowPayload extends BookingPayload {
  /** Fare lookup keys - the server decides the amount from these. */
  planA: string; // local package id  /  tour package id
  planB?: string;
  vehicle_key: string; // car id
}

export interface EnquiryResult {
  enquiry: { id: string; enquiry_number: string; status: string };
}

export interface PayNowResult {
  enquiry: { id: string; enquiry_number: string };
  quote?: { amount: number; currency: string; label?: string };
  payment: { id: string; merchant_txn_id: string; amount: number; gateway: string };
  checkoutUrl: string;
  redirectUrl: string;
}

export interface PaymentStatusResult {
  status: string;
  amount: number | string;
  paid_amount?: number | string | null;
  payment_mode?: string | null;
  transaction_id?: string | null;
  paid_at?: string | null;
  invoice?: { invoice_number: string; pdf_url: string } | null;
}

/** "Send Enquiry" -> POST /api/enquiries */
export function submitEnquiry(payload: BookingPayload) {
  return request<EnquiryResult>("/enquiries", {
    method: "POST",
    body: { ...payload, source: "mobile_app", company_key: COMPANY_KEY },
  });
}

/** "Pay Now" -> POST /api/payments/booking-now  (returns the gateway URL) */
export function startPayNow(payload: PayNowPayload) {
  return request<PayNowResult>("/payments/booking-now", {
    method: "POST",
    body: { ...payload, company_key: COMPANY_KEY },
  });
}

/** Payment result page -> GET /api/payments/status/:ref */
export function getPaymentStatus(ref: string) {
  return request<PaymentStatusResult>(`/payments/status/${encodeURIComponent(ref)}`);
}

/* -------------------------------------------------------------------------- */
/* Accounts                                                                   */
/* -------------------------------------------------------------------------- */

export interface BackendUser {
  id: string;
  full_name?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  role?: string;
}

export interface BackendSession {
  access_token: string;
  refresh_token: string;
  /** unix seconds */
  expires_at?: number;
  expires_in?: number;
}

export interface AuthResult {
  user: BackendUser;
  token: string;
  session: BackendSession;
}

export const apiSignUp = (b: { name: string; phone: string; email: string; password: string; confirmPassword: string }) =>
  request<AuthResult>("/auth/signup", { method: "POST", auth: "none", body: { ...b, company_key: COMPANY_KEY } });

export const apiSignIn = (identifier: string, password: string) =>
  request<AuthResult>("/auth/signin", { method: "POST", auth: "none", body: { identifier, password } });

export const apiRefresh = (refresh_token: string) =>
  request<AuthResult>("/auth/refresh", { method: "POST", auth: "none", body: { refresh_token } });

export const apiForgotPassword = (email: string) =>
  request<unknown>("/auth/forgot-password", { method: "POST", auth: "none", body: { email, company_key: COMPANY_KEY } });

export const apiResetPassword = (email: string, code: string, newPassword: string) =>
  request<unknown>("/auth/reset-password", { method: "POST", auth: "none", body: { email, code, newPassword } });

export const apiDeleteAccount = (password: string) =>
  request<unknown>("/auth/me", { method: "DELETE", auth: "required", body: { password } });

/* -------------------------------------------------------------------------- */
/* My bookings + paying for a confirmed booking                               */
/* -------------------------------------------------------------------------- */

export type BookingStatus = "pending" | "contacted" | "confirmed" | "completed" | "cancelled";

export interface BackendBooking {
  id: string;
  enquiry_number: string | number;
  service_type?: string | null;
  tour_package_type?: string | null;
  pickup_location?: string | null;
  drop_location?: string | null;
  travel_date?: string | null;
  travel_time?: string | null;
  passengers?: number | null;
  vehicle?: string | null;
  mobile?: string | null;
  customer_name?: string | null;
  notes?: string | null;
  status: BookingStatus;
  payment_status?: "unpaid" | "partial" | "paid" | string | null;
  fixed_amount?: number | string | null;
  final_price?: number | string | null;
  advance_amount?: number | string | null;
  amount_paid?: number | string | null;
  balance_due?: number | string | null;
  vehicle_name?: string | null;
  vehicle_number?: string | null;
  driver_name?: string | null;
  driver_phone?: string | null;
  pickup_details?: string | null;
  trip_details?: string | null;
  created_at: string;
}

export interface BookingPayment {
  id: string;
  merchant_txn_id: string;
  kind?: string;
  amount: number | string;
  paid_amount?: number | string | null;
  status: string;
  payment_mode?: string | null;
  paid_at?: string | null;
  created_at: string;
}

export interface BookingInvoice {
  payment_id: string;
  invoice_number: string;
  amount: number | string;
  created_at: string;
  pdf_url: string;
}

export interface BookingDetails {
  enquiry: BackendBooking;
  payments: BookingPayment[];
  invoices: BookingInvoice[];
}

/** GET /api/enquiries/my */
export async function listMyBookings(): Promise<BackendBooking[]> {
  const data = await request<{ enquiries: BackendBooking[] }>("/enquiries/my?limit=100", { auth: "required" });
  return data?.enquiries ?? [];
}

/** GET /api/enquiries/my/:id */
export const getMyBooking = (id: string) => request<BookingDetails>(`/enquiries/my/${encodeURIComponent(id)}`, { auth: "required" });

export interface PayBookingResult {
  payment: { id: string; merchant_txn_id: string; amount: number; kind: string };
  checkoutUrl: string;
  redirectUrl: string;
}

/** POST /api/payments/enquiries/:id/pay  (only once the team has confirmed the booking) */
export const payForBooking = (id: string, type: "advance" | "full") =>
  request<PayBookingResult>(`/payments/enquiries/${encodeURIComponent(id)}/pay`, { method: "POST", auth: "required", body: { type } });
