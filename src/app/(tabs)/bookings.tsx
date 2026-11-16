import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Screen } from "../../components/Screen";
import { GlassCard } from "../../components/GlassCard";
import { Button } from "../../components/Button";
import { listEnquiries, type SavedEnquiry } from "../../lib/storage";
import { formatCurrency } from "../../lib/booking";
import { colors } from "../../theme/colors";
import { fonts } from "../../theme/fonts";

export default function Bookings() {
  const [items, setItems] = useState<SavedEnquiry[]>([]);
  useFocusEffect(useCallback(() => { listEnquiries().then(setItems); }, []));

  return (
    <Screen>
      <Text style={s.title}>My Bookings</Text>
      {items.length === 0 ? (
        <GlassCard style={{ padding: 20, gap: 16 }}>
          <Text style={s.body}>No bookings yet. Your enquiries and payments from this phone will appear here.</Text>
          <Button label="Book a ride" onPress={() => router.push("/book")} />
        </GlassCard>
      ) : (
        <View style={{ gap: 10 }}>
          {items.map((e) => {
            const route = e.rows.filter((r) => ["Pickup", "From", "To", "Package"].includes(r.label)).map((r) => r.value).join(" → ");
            return (
              <Pressable key={e.number} accessibilityRole="button" onPress={() => router.push({ pathname: "/confirmed", params: { number: e.number } })}>
                <GlassCard style={{ padding: 16 }}>
                  <View style={s.row}>
                    <Text style={s.kind}>{e.title}</Text>
                    <Text style={s.fare}>{e.fare !== null ? formatCurrency(e.fare) : "On call"}</Text>
                  </View>
                  <Text style={s.route}>{route}</Text>
                  <Text style={s.meta}>{e.number.startsWith("local-") ? "" : `No. ${e.number} · `}{new Date(e.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</Text>
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
  title: { fontFamily: fonts.heading, fontSize: 28, color: colors.white, marginBottom: 16 },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.textMuted },
  row: { flexDirection: "row", justifyContent: "space-between" },
  kind: { fontFamily: fonts.heading, fontSize: 17, color: colors.white },
  fare: { fontFamily: fonts.bold, fontSize: 14, color: colors.amber },
  route: { marginTop: 4, fontFamily: fonts.body, fontSize: 14, color: colors.white },
  meta: { marginTop: 4, fontFamily: fonts.body, fontSize: 12, color: colors.textMuted },
});
