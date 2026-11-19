// Accounts are handled by the BSH backend (see lib/auth.tsx), not a third party.
export const authEnabled = true;

/**
 * true  = customers must sign in before they can send an enquiry or pay
 *         (every booking is then linked to their account).
 * false = guests may still book with just a name and mobile number.
 */
export const REQUIRE_LOGIN = (process.env.EXPO_PUBLIC_REQUIRE_LOGIN ?? "true").trim().toLowerCase() !== "false";

// Google sign-in is not supported by the backend yet (kept so GoogleButton still compiles).
export const GOOGLE_CLIENT_IDS = { web: "", ios: "", android: "" };
export const googleEnabled = false;

// Compatibility fallbacks for legacy unused cloud sync
export const FIREBASE_PROJECT_ID = "";
export const cloudEnabled = false;
