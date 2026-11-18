import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Platform } from "react-native";
import { requireOptionalNativeModule } from "expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FIREBASE_API_KEY, authEnabled } from "./authConfig";
import { adoptGuestEnquiries } from "./storage";
import { setScope } from "./scope";
import { registerCloud } from "./cloud";

type StoreApi = {
  getItemAsync: (key: string) => Promise<string | null>;
  setItemAsync: (key: string, value: string) => Promise<void>;
  deleteItemAsync: (key: string) => Promise<void>;
};

function getSessionStore(): StoreApi {
  if (Platform.OS !== "web" && requireOptionalNativeModule("ExpoSecureStore")) {
    try {
      const SecureStore = require("expo-secure-store") as typeof import("expo-secure-store");
      if (typeof SecureStore.getItemAsync === "function") return SecureStore;
    } catch {
      /* fall back to AsyncStorage */
    }
  }
  return {
    getItemAsync: (k) => AsyncStorage.getItem(k),
    setItemAsync: (k, v) => AsyncStorage.setItem(k, v),
    deleteItemAsync: (k) => AsyncStorage.removeItem(k),
  };
}

const sessionStore = getSessionStore();

export type AppUser = { uid: string; email: string; name: string; photo?: string };

/** A message that is safe to show to the customer. */
export class AuthError extends Error {}

const FRIENDLY: [string, string][] = [
  ["EMAIL_EXISTS", "An account with this email already exists. Please sign in."],
  ["INVALID_LOGIN_CREDENTIALS", "Incorrect email or password."],
  ["INVALID_PASSWORD", "Incorrect email or password."],
  ["EMAIL_NOT_FOUND", "No account found with this email."],
  ["INVALID_EMAIL", "Please enter a valid email address."],
  ["WEAK_PASSWORD", "Password must be at least 6 characters."],
  ["TOO_MANY_ATTEMPTS", "Too many attempts. Please try again in a few minutes."],
  ["USER_DISABLED", "This account has been disabled. Please contact us."],
  ["OPERATION_NOT_ALLOWED", "This sign-in method is not enabled yet."],
  ["CREDENTIAL_TOO_OLD", "For security, please sign in again and retry."],
  ["TOKEN_EXPIRED", "Your session expired. Please sign in again."],
  ["INVALID_IDP_RESPONSE", "Google sign-in failed. Please try again."],
];

function friendly(code: string) {
  const hit = FRIENDLY.find(([k]) => code.startsWith(k) || code.includes(k));
  return hit ? hit[1] : "Something went wrong. Please try again.";
}

async function fb<T>(endpoint: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:${endpoint}?key=${FIREBASE_API_KEY}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  } catch {
    throw new AuthError("Unable to reach the server. Please check your internet.");
  }
  const json = (await res.json().catch(() => ({}))) as { error?: { message?: string } } & T;
  if (!res.ok) throw new AuthError(friendly(json.error?.message ?? ""));
  return json;
}

type TokenResp = { idToken: string; refreshToken: string; expiresIn: string; localId: string; email?: string; displayName?: string; photoUrl?: string };
type Stored = { refreshToken: string; user: AppUser };
const KEY = "bsh_session_v1";

type Ctx = {
  user: AppUser | null;
  loading: boolean;
  configured: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signInWithGoogle: (googleIdToken: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
};

const AuthContext = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(authEnabled);
  const token = useRef<{ id: string; exp: number; refresh: string } | null>(null);

  const freshRef = useRef<() => Promise<string>>(async () => { throw new AuthError("Please sign in again."); });
  const apply = useCallback(async (resp: TokenResp, fallbackName = "") => {
    const u: AppUser = { uid: resp.localId, email: resp.email ?? "", name: resp.displayName || fallbackName || (resp.email ?? "").split("@")[0], photo: resp.photoUrl };
    token.current = { id: resp.idToken, exp: Date.now() + Number(resp.expiresIn) * 1000, refresh: resp.refreshToken };
    await sessionStore.setItemAsync(KEY, JSON.stringify({ refreshToken: resp.refreshToken, user: u } satisfies Stored)).catch(() => {});
    setScope(u.uid);
    registerCloud({ uid: u.uid, getToken: () => freshRef.current() });
    await adoptGuestEnquiries();
    setUser(u);
  }, []);

  const freshToken = useCallback(async (): Promise<string> => {
    const t = token.current;
    if (t && Date.now() < t.exp - 60_000) return t.id;
    if (!t) throw new AuthError("Please sign in again.");
    const res = await fetch(`https://securetoken.googleapis.com/v1/token?key=${FIREBASE_API_KEY}`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: `grant_type=refresh_token&refresh_token=${encodeURIComponent(t.refresh)}` });
    const j = (await res.json()) as { id_token?: string; refresh_token?: string; expires_in?: string };
    if (!res.ok || !j.id_token) throw new AuthError("Your session expired. Please sign in again.");
    token.current = { id: j.id_token, exp: Date.now() + Number(j.expires_in ?? "3600") * 1000, refresh: j.refresh_token ?? t.refresh };
    return j.id_token;
  }, []);

  useEffect(() => { freshRef.current = freshToken; }, [freshToken]);

  // Restore the session on launch: show the saved user at once, refresh the token in the background.
  useEffect(() => {
    if (!authEnabled) return;
    (async () => {
      try {
        const raw = await sessionStore.getItemAsync(KEY);
        if (raw) {
          const s = JSON.parse(raw) as Stored;
          token.current = { id: "", exp: 0, refresh: s.refreshToken };
          setScope(s.user.uid);
          registerCloud({ uid: s.user.uid, getToken: () => freshRef.current() });
          setUser(s.user);
          try { await freshToken(); } catch (e) { if (e instanceof AuthError) { /* offline is fine, an expired session is not */ } }
        }
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    })();
  }, [freshToken]);

  const value = useMemo<Ctx>(() => ({
    user, loading, configured: authEnabled,
    signIn: async (email, password) => { await apply(await fb<TokenResp>("signInWithPassword", { email: email.trim(), password, returnSecureToken: true })); },
    signUp: async (name, email, password) => {
      const r = await fb<TokenResp>("signUp", { email: email.trim(), password, returnSecureToken: true });
      await fb("update", { idToken: r.idToken, displayName: name.trim(), returnSecureToken: false }).catch(() => {});
      await apply({ ...r, displayName: name.trim() });
    },
    signInWithGoogle: async (googleIdToken) => {
      await apply(await fb<TokenResp>("signInWithIdp", { postBody: `id_token=${googleIdToken}&providerId=google.com`, requestUri: "http://localhost", returnIdpCredential: true, returnSecureToken: true }));
    },
    resetPassword: async (email) => { await fb("sendOobCode", { requestType: "PASSWORD_RESET", email: email.trim() }); },
    signOut: async () => {
      token.current = null;
      await sessionStore.deleteItemAsync(KEY).catch(() => {});
      setScope(null);
      registerCloud(null);
      setUser(null);
    },
    deleteAccount: async () => {
      await fb("delete", { idToken: await freshToken() });
      token.current = null;
      await sessionStore.deleteItemAsync(KEY).catch(() => {});
      setScope(null);
      registerCloud(null);
      setUser(null);
    },
  }), [user, loading, apply, freshToken]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const c = useContext(AuthContext);
  if (!c) throw new Error("useAuth must be used inside AuthProvider");
  return c;
}
