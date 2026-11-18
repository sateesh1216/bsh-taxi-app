import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Screen } from "../components/Screen";
import { Header } from "../components/Header";
import { GlassCard } from "../components/GlassCard";
import { Button } from "../components/Button";
import { Field, Segmented } from "../components/Form";
import { GoogleButton } from "../components/GoogleButton";
import { AuthError, useAuth } from "../lib/auth";
import { googleEnabled } from "../lib/authConfig";
import { useT } from "../lib/i18n";
import { colors } from "../theme/colors";
import { fonts } from "../theme/fonts";

export default function Login() {
  const { t } = useT();
  const auth = useAuth();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const done = () => (router.canGoBack() ? router.back() : router.replace("/"));
  const fail = (e: unknown) => setError(e instanceof AuthError ? e.message : "Something went wrong. Please try again.");

  async function submit() {
    setError(null); setInfo(null);
    if (!email.trim() || !password) return setError(t("need_fields"));
    if (mode === "up" && name.trim().length < 2) return setError(t("need_name"));
    setBusy(true);
    try {
      if (mode === "up") await auth.signUp(name, email, password); else await auth.signIn(email, password);
      done();
    } catch (e) { fail(e); } finally { setBusy(false); }
  }

  async function forgot() {
    setError(null); setInfo(null);
    if (!email.trim()) return setError(t("enter_email"));
    setBusy(true);
    try { await auth.resetPassword(email); setInfo(t("reset_sent")); } catch (e) { fail(e); } finally { setBusy(false); }
  }

  async function google(idToken: string) {
    setError(null); setBusy(true);
    try { await auth.signInWithGoogle(idToken); done(); } catch (e) { fail(e); } finally { setBusy(false); }
  }

  return (
    <Screen bottomPad={40}>
      <Header eyebrow="BSH TAXI SERVICES" title={t("login_title")} />
      <Text style={s.sub}>{t("login_sub")}</Text>

      {!auth.configured ? (
        <GlassCard style={{ padding: 16, marginTop: 20, gap: 8 }}>
          <Text style={s.setupTitle}>Accounts are not turned on yet</Text>
          <Text style={s.sub}>{t("not_configured")}</Text>
          <Text style={s.sub}>{"Owner setup (about 10 minutes, see SETUP_ACCOUNTS.md):\n1. Create a Firebase project and enable Email/Password sign-in.\n2. Create a Firestore database and publish firestore.rules.\n3. Put the Web API key and Project ID in .env as EXPO_PUBLIC_FIREBASE_API_KEY and EXPO_PUBLIC_FIREBASE_PROJECT_ID.\n4. Restart with: npx expo start -c"}</Text>
        </GlassCard>
      ) : (
        <View style={{ gap: 14, marginTop: 20 }}>
          <Segmented options={[{ value: "in", label: t("sign_in") }, { value: "up", label: t("create_account") }]} value={mode} onChange={(m) => { setMode(m); setError(null); setInfo(null); }} />
          {mode === "up" && <Field label={t("lbl_fullname")} value={name} onChangeText={setName} placeholder={t("ph_name")} />}
          <Field label="Email" value={email} onChangeText={setEmail} placeholder="name@example.com" keyboardType="email-address" autoCapitalize="none" />
          <Field label={t("lbl_password")} value={password} onChangeText={setPassword} placeholder="••••••" autoCapitalize="none" secure />
          {error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
          {info && <Text style={s.info}>{info}</Text>}
          {busy ? <ActivityIndicator color={colors.amber} style={{ minHeight: 52 }} /> : (
            <View style={{ gap: 10 }}>
              <Button label={mode === "up" ? t("create_account") : t("sign_in")} onPress={submit} />
              {googleEnabled && <GoogleButton label={t("continue_google")} onToken={google} onError={(m) => setError(m)} />}
              {mode === "in" && <Button label={t("forgot_pw")} variant="outline" onPress={forgot} />}
            </View>
          )}
        </View>
      )}

      <View style={{ marginTop: 20 }}>
        <Button label={t("continue_guest")} variant="glass" onPress={done} />
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  sub: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.textMuted },
  setupTitle: { fontFamily: fonts.heading, fontSize: 17, color: colors.white },
  error: { fontFamily: fonts.semibold, fontSize: 14, color: colors.danger },
  info: { fontFamily: fonts.semibold, fontSize: 14, color: colors.amber },
});
