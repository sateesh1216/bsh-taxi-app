import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Screen } from "../components/Screen";
import { Header } from "../components/Header";
import { Button } from "../components/Button";
import { Field, Segmented } from "../components/Form";
import { AuthError, useAuth, validatePassword } from "../lib/auth";
import { REQUIRE_LOGIN } from "../lib/authConfig";
import { cleanIndianMobile } from "../lib/booking";
import { useT } from "../lib/i18n";
import { colors } from "../theme/colors";
import { fonts } from "../theme/fonts";

type Mode = "in" | "up" | "forgot" | "reset";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const { t } = useT();
  const auth = useAuth();
  const [mode, setMode] = useState<Mode>("in");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const done = () => (router.canGoBack() ? router.back() : router.replace("/"));
  const fail = (e: unknown) => setError(e instanceof AuthError ? e.message : "Something went wrong. Please try again.");
  const go = (m: Mode, keepInfo = false) => { setMode(m); setError(null); if (!keepInfo) setInfo(null); setPassword(""); setConfirm(""); };

  async function run(task: () => Promise<void>) {
    setError(null); setInfo(null); setBusy(true);
    try { await task(); } catch (e) { fail(e); } finally { setBusy(false); }
  }

  const signIn = () => {
    if (!identifier.trim() || !password) return setError(!identifier.trim() ? t("need_identifier") : t("need_fields"));
    return run(async () => { await auth.signIn(identifier, password); done(); });
  };

  const signUp = () => {
    if (name.trim().length < 2) return setError(t("need_name"));
    if (!cleanIndianMobile(phone)) return setError(t("v_mobile"));
    if (!EMAIL_RE.test(email.trim())) return setError(t("need_email"));
    const weak = validatePassword(password);
    if (weak) return setError(weak);
    if (password !== confirm) return setError(t("pw_mismatch"));
    return run(async () => {
      await auth.signUp({ name, phone: cleanIndianMobile(phone) as string, email, password, confirmPassword: confirm });
      done();
    });
  };

  const sendCode = () => {
    if (!EMAIL_RE.test(email.trim())) return setError(t("need_email"));
    return run(async () => { await auth.requestPasswordReset(email); setMode("reset"); setInfo(t("code_sent")); });
  };

  const resetPassword = () => {
    if (!/^\d{6}$/.test(code.trim())) return setError(t("need_code"));
    const weak = validatePassword(password);
    if (weak) return setError(weak);
    if (password !== confirm) return setError(t("pw_mismatch"));
    return run(async () => {
      await auth.confirmPasswordReset(email, code, password);
      setIdentifier(email.trim()); setCode(""); setPassword(""); setConfirm("");
      setMode("in"); setInfo(t("pw_reset_done"));
    });
  };

  const forgotOrReset = mode === "forgot" || mode === "reset";

  return (
    <Screen bottomPad={40}>
      <Header title={forgotOrReset ? t("reset_pw") : t("login_title")} />
      <Text style={s.sub}>{forgotOrReset ? (mode === "forgot" ? t("enter_email") : t("code_sent")) : t("login_sub")}</Text>

      <View style={{ gap: 14, marginTop: 20 }}>
        {!forgotOrReset && (
          <Segmented options={[{ value: "in", label: t("sign_in") }, { value: "up", label: t("create_account") }]} value={mode as "in" | "up"} onChange={(m) => go(m)} />
        )}

        {mode === "up" && (
          <>
            <Field label={t("lbl_fullname")} value={name} onChangeText={setName} placeholder={t("ph_name")} />
            <Field label={t("lbl_mobile")} value={phone} onChangeText={setPhone} placeholder={t("ph_mobile")} keyboardType="phone-pad" autoCapitalize="none" />
            <Field label="Email" value={email} onChangeText={setEmail} placeholder="name@example.com" keyboardType="email-address" autoCapitalize="none" />
            <Field label={t("lbl_password")} value={password} onChangeText={setPassword} placeholder="••••••••" autoCapitalize="none" secure />
            <Field label={t("lbl_confirm_pw")} value={confirm} onChangeText={setConfirm} placeholder="••••••••" autoCapitalize="none" secure />
            <Text style={s.hint}>{t("pw_rules")}</Text>
          </>
        )}

        {mode === "in" && (
          <>
            <Field label={t("lbl_identifier")} value={identifier} onChangeText={setIdentifier} placeholder="name@example.com / 98XXXXXXXX" keyboardType="email-address" autoCapitalize="none" />
            <Field label={t("lbl_password")} value={password} onChangeText={setPassword} placeholder="••••••••" autoCapitalize="none" secure />
          </>
        )}

        {mode === "forgot" && (
          <Field label="Email" value={email} onChangeText={setEmail} placeholder="name@example.com" keyboardType="email-address" autoCapitalize="none" />
        )}

        {mode === "reset" && (
          <>
            <Field label={t("lbl_reset_code")} value={code} onChangeText={(v) => setCode(v.replace(/\D/g, "").slice(0, 6))} placeholder="123456" keyboardType="number-pad" autoCapitalize="none" />
            <Field label={t("lbl_new_pw")} value={password} onChangeText={setPassword} placeholder="••••••••" autoCapitalize="none" secure />
            <Field label={t("lbl_confirm_pw")} value={confirm} onChangeText={setConfirm} placeholder="••••••••" autoCapitalize="none" secure />
            <Text style={s.hint}>{t("pw_rules")}</Text>
          </>
        )}

        {error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
        {info && <Text style={s.info}>{info}</Text>}

        {busy ? <ActivityIndicator color={colors.amber} style={{ minHeight: 52 }} /> : (
          <View style={{ gap: 10 }}>
            {mode === "in" && <Button label={t("sign_in")} onPress={signIn} />}
            {mode === "up" && <Button label={t("create_account")} onPress={signUp} />}
            {mode === "forgot" && <Button label={t("send_code")} onPress={sendCode} />}
            {mode === "reset" && <Button label={t("reset_pw")} onPress={resetPassword} />}
            {mode === "in" && <Button label={t("forgot_pw")} variant="outline" onPress={() => go("forgot")} />}
            {forgotOrReset && <Button label={t("back_to_signin")} variant="outline" onPress={() => go("in")} />}
          </View>
        )}
      </View>

      {!forgotOrReset && (
        <View style={{ marginTop: 20 }}>
          <Button label={REQUIRE_LOGIN ? t("back") : t("continue_guest")} variant="glass" onPress={done} />
        </View>
      )}
    </Screen>
  );
}

const s = StyleSheet.create({
  sub: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.textMuted },
  hint: { fontFamily: fonts.body, fontSize: 12, lineHeight: 18, color: colors.textMuted },
  error: { fontFamily: fonts.semibold, fontSize: 14, color: colors.danger },
  info: { fontFamily: fonts.semibold, fontSize: 14, color: colors.amber },
});
