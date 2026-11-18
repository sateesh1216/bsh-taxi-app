// Fill these in .env (see SETUP_ACCOUNTS.md).
export const FIREBASE_API_KEY = (process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? "").trim();
export const FIREBASE_PROJECT_ID = (process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? "").trim();
export const GOOGLE_CLIENT_IDS = {
  web: (process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? "").trim(),
  ios: (process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? "").trim(),
  android: (process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? "").trim(),
};
export const authEnabled = FIREBASE_API_KEY.length > 0;
/** Bookings and profile are saved to the account (Firestore) when a project id is set. */
export const cloudEnabled = authEnabled && FIREBASE_PROJECT_ID.length > 0;
export const googleEnabled = authEnabled && Boolean(GOOGLE_CLIENT_IDS.web || GOOGLE_CLIENT_IDS.ios || GOOGLE_CLIENT_IDS.android);
