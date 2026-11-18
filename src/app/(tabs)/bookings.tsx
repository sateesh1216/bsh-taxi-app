import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Screen } from "../../components/Screen";
import { GlassCard } from "../../components/GlassCard";
import { Button } from "../../components/Button";
import { syncBookings, type SavedEnquiry } from "../../lib/storage";
import { formatCurrency } from "../../lib/booking";
import { useT } from "../../lib/i18n";
import { useAuth } from "../../lib/auth";
import { colors } from "../../theme/colors";
import { fonts } from "../../theme/fonts";

export default function Bookings() {
  const { t } = useT();
  const [items, setItems] = useState<SavedEnquiry[]>([]);
  const [synced, setSynced] = useState(false);
  const { user } = useAuth();
  useFocusEffect(useCallback(() => { syncBookings().then((r) => { setItems(r.items); setSynced(r.synced); }); }, [user]));

  return (
    <Screen>
      <Text style={s.title}>{t("my_bookings")}</Text>
      {user ? (
        <Text style={s.banner}>{synced ? t("saved_account") : t("saved_phone")}</Text>
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
                onPress={() => router.push({ pathname: "/confirmed", params: { number: num } })}
              >
                <GlassCard style={{ padding: 16 }}>
                  <View style={s.row}>
                    <Text style={s.kind}>{e?.title || "Booking"}</Text>
                    <Text style={s.fare}>{e?.fare !== null && e?.fare !== undefined ? formatCurrency(e.fare) : "On call"}</Text>
                  </View>
                  {route ? <Text style={s.route}>{route}</Text> : null}
                  <Text style={s.meta}>
                    {isLocal || !num ? "" : `No. ${num} · `}
                    {dateStr}
                  </Text>
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
});
