import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Screen } from "../../components/Screen";
import { Header } from "../../components/Header";
import { GlassCard } from "../../components/GlassCard";
import { outstations } from "../../data/site";
import { colors } from "../../theme/colors";
import { fonts } from "../../theme/fonts";

const CATS = ["All", "City", "Pilgrimage", "Business Hub"];

export default function OutstationList() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const query = q.trim().toLowerCase();
  const list = outstations.filter((o) => (cat === "All" || o.category === cat) && (!query || o.name.toLowerCase().split(/[\s-]+/).some((w) => w.startsWith(query)) || o.name.toLowerCase().includes(query)));

  return (
    <Screen bottomPad={40}>
      <Header eyebrow="OUTSTATION TAXI" title="Taxi from Vizag to any city" />
      <GlassCard r={16} style={s.inputRow}>
        <Ionicons name="search" size={20} color={colors.textMuted} />
        <TextInput accessibilityLabel="Search outstation routes" value={q} onChangeText={setQ} placeholder="Search city or town" placeholderTextColor="rgba(255,255,255,0.5)" style={s.input} />
      </GlassCard>
      <View style={s.chips}>
        {CATS.map((c) => (
          <Pressable key={c} accessibilityRole="button" accessibilityState={{ selected: c === cat }} onPress={() => setCat(c)} style={[s.chip, c === cat && { backgroundColor: colors.amber, borderColor: colors.amber }]}>
            <Text style={[s.chipText, c === cat && { color: colors.navy }]}>{c}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={s.count}>{list.length} routes</Text>
      <View style={{ gap: 10 }}>
        {list.map((o) => (
          <Pressable key={o.slug} accessibilityRole="button" onPress={() => router.push(`/outstation/${o.slug}`)}>
            <GlassCard r={16} style={{ padding: 14, flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={s.name}>{o.name}</Text>
                <Text style={s.sub}>{[o.category, o.distanceFromVizag, o.driveTime].filter(Boolean).join(" · ")}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.amber} />
            </GlassCard>
          </Pressable>
        ))}
        {list.length === 0 && <Text style={s.sub}>No route found. Call us, we cover many more places.</Text>}
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  inputRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, minHeight: 52 },
  input: { flex: 1, minHeight: 48, fontFamily: fonts.body, fontSize: 15, color: colors.white },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  chip: { minHeight: 44, paddingHorizontal: 16, borderRadius: 22, justifyContent: "center", backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.glassBorder },
  chipText: { fontFamily: fonts.semibold, fontSize: 13, color: colors.white },
  count: { marginVertical: 12, fontFamily: fonts.semibold, fontSize: 12, color: colors.textMuted },
  name: { fontFamily: fonts.heading, fontSize: 16, color: colors.white },
  sub: { marginTop: 2, fontFamily: fonts.body, fontSize: 12, lineHeight: 17, color: colors.textMuted },
});
