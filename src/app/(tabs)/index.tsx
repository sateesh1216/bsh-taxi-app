import { useCallback, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Screen } from "../../components/Screen";
import { GlassCard } from "../../components/GlassCard";
import { Button } from "../../components/Button";
import { ImageCard } from "../../components/Content";
import { callSupport, whatsappSupport } from "../../lib/contact";
import { destinations } from "../../data/site";
import { useAuth } from "../../lib/auth";
import { useT, type Key } from "../../lib/i18n";
import { getSavedPlaces, type SavedPlaces } from "../../lib/prefs";
import { listEnquiries, type SavedEnquiry } from "../../lib/storage";
import { colors } from "../../theme/colors";
import { fonts } from "../../theme/fonts";

type Icon = keyof typeof Ionicons.glyphMap;
const TILES: { type: "local" | "outstation" | "airport" | "tour"; key: Key; icon: Icon }[] = [
  { type: "local", key: "svc_local", icon: "car-sport" },
  { type: "outstation", key: "svc_outstation", icon: "navigate" },
  { type: "airport", key: "svc_airport", icon: "airplane" },
  { type: "tour", key: "svc_tours", icon: "map" },
];

export default function Home() {
  const { t } = useT();
  const { user } = useAuth();
  const [saved, setSaved] = useState<SavedPlaces>({ home: "", office: "" });
  const [last, setLast] = useState<SavedEnquiry | null>(null);

  useFocusEffect(useCallback(() => {
    getSavedPlaces().then(setSaved);
    listEnquiries().then((l) => setLast(l[0] ?? null));
  }, [user]));

  const first = user ? (user.name || user.email).split(" ")[0] : "";
  const lastRoute = last ? last.rows.filter((r) => ["Pickup", "From", "To", "Package"].includes(r.label)).map((r) => r.value).join(" → ") : "";

  return (
    <Screen>
      <View style={s.top}>
        <Image source={require("../../../assets/images/logo-light.png")} style={s.logo} resizeMode="contain" accessibilityLabel="BSH Taxi Services" />
        {user ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Profile" onPress={() => router.push("/profile")} style={s.avatar}><Text style={s.initial}>{(user.name || user.email).charAt(0).toUpperCase()}</Text></Pressable>
        ) : (
          <Pressable accessibilityRole="button" onPress={() => router.push("/login")} style={s.signin}><Text style={s.signinText}>{t("sign_in_short")}</Text></Pressable>
        )}
      </View>

      <Text style={s.eyebrow}>{user ? `${t("hi")}, ${first}` : t("home_eyebrow")}</Text>
      <Text style={s.h1}>{t("where_to")}</Text>

      <Pressable accessibilityRole="button" accessibilityLabel={t("plan_trip")} onPress={() => router.push("/book?type=outstation")} style={{ marginTop: 18 }}>
        <GlassCard strong r={20} style={s.search}>
          <Ionicons name="search" size={22} color={colors.amber} />
          <View style={{ flex: 1 }}>
            <Text style={s.searchTitle}>{t("plan_trip")}</Text>
            <Text style={s.searchSub}>{t("home_eyebrow")}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </GlassCard>
      </Pressable>

      <View style={s.tiles}>
        {TILES.map((x) => (
          <Pressable key={x.type} accessibilityRole="button" accessibilityLabel={t(x.key)} onPress={() => router.push(`/book?type=${x.type}`)} style={s.tileWrap}>
            <GlassCard r={20} style={s.tile}>
              <View style={s.tileIcon}><Ionicons name={x.icon} size={26} color={colors.navy} /></View>
              <Text style={s.tileText}>{t(x.key)}</Text>
            </GlassCard>
          </Pressable>
        ))}
      </View>

      {(saved.home || saved.office) ? (
        <View style={s.pills}>
          {saved.home ? <Pressable accessibilityRole="button" onPress={() => router.push(`/book?type=local&pickup=${encodeURIComponent(saved.home)}`)} style={s.pill}><Ionicons name="home" size={16} color={colors.amber} /><Text style={s.pillText}>{t("place_home")}</Text></Pressable> : null}
          {saved.office ? <Pressable accessibilityRole="button" onPress={() => router.push(`/book?type=local&pickup=${encodeURIComponent(saved.office)}`)} style={s.pill}><Ionicons name="briefcase" size={16} color={colors.amber} /><Text style={s.pillText}>{t("place_office")}</Text></Pressable> : null}
        </View>
      ) : null}

      {last ? (
        <>
          <Text style={s.h2}>{t("last_booking")}</Text>
          <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: "/confirmed", params: { number: last.number } })}>
            <GlassCard style={{ padding: 16, gap: 4 }}>
              <Text style={s.lastTitle}>{last.title}</Text>
              <Text style={s.lastSub}>{lastRoute}</Text>
              <Button label={t("rebook")} variant="glass" onPress={() => router.push("/book?type=outstation")} style={{ marginTop: 10 }} />
            </GlassCard>
          </Pressable>
        </>
      ) : null}

      <View style={s.rowHead}>
        <Text style={[s.h2, { marginTop: 0, marginBottom: 0 }]}>{t("popular_trips")}</Text>
        <Pressable accessibilityRole="button" onPress={() => router.push("/destinations")} hitSlop={10}><Text style={s.more}>{t("see_all")}</Text></Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
        {destinations.slice(0, 6).map((d) => <View key={d.slug} style={{ width: 240 }}><ImageCard title={d.name} subtitle={[d.distanceKm ? `${d.distanceKm} km` : null, d.driveTime].filter(Boolean).join(" · ")} image={d.image} height={150} onPress={() => router.push(`/destinations/${d.slug}`)} /></View>)}
      </ScrollView>

      <Button label={t("explore_more")} variant="glass" onPress={() => router.push("/explore")} style={{ marginTop: 16 }} />

      <GlassCard strong style={s.help}>
        <Text style={s.helpText}>{t("help_title")}</Text>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Button label={t("call_now")} onPress={callSupport} style={{ flex: 1 }} />
          <Button label={t("whatsapp")} variant="outline" onPress={() => whatsappSupport()} style={{ flex: 1 }} />
        </View>
      </GlassCard>
    </Screen>
  );
}

const s = StyleSheet.create({
  top: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  logo: { height: 36, width: 98 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.amber, alignItems: "center", justifyContent: "center" },
  initial: { fontFamily: fonts.heading, fontSize: 18, color: colors.navy },
  signin: { minHeight: 44, paddingHorizontal: 18, borderRadius: 22, justifyContent: "center", backgroundColor: colors.amber },
  signinText: { fontFamily: fonts.bold, fontSize: 14, color: colors.navy },
  eyebrow: { marginTop: 24, fontFamily: fonts.bold, fontSize: 13, letterSpacing: 2, color: colors.amber },
  h1: { marginTop: 6, fontFamily: fonts.heading, fontSize: 38, lineHeight: 42, color: colors.white },
  search: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 18, minHeight: 68 },
  searchTitle: { fontFamily: fonts.bold, fontSize: 17, color: colors.white },
  searchSub: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted },
  tiles: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 14 },
  tileWrap: { width: "48%", flexGrow: 1 },
  tile: { minHeight: 104, padding: 16, justifyContent: "space-between" },
  tileIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.amber, alignItems: "center", justifyContent: "center" },
  tileText: { marginTop: 10, fontFamily: fonts.heading, fontSize: 18, color: colors.white },
  pills: { flexDirection: "row", gap: 10, marginTop: 16 },
  pill: { minHeight: 44, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, borderRadius: 22, backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.glassBorder },
  pillText: { fontFamily: fonts.semibold, fontSize: 14, color: colors.white },
  rowHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 26, marginBottom: 10 },
  h2: { marginTop: 26, marginBottom: 10, fontFamily: fonts.heading, fontSize: 21, color: colors.white },
  more: { fontFamily: fonts.semibold, fontSize: 14, color: colors.amber },
  lastTitle: { fontFamily: fonts.heading, fontSize: 18, color: colors.white },
  lastSub: { fontFamily: fonts.body, fontSize: 14, color: colors.textMuted },
  help: { marginTop: 24, padding: 16, gap: 12 },
  helpText: { fontFamily: fonts.semibold, fontSize: 14, color: colors.white },

});
