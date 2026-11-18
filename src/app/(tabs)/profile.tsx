import { useCallback, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Screen } from "../../components/Screen";
import { GlassCard } from "../../components/GlassCard";
import { Button } from "../../components/Button";
import { Segmented } from "../../components/Form";
import { LocationField } from "../../components/Search";
import { callSupport, whatsappSupport } from "../../lib/contact";
import { AuthError, useAuth } from "../../lib/auth";
import { useT } from "../../lib/i18n";
import { setSavedPlaces, syncSavedPlaces } from "../../lib/prefs";
import { popularPickup, GOOGLE_REVIEW_URL } from "../../data/site";
import { SUPPORT_PHONE_DISPLAY } from "../../data/bookingConfig";
import { colors } from "../../theme/colors";
import { fonts } from "../../theme/fonts";

const LINKS = [
  { title: "About us", href: "/about" },
  { title: "Contact", href: "/contact" },
  { title: "Reviews and FAQs", href: "/reviews" },
  { title: "Privacy policy", href: "/legal?type=privacy" },
  { title: "Terms and conditions", href: "/legal?type=terms" },
];

export default function Profile() {
  const { t, lang, setLang } = useT();
  const { user, signOut, deleteAccount } = useAuth();
  const [home, setHome] = useState("");
  const [office, setOffice] = useState("");
  const [savedMsg, setSavedMsg] = useState(false);

  useFocusEffect(useCallback(() => { syncSavedPlaces().then((p) => { setHome(p.home); setOffice(p.office); }); }, [user]));

  async function savePlaces() {
    await setSavedPlaces({ home: home.trim(), office: office.trim() }, user ? { name: user.name, email: user.email } : undefined);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  }

  function confirmDelete() {
    Alert.alert(t("delete_title"), t("delete_body"), [
      { text: t("cancel"), style: "cancel" },
      { text: t("delete"), style: "destructive", onPress: async () => { try { await deleteAccount(); } catch (e) { Alert.alert(e instanceof AuthError ? e.message : "Something went wrong. Please try again."); } } },
    ]);
  }

  return (
    <Screen>
      <Text style={s.title}>{t("profile_title")}</Text>

      {user ? (
        <GlassCard style={s.card}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
            <View style={s.avatar}><Text style={s.initial}>{(user.name || user.email).charAt(0).toUpperCase()}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={s.name}>{user.name}</Text>
              <Text style={s.mail}>{user.email}</Text>
            </View>
          </View>
          <Button label={t("sign_out")} variant="glass" onPress={signOut} />
        </GlassCard>
      ) : (
        <GlassCard style={s.card}>
          <Text style={s.mail}>{t("sign_in_cta")}</Text>
          <Button label={t("sign_in")} onPress={() => router.push("/login")} />
        </GlassCard>
      )}

      <GlassCard style={[s.card, { marginTop: 16 }]}>
        <Text style={s.label}>{t("saved_places").toUpperCase()}</Text>
        <LocationField label={t("place_home")} value={home} onChangeText={setHome} placeholder={t("ph_place")} popular={popularPickup} limitToVizag />
        <LocationField label={t("place_office")} value={office} onChangeText={setOffice} placeholder={t("ph_place")} popular={popularPickup} limitToVizag />
        <Button label={savedMsg ? t("saved") : t("save")} variant="glass" onPress={savePlaces} />
      </GlassCard>

      <View style={{ marginTop: 16, gap: 8 }}>
        <Text style={s.label}>{t("language").toUpperCase()}</Text>
        <Segmented options={[{ value: "en", label: "English" }, { value: "te", label: "తెలుగు" }]} value={lang} onChange={setLang} />
      </View>

      <GlassCard style={[s.card, { marginTop: 16 }]}>
        <Text style={s.label}>{t("support_247")}</Text>
        <Text style={s.phone}>{SUPPORT_PHONE_DISPLAY}</Text>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Button label={t("call_us")} onPress={callSupport} style={{ flex: 1 }} />
          <Button label={t("whatsapp")} variant="glass" onPress={() => whatsappSupport()} style={{ flex: 1 }} />
        </View>
      </GlassCard>

      <GlassCard style={{ marginTop: 16, paddingHorizontal: 16 }}>
        {LINKS.map((l, i) => (
          <Pressable key={l.title} accessibilityRole="button" onPress={() => router.push(l.href as never)} style={[s.link, i > 0 && { borderTopWidth: 1, borderTopColor: colors.divider }]}>
            <Text style={s.linkText}>{l.title}</Text>
          </Pressable>
        ))}
      </GlassCard>

      {user && <Button label={t("delete_account")} variant="outline" onPress={confirmDelete} style={{ marginTop: 16 }} />}
      <Text style={s.note}>Website content (destinations, fares) is shown in English.</Text>
    </Screen>
  );
}

const s = StyleSheet.create({
  title: { fontFamily: fonts.heading, fontSize: 28, color: colors.white, marginBottom: 16 },
  card: { padding: 18, gap: 14 },
  label: { fontFamily: fonts.bold, fontSize: 12, letterSpacing: 2, color: colors.amber },
  phone: { fontFamily: fonts.heading, fontSize: 24, color: colors.white },
  avatar: { width: 54, height: 54, borderRadius: 27, backgroundColor: colors.amber, alignItems: "center", justifyContent: "center" },
  initial: { fontFamily: fonts.heading, fontSize: 22, color: colors.navy },
  name: { fontFamily: fonts.heading, fontSize: 20, color: colors.white },
  mail: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: colors.textMuted },
  link: { minHeight: 54, justifyContent: "center" },
  linkText: { fontFamily: fonts.semibold, fontSize: 15, color: colors.white },
  note: { marginTop: 16, fontFamily: fonts.body, fontSize: 12, lineHeight: 18, color: colors.textMuted },
});
