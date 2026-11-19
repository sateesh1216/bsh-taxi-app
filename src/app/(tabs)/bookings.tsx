import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
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
      <Text style={s.title}>{t("my_bookings")}</Text>
      {user ? (
        <Text style={s.banner}>{offline ? "You are offline. Showing your last saved bookings." : synced ? t("saved_account") : t("saved_phone")}</Text>
      ) : (
        <GlassCard style={{ padding: 16, gap: 12, marginBottom: 16 }}>
          <Text style={s.body}>{t("signin_keep")}</Text>
          <Button label={t("sign_in")} onPress={() => router.push("/login")} />
        </GlassCard>
      )}
      {items.length === 0 ? (
        <GlassCard style={{ padding: 20, gap: 16 }}>
          <Text style={s.body}>{t("no_bookings")}</Text>
          <Button label={t("book_ride")} onPress={() => router.push("/book")} />
        </GlassCard>
      ) : (
        <View style={{ gap: 10 }}>
          {items.map((e, index) => {
            const rows = Array.isArray(e?.rows) ? e.rows : [];
            const route = rows
              .filter((r) => ["Pickup", "From", "To", "Package"].includes(r?.label))
              .map((r) => r?.value)
              .filter(Boolean)
              .join(" → ");
            const num = typeof e?.number === "string" ? e.number : String(e?.number ?? "");
            const isLocal = num.startsWith("local-");
            const dateStr = e?.createdAt
              ? new Date(e.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
              : "";
            const key = num || `booking-${index}`;
            return (
              <Pressable
                key={key}
                accessibilityRole="button"
                onPress={() => open(e)}
              >
                <GlassCard style={{ padding: 16 }}>
                  <View style={s.row}>
                    <Text style={s.kind}>{e?.title || "Booking"}</Text>
                    <Text style={s.fare}>{e?.fare !== null && e?.fare !== undefined ? formatCurrency(e.fare) : "On call"}</Text>
                  </View>
                  {route ? <Text style={s.route}>{route}</Text> : null}
                  <Text style={s.meta}>
                    {isLocal || !num ? "" : `Enquiry no. ${num} · `}
                    {dateStr}
                  </Text>
                  <View style={s.chips}>
                    <Text style={[s.chip, e.status === "cancelled" && s.chipBad, e.status === "confirmed" && s.chipGood, e.status === "completed" && s.chipGood]}>{statusLabel(e.status)}</Text>
                    {e.paymentStatus ? <Text style={[s.chip, e.paymentStatus === "paid" && s.chipGood]}>{PAYMENT_LABEL[e.paymentStatus] ?? e.paymentStatus}</Text> : null}
                  </View>
                  <View style={s.actions}>
                    <Button label="View details" variant="glass" onPress={() => open(e)} style={{ flex: 1 }} />
                    <Button label="Book again" onPress={() => router.push({ pathname: "/book", params: { rebook: num } })} style={{ flex: 1 }} />
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
  banner: { marginBottom: 14, fontFamily: fonts.semibold, fontSize: 13, color: colors.amber },
  title: { fontFamily: fonts.heading, fontSize: 28, color: colors.white, marginBottom: 16 },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.textMuted },
  row: { flexDirection: "row", justifyContent: "space-between" },
  kind: { fontFamily: fonts.heading, fontSize: 17, color: colors.white },
  fare: { fontFamily: fonts.bold, fontSize: 14, color: colors.amber },
  route: { marginTop: 4, fontFamily: fonts.body, fontSize: 14, color: colors.white },
  meta: { marginTop: 4, fontFamily: fonts.body, fontSize: 12, color: colors.textMuted },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
  chip: { fontFamily: fonts.semibold, fontSize: 11, color: colors.blue, backgroundColor: "#EFF5FF", paddingHorizontal: 9, paddingVertical: 4, borderRadius: 20, overflow: "hidden" },
  chipGood: { color: "#067647", backgroundColor: "#ECFDF3" },
  chipBad: { color: "#B42318", backgroundColor: "#FEF3F2" },
  actions: { flexDirection: "row", gap: 8, marginTop: 12 },
});
