import { useCallback, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Screen } from "../../components/Screen";
import { GlassCard } from "../../components/GlassCard";
import { Button } from "../../components/Button";
import { Field, Segmented } from "../../components/Form";
import { LocationField } from "../../components/Search";
import { callSupport, whatsappSupport } from "../../lib/contact";
import { AuthError, useAuth } from "../../lib/auth";
import { useT } from "../../lib/i18n";
import { setSavedPlaces, syncSavedPlaces } from "../../lib/prefs";
import { popularPickup } from "../../data/site";
import { SUPPORT_PHONE_DISPLAY } from "../../data/bookingConfig";
import { colors } from "../../theme/colors";
import { fonts } from "../../theme/fonts";

type IconName = keyof typeof Ionicons.glyphMap;

const QUICK_LINKS: { title: string; subtitle: string; icon: IconName; action: () => void }[] = [
  { title: "My bookings", subtitle: "View trips & book again", icon: "receipt-outline", action: () => router.push("/bookings") },
  { title: "Offers", subtitle: "Check current offers", icon: "pricetag-outline", action: () => router.push("/offers") },
  { title: "Our fleet", subtitle: "Choose your cab", icon: "car-sport-outline", action: () => router.push("/fleet") },
  { title: "Explore services", subtitle: "Airport, tours & outstation", icon: "compass-outline", action: () => router.push("/explore") },
];

const INFO_LINKS: { title: string; subtitle: string; icon: IconName; href: string }[] = [
  { title: "About BSH Taxi", subtitle: "Know more about our service", icon: "information-circle-outline", href: "/about" },
  { title: "Contact & support", subtitle: "Talk to our team", icon: "call-outline", href: "/contact" },
  { title: "Reviews & FAQs", subtitle: "Customer feedback and answers", icon: "star-outline", href: "/reviews" },
  { title: "Privacy policy", subtitle: "How your information is handled", icon: "shield-checkmark-outline", href: "/legal?type=privacy" },
  { title: "Terms & conditions", subtitle: "Booking terms and policies", icon: "document-text-outline", href: "/legal?type=terms" },
];

function initials(name: string, email: string) {
  const value = (name || email || "G").trim();
  return value.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

export default function Profile() {
  const { t, lang, setLang } = useT();
  const { user, signOut, deleteAccount } = useAuth();
  const [home, setHome] = useState("");
  const [office, setOffice] = useState("");
  const [savedMsg, setSavedMsg] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletePw, setDeletePw] = useState("");

  useFocusEffect(useCallback(() => {
    let active = true;
    syncSavedPlaces().then((p) => {
      if (active) { setHome(p.home); setOffice(p.office); }
    }).catch(() => {});
    return () => { active = false; };
  }, [user]));

  async function savePlaces() {
    setSaving(true);
    try {
      await setSavedPlaces(
        { home: home.trim(), office: office.trim() },
        user ? { name: user.name, email: user.email } : undefined,
      );
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 2200);
    } catch {
      Alert.alert("Could not save addresses", "Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function confirmSignOut() {
    Alert.alert("Sign out?", "You can sign in again to access your account.", [
      { text: t("cancel"), style: "cancel" },
      { text: t("sign_out"), style: "destructive", onPress: () => { void signOut(); } },
    ]);
  }

  function confirmDelete() {
    if (!deletePw) return Alert.alert("Enter your password", "We need your password to delete your account.");
    Alert.alert(t("delete_title"), t("delete_body"), [
      { text: t("cancel"), style: "cancel" },
      { text: t("delete"), style: "destructive", onPress: async () => {
        try { await deleteAccount(deletePw); }
        catch (e) { Alert.alert(e instanceof AuthError ? e.message : "Something went wrong. Please try again."); }
      } },
    ]);
  }

  return (
    <Screen>
      <View style={s.header}>
        <View>
          <Text style={s.eyebrow}>BSH TAXI SERVICES</Text>
          <Text style={s.title}>{t("profile_title")}</Text>
          <Text style={s.subtitle}>{t("profile_subtitle")}</Text>
        </View>
        <View style={s.headerIcon}><Ionicons name="person-circle-outline" size={29} color={colors.blue} /></View>
      </View>

      {user ? (
        <GlassCard style={s.accountCard}>
          <View style={s.accountTop}>
            <View style={s.avatar}><Text style={s.initial}>{initials(user.name, user.email)}</Text></View>
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={s.name}>{user.name || "BSH Taxi customer"}</Text>
              <Text style={s.mail}>{user.email}</Text>
              {user.phone ? <Text style={s.mail}>{user.phone}</Text> : null}
              <View style={s.memberTag}><Ionicons name="shield-checkmark" size={12} color="#1570EF" /><Text style={s.memberText}>Signed in</Text></View>
            </View>
          </View>
          <View style={s.accountDivider} />
          <Text style={s.accountHint}>Your bookings are saved in this account. Sign in on any phone to see them, track your trip and pay online.</Text>
          <Button label={t("sign_out")} variant="outline" onPress={confirmSignOut} />
        </GlassCard>
      ) : (
        <GlassCard style={s.guestCard}>
          <View style={s.guestIcon}><Ionicons name="person-outline" size={25} color={colors.blue} /></View>
          <Text style={s.cardTitle}>Welcome to BSH Taxi</Text>
          <Text style={s.copy}>Sign in to keep your profile and saved places together across supported devices. You can also continue booking as a guest.</Text>
          <Button label={t("sign_in")} onPress={() => router.push("/login")} />
        </GlassCard>
      )}

      <View style={s.sectionHead}>
        <Text style={s.sectionTitle}>{t("quick_access")}</Text>
        <Text style={s.sectionHint}>{t("quick_access_hint")}</Text>
      </View>
      <View style={s.quickGrid}>
        {QUICK_LINKS.map((item) => (
          <Pressable key={item.title} accessibilityRole="button" accessibilityLabel={item.title} onPress={item.action} style={({ pressed }) => [s.quickCell, pressed && { opacity: 0.78 }]}>
            <GlassCard style={s.quickCard}>
              <View style={s.quickIcon}><Ionicons name={item.icon} size={21} color={colors.blue} /></View>
              <Text style={s.quickTitle}>{item.title}</Text>
              <Text style={s.quickSub}>{item.subtitle}</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.blue} style={{ marginTop: 8 }} />
            </GlassCard>
          </Pressable>
        ))}
      </View>

      <View style={s.sectionHead}>
        <Text style={s.sectionTitle}>{t("saved_addresses")}</Text>
        <Text style={s.sectionHint}>{t("saved_addresses_hint")}</Text>
      </View>
      <GlassCard style={s.card}>
        <View style={s.fieldHeading}><View style={s.addressIcon}><Ionicons name="home-outline" size={17} color={colors.blue} /></View><Text style={s.fieldTitle}>{t("home_address")}</Text></View>
        <LocationField label="" value={home} onChangeText={setHome} placeholder="Add your home pickup address" popular={popularPickup} limitToVizag />
        <View style={s.fieldHeading}><View style={s.addressIcon}><Ionicons name="briefcase-outline" size={17} color={colors.blue} /></View><Text style={s.fieldTitle}>{t("office_address")}</Text></View>
        <LocationField label="" value={office} onChangeText={setOffice} placeholder="Add your office pickup address" popular={popularPickup} limitToVizag />
        <Button label={saving ? "Saving..." : savedMsg ? "Addresses saved" : "Save addresses"} onPress={savePlaces} disabled={saving} />
        <Text style={s.helper}>Saved addresses are shortcuts for future bookings. Check the pickup point before confirming each ride.</Text>
      </GlassCard>

      <View style={s.sectionHead}>
        <Text style={s.sectionTitle}>{t("app_preferences")}</Text>
        <Text style={s.sectionHint}>{t("app_preferences_hint")}</Text>
      </View>
      <GlassCard style={s.card}>
        <View style={s.preferenceHead}>
          <View style={s.preferenceIcon}><Ionicons name="language-outline" size={19} color={colors.blue} /></View>
          <View style={{ flex: 1 }}>
            <Text style={s.fieldTitle}>App language</Text>
            <Text style={s.helper}>{t("language_hint")}</Text>
          </View>
        </View>
        <Segmented
          options={[
            { value: "en", label: t("language_english") },
            { value: "te", label: t("language_telugu") },
            { value: "hi", label: t("language_hindi") },
          ]}
          value={lang}
          onChange={setLang}
        />
      </GlassCard>

      <View style={s.sectionHead}>
        <Text style={s.sectionTitle}>{t("help_support")}</Text>
        <Text style={s.sectionHint}>We are here when you need us</Text>
      </View>
      <GlassCard style={s.supportCard}>
        <View style={s.supportTop}>
          <View style={s.supportIcon}><Ionicons name="headset-outline" size={23} color={colors.blue} /></View>
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={s.cardTitle}>24/7 customer support</Text>
            <Text style={s.copy}>Call or message our team for booking assistance.</Text>
            <Text style={s.phone}>{SUPPORT_PHONE_DISPLAY}</Text>
          </View>
        </View>
        <View style={s.supportActions}>
          <Button label="Call us" onPress={callSupport} style={{ flex: 1 }} />
          <Button label="WhatsApp" variant="outline" onPress={() => whatsappSupport()} style={{ flex: 1 }} />
        </View>
      </GlassCard>

      <View style={s.sectionHead}>
        <Text style={s.sectionTitle}>{t("information")}</Text>
        <Text style={s.sectionHint}>Company details and policies</Text>
      </View>
      <GlassCard style={s.linkCard}>
        {INFO_LINKS.map((item, index) => (
          <Pressable key={item.title} accessibilityRole="button" onPress={() => router.push(item.href as never)} style={[s.infoLink, index > 0 && s.linkBorder]}>
            <View style={s.infoIcon}><Ionicons name={item.icon} size={19} color={colors.blue} /></View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={s.linkTitle}>{item.title}</Text>
              <Text style={s.linkSub}>{item.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#98A2B3" />
          </Pressable>
        ))}
      </GlassCard>

      {user ? (
        <View style={s.dangerArea}>
          <Text style={s.dangerTitle}>{t("account_management")}</Text>
          <Text style={s.helper}>You can sign out from this device or request permanent account deletion.</Text>
          {deleting ? (
            <>
              <Field label={t("lbl_password")} value={deletePw} onChangeText={setDeletePw} placeholder="••••••••" autoCapitalize="none" secure />
              <Button label={t("delete")} variant="outline" onPress={confirmDelete} />
              <Button label={t("cancel")} variant="glass" onPress={() => { setDeleting(false); setDeletePw(""); }} />
            </>
          ) : (
            <Button label={t("delete_account")} variant="outline" onPress={() => setDeleting(true)} />
          )}
        </View>
      ) : null}

      <Text style={s.footer}>BSH Taxi Services · Visakhapatnam{"\n"}Travel comfortably. Travel confidently.</Text>
    </Screen>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 18 },
  eyebrow: { fontFamily: fonts.bold, fontSize: 10, letterSpacing: 2, color: colors.blue },
  title: { marginTop: 5, fontFamily: fonts.heading, fontSize: 30, color: "#101828" },
  subtitle: { marginTop: 4, fontFamily: fonts.body, fontSize: 13, color: colors.textMuted },
  headerIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: "#EFF5FF", alignItems: "center", justifyContent: "center" },
  accountCard: { padding: 18, gap: 13, backgroundColor: "#FFFFFF" },
  accountTop: { flexDirection: "row", alignItems: "center", gap: 13 },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: "#EFF5FF", borderWidth: 1, borderColor: "#D6E4FF", alignItems: "center", justifyContent: "center" },
  initial: { fontFamily: fonts.heading, fontSize: 23, color: colors.blue },
  name: { fontFamily: fonts.heading, fontSize: 19, color: "#101828" },
  mail: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted },
  memberTag: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", gap: 4, marginTop: 3, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, backgroundColor: "#EFF5FF" },
  memberText: { fontFamily: fonts.semibold, fontSize: 10, color: colors.blue },
  accountDivider: { height: 1, backgroundColor: colors.divider },
  accountHint: { fontFamily: fonts.body, fontSize: 12, lineHeight: 18, color: colors.textMuted },
  guestCard: { padding: 18, gap: 10, backgroundColor: "#FFFFFF" },
  guestIcon: { width: 48, height: 48, borderRadius: 15, backgroundColor: "#EFF5FF", alignItems: "center", justifyContent: "center" },
  cardTitle: { fontFamily: fonts.heading, fontSize: 17, color: "#101828" },
  copy: { fontFamily: fonts.body, fontSize: 13, lineHeight: 19, color: colors.textMuted },
  sectionHead: { marginTop: 24, marginBottom: 11, gap: 3 },
  sectionTitle: { fontFamily: fonts.heading, fontSize: 20, color: "#101828" },
  sectionHint: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  quickCell: { width: "48.5%" },
  quickCard: { minHeight: 145, padding: 13, backgroundColor: "#FFFFFF" },
  quickIcon: { width: 39, height: 39, borderRadius: 13, backgroundColor: "#EFF5FF", alignItems: "center", justifyContent: "center", marginBottom: 9 },
  quickTitle: { fontFamily: fonts.semibold, fontSize: 14, color: "#101828" },
  quickSub: { marginTop: 3, fontFamily: fonts.body, fontSize: 11, lineHeight: 16, color: colors.textMuted },
  card: { padding: 16, gap: 12, backgroundColor: "#FFFFFF" },
  fieldHeading: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 },
  addressIcon: { width: 29, height: 29, borderRadius: 9, backgroundColor: "#EFF5FF", alignItems: "center", justifyContent: "center" },
  fieldTitle: { fontFamily: fonts.semibold, fontSize: 14, color: "#101828" },
  helper: { fontFamily: fonts.body, fontSize: 11, lineHeight: 17, color: colors.textMuted },
  preferenceHead: { flexDirection: "row", alignItems: "center", gap: 10 },
  preferenceIcon: { width: 40, height: 40, borderRadius: 13, backgroundColor: "#EFF5FF", alignItems: "center", justifyContent: "center" },
  supportCard: { padding: 16, gap: 14, backgroundColor: "#FFFFFF" },
  supportTop: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  supportIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: "#EFF5FF", alignItems: "center", justifyContent: "center" },
  phone: { marginTop: 4, fontFamily: fonts.heading, fontSize: 20, color: "#101828" },
  supportActions: { flexDirection: "row", gap: 9 },
  linkCard: { paddingHorizontal: 14, backgroundColor: "#FFFFFF" },
  infoLink: { minHeight: 66, flexDirection: "row", alignItems: "center", gap: 11 },
  linkBorder: { borderTopWidth: 1, borderTopColor: colors.divider },
  infoIcon: { width: 36, height: 36, borderRadius: 11, backgroundColor: "#F2F4F7", alignItems: "center", justifyContent: "center" },
  linkTitle: { fontFamily: fonts.semibold, fontSize: 13, color: "#101828" },
  linkSub: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted },
  dangerArea: { marginTop: 22, padding: 16, borderWidth: 1, borderColor: "#FEE4E2", borderRadius: 18, gap: 10, backgroundColor: "#FFFBFA" },
  dangerTitle: { fontFamily: fonts.semibold, fontSize: 14, color: "#B42318" },
  footer: { marginTop: 24, marginBottom: 10, textAlign: "center", fontFamily: fonts.body, fontSize: 11, lineHeight: 18, color: colors.textMuted },
});
