// Accounts on the BSH backend: POST /api/auth/signup | signin | refresh (email or phone + password).
// The access token is short lived; the refresh token is kept in secure storage and used to renew it.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Platform } from "react-native";
import { requireOptionalNativeModule } from "expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ApiError, apiDeleteAccount, apiForgotPassword, apiRefresh, apiResetPassword, apiSignIn, apiSignUp, setTokenHooks,
  type AuthResult, type BackendUser,
} from "./api";
import { adoptGuestEnquiries } from "./storage";
import { setScope } from "./scope";

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

export type AppUser = { uid: string; email: string; name: string; phone: string; photo?: string };

/** A message that is safe to show to the customer. */
export class AuthError extends Error {}

const asAuthError = (e: unknown) =>
  e instanceof AuthError ? e : new AuthError(e instanceof ApiError ? e.message : "Something went wrong. Please try again.");

type Tokens = { access: string; refresh: string; exp: number };
type Stored = { tokens: Tokens; user: AppUser };
const KEY = "bsh_session_v2";
const EARLY_MS = 60_000; // renew the token a minute before it expires

const toUser = (u: BackendUser, fallback?: AppUser): AppUser => ({
  uid: u.id,
  email: u.email ?? fallback?.email ?? "",
  name: u.full_name || u.name || fallback?.name || (u.email ?? "").split("@")[0],
  phone: u.phone ?? fallback?.phone ?? "",
});

const toTokens = (r: AuthResult): Tokens => ({
  access: r.token || r.session.access_token,
  refresh: r.session.refresh_token,
  exp: r.session.expires_at ? r.session.expires_at * 1000 : Date.now() + (r.session.expires_in ?? 3600) * 1000,
});

export type SignUpInput = { name: string; phone: string; email: string; password: string; confirmPassword: string };

type Ctx = {
  user: AppUser | null;
  loading: boolean;
  configured: boolean;
  signIn: (identifier: string, password: string) => Promise<void>;
  signUp: (input: SignUpInput) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  confirmPasswordReset: (email: string, code: string, newPassword: string) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
};

const AuthContext = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const tokens = useRef<Tokens | null>(null);
  const userRef = useRef<AppUser | null>(null);
  const inflight = useRef<Promise<string | null> | null>(null);

  const clear = useCallback(async () => {
    tokens.current = null;
    userRef.current = null;
    await sessionStore.deleteItemAsync(KEY).catch(() => {});
    setScope(null);
    setUser(null);
  }, []);

  const persist = useCallback(async (t: Tokens, u: AppUser) => {
    tokens.current = t;
    userRef.current = u;
    await sessionStore.setItemAsync(KEY, JSON.stringify({ tokens: t, user: u } satisfies Stored)).catch(() => {});
  }, []);

  /** Sign-in / sign-up success: remember the session and switch to this account's local data. */
  const apply = useCallback(async (r: AuthResult) => {
    const u = toUser(r.user);
    await persist(toTokens(r), u);
    setScope(u.uid);
    await adoptGuestEnquiries();
    setUser(u);
  }, [persist]);

  /** One refresh at a time, even when several screens ask for a token together. */
  const refresh = useCallback((): Promise<string | null> => {
    if (inflight.current) return inflight.current;
    const current = tokens.current;
    if (!current) return Promise.resolve(null);
    const run = (async () => {
      try {
        const r = await apiRefresh(current.refresh);
        const u = toUser(r.user, userRef.current ?? undefined);
        await persist(toTokens(r), u);
        setUser((prev) => (prev && prev.name === u.name && prev.phone === u.phone && prev.email === u.email ? prev : u));
        return tokens.current?.access ?? null;
      } catch (e) {
        // Refresh token rejected = signed out for good. Network trouble = keep the session and try later.
        if (e instanceof ApiError && (e.status === 401 || e.status === 403)) await clear();
        throw e;
      } finally {
        inflight.current = null;
      }
    })();
    inflight.current = run;
    return run;
  }, [clear, persist]);

  const getToken = useCallback(async (): Promise<string | null> => {
    const t = tokens.current;
    if (!t) return null;
    if (Date.now() < t.exp - EARLY_MS) return t.access;
    try {
      return await refresh();
    } catch {
      // offline: the old token may still be valid for a moment
      return Date.now() < t.exp ? t.access : null;
    }
  }, [refresh]);

  useEffect(() => {
    setTokenHooks({ getToken, onUnauthorized: () => refresh().catch(() => null) });
    return () => setTokenHooks(null);
  }, [getToken, refresh]);

  // Restore the session on launch: show the saved user at once, renew the token in the background.
  useEffect(() => {
    (async () => {
      try {
        const raw = await sessionStore.getItemAsync(KEY);
        if (raw) {
          const s = JSON.parse(raw) as Stored;
          if (s?.tokens?.refresh && s?.user?.uid) {
            tokens.current = s.tokens;
            userRef.current = s.user;
            setScope(s.user.uid);
            setUser(s.user);
            if (Date.now() >= s.tokens.exp - EARLY_MS) void refresh().catch(() => {});
          }
        }
      } catch {
        /* ignore a damaged session */
      } finally {
        setLoading(false);
      }
    })();
  }, [refresh]);

  const value = useMemo<Ctx>(() => ({
    user, loading, configured: true,
    signIn: async (identifier, password) => {
      try { await apply(await apiSignIn(identifier.trim(), password)); } catch (e) { throw asAuthError(e); }
    },
    signUp: async (input) => {
      try {
        await apply(await apiSignUp({ ...input, name: input.name.trim(), phone: input.phone.trim(), email: input.email.trim() }));
      } catch (e) { throw asAuthError(e); }
    },
    requestPasswordReset: async (email) => {
      try { await apiForgotPassword(email.trim()); } catch (e) { throw asAuthError(e); }
    },
    confirmPasswordReset: async (email, code, newPassword) => {
      try { await apiResetPassword(email.trim(), code.trim(), newPassword); } catch (e) { throw asAuthError(e); }
    },
    signOut: async () => { await clear(); },
    deleteAccount: async (password) => {
      try { await apiDeleteAccount(password); } catch (e) { throw asAuthError(e); }
      await clear();
    },
  }), [user, loading, apply, clear]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const c = useContext(AuthContext);
  if (!c) throw new Error("useAuth must be used inside AuthProvider");
  return c;
}

/** Same rules as the backend, so mistakes are caught before a request is sent. */
export function validatePassword(p: string): string | null {
  if (p.length < 8) return "Password must be at least 8 characters.";
  if (p.length > 72) return "Password must be at most 72 characters.";
  if (!/[A-Za-z]/.test(p)) return "Password must contain at least one letter.";
  if (!/\d/.test(p)) return "Password must contain at least one number.";
  return null;
}
