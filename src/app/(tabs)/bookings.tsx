import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useFocusEffect } from "expo-router";
import { Screen } from "../../components/Screen";
import { GlassCard } from "../../components/GlassCard";
import { Button } from "../../components/Button";
import { cacheBookings, listEnquiries, type SavedEnquiry } from "../../lib/storage";
import { listMyBookings } from "../../lib/api";
import { PAYMENT_LABEL, statusLabel, toSaved } from "../../lib/bookings";
import { formatCurrency } from "../../lib/booking";
import { useT } from "../../lib/i18n";
import { useAuth } from "../../lib/auth";
import { colors } from "../../theme/colors";
import { fonts } from "../../theme/fonts";

export default function Bookings() {
  const { t } = useT();
  const [items, setItems] = useState<SavedEnquiry[]>([]);
  const [synced, setSynced] = useState(false);
  const [offline, setOffline] = useState(false);
  const { user } = useAuth();

  // Signed in: the real list comes from the server (status, driver, payments update live).
  // The saved copy is shown first so the screen is never empty while loading or offline.
  const load = useCallback(async () => {
    setItems(await listEnquiries());
    if (!user) { setSynced(false); setOffline(false); return; }
    try {
      const fresh = (await listMyBookings()).map(toSaved);
      await cacheBookings(fresh);
      setItems(fresh); setSynced(true); setOffline(false);
    } catch {
      setSynced(false); setOffline(true);
    }
  }, [user]);

  useFocusEffect(useCallback(() => {
    void load();
    const timer = setInterval(() => { void load(); }, 20_000);
    return () => clearInterval(timer);
  }, [load]));

  const open = (e: SavedEnquiry) =>
    e.id ? router.push({ pathname: "/booking-details", params: { id: e.id } }) : router.push({ pathname: "/confirmed", params: { number: e.number } });

  return (
    <Screen>
      <Text style={s.title} accessibilityRole="header">{t("my_bookings")}</Text>
      {user ? (
        <View style={[s.banner, offline && s.bannerWarn]}>
          <Ionicons name={offline ? "cloud-offline-outline" : "checkmark-circle"} size={16} color={offline ? colors.taxiDeep : colors.success} />
          <Text style={[s.bannerText, offline && { color: colors.taxiDeep }]}>{offline ? "You are offline. Showing your last saved bookings." : synced ? t("saved_account") : t("saved_phone")}</Text>
        </View>
      ) : (
        <GlassCard strong r={22} style={{ padding: 16, gap: 12, marginBottom: 16 }}>
          <Text style={s.body}>{t("signin_keep")}</Text>
          <Button label={t("sign_in")} onPress={() => router.push("/login")} />
        </GlassCard>
      )}
      {items.length === 0 ? (
        <GlassCard r={24} style={{ padding: 24, gap: 16, alignItems: "center" }}>
          <View style={s.emptyIcon}><Ionicons name="car-sport-outline" size={30} color={colors.blue} /></View>
          <Text style={[s.body, { textAlign: "center" }]}>{t("no_bookings")}</Text>
          <Button label={t("book_ride")} variant="taxi" onPress={() => router.push("/book")} style={{ alignSelf: "stretch" }} />
        </GlassCard>
      ) : (
        <View style={{ gap: 12 }}>
          {items.map((e, index) => {
            const rows = Array.isArray(e?.rows) ? e.rows : [];
            const stops = rows
              .filter((r) => ["Pickup", "From", "To", "Package"].includes(r?.label))
              .map((r) => r?.value)
              .filter(Boolean);
            const num = typeof e?.number === "string" ? e.number : String(e?.number ?? "");
            const isLocal = num.startsWith("local-");
            const dateStr = e?.createdAt
              ? new Date(e.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
              : "";
            const key = num || `booking-${index}`;
            return (
              <Pressable key={key} accessibilityRole="button" onPress={() => open(e)} style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.99 : 1 }] })}>
                <GlassCard r={24} style={{ padding: 16 }}>
                  <View style={s.row}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.kind}>{e?.title || "Booking"}</Text>
                      <Text style={s.meta}>{isLocal || !num ? "" : `Enquiry no. ${num} · `}{dateStr}</Text>
                    </View>
                    <Text style={s.fare}>{e?.fare !== null && e?.fare !== undefined ? formatCurrency(e.fare) : "On call"}</Text>
                  </View>
                  {stops.length > 0 ? (
                    <View style={s.route}>
                      {stops.slice(0, 3).map((stop, i, arr) => (
                        <View key={`${stop}-${i}`} style={s.stopRow}>
                          <View style={s.rail}>
                            <View style={i === arr.length - 1 && arr.length > 1 ? s.stopSquare : s.stopDot} />
                            {i < arr.length - 1 ? <View style={s.railLine} /> : null}
                          </View>
                          <Text style={s.stopText} numberOfLines={1}>{stop}</Text>
                        </View>
                      ))}
                    </View>
                  ) : null}
                  <View style={s.chips}>
                    <Text style={[s.chip, e.status === "cancelled" && s.chipBad, e.status === "confirmed" && s.chipGood, e.status === "completed" && s.chipGood]}>{statusLabel(e.status)}</Text>
                    {e.paymentStatus ? <Text style={[s.chip, e.paymentStatus === "paid" && s.chipGood]}>{PAYMENT_LABEL[e.paymentStatus] ?? e.paymentStatus}</Text> : null}
                  </View>
                  <View style={s.actions}>
                    <Button label="View details" variant="glass" onPress={() => open(e)} style={{ flex: 1, minHeight: 46 }} />
                    <Button label="Book again" variant="primary" onPress={() => router.push({ pathname: "/book", params: { rebook: num } })} style={{ flex: 1, minHeight: 46 }} />
                  </View>
                </GlassCard>
              </Pressable>
            );
          })}
        </View>
      )}
    </Screen>
  );
}

const s = StyleSheet.create({
  title: { fontFamily: fonts.heading, fontSize: 32, color: colors.heading, marginBottom: 14 },
  banner: { flexDirection: "row", alignItems: "center", gap: 8, alignSelf: "flex-start", marginBottom: 16, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, backgroundColor: colors.successSoft },
  bannerWarn: { backgroundColor: colors.taxiSoft },
  bannerText: { fontFamily: fonts.semibold, fontSize: 12.5, color: colors.success },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.body },
  emptyIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: "#EAF1FF", alignItems: "center", justifyContent: "center" },
  row: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
  kind: { fontFamily: fonts.heading, fontSize: 18, color: colors.heading },
  fare: { fontFamily: fonts.heading, fontSize: 18, color: colors.heading },
  meta: { marginTop: 3, fontFamily: fonts.body, fontSize: 12, color: colors.textMuted },
  route: { marginTop: 14 },
  stopRow: { flexDirection: "row", alignItems: "stretch", gap: 12, minHeight: 28 },
  rail: { width: 14, alignItems: "center" },
  stopDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.blue, marginTop: 4 },
  stopSquare: { width: 10, height: 10, borderRadius: 2, backgroundColor: colors.taxi, marginTop: 4 },
  railLine: { flex: 1, width: 2, backgroundColor: "#D5DEEF", marginVertical: 2 },
  stopText: { flex: 1, fontFamily: fonts.semibold, fontSize: 14, color: colors.heading, paddingBottom: 6 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 },
  chip: { fontFamily: fonts.semibold, fontSize: 11.5, color: colors.blue, backgroundColor: "#EAF1FF", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, overflow: "hidden" },
  chipGood: { color: colors.success, backgroundColor: colors.successSoft },
  chipBad: { color: "#B42318", backgroundColor: colors.dangerSoft },
  actions: { flexDirection: "row", gap: 8, marginTop: 14 },
});
