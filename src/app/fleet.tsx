import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Screen } from "../components/Screen";
import { Header } from "../components/Header";
import { GlassCard } from "../components/GlassCard";
import { Button } from "../components/Button";
import { img } from "../data/images";
import { fleetCategories, fleetVehicles } from "../data/site";
import { colors } from "../theme/colors";
import { fonts } from "../theme/fonts";

export default function Fleet() {
  const [cat, setCat] = useState("All");
  const list = fleetVehicles.filter((v) => cat === "All" || v.category === cat);
  return (
    <Screen bottomPad={40}>
      <Header eyebrow="OUR FLEET" title="Clean, serviced cars" />
      <View style={s.chips}>
        {["All", ...fleetCategories].map((c) => (
          <Pressable key={c} accessibilityRole="button" accessibilityState={{ selected: c === cat }} onPress={() => setCat(c)} style={[s.chip, c === cat && { backgroundColor: colors.amber, borderColor: colors.amber }]}>
            <Text style={[s.chipText, c === cat && { color: colors.navy }]}>{c}</Text>
          </Pressable>
        ))}
      </View>
      <View style={{ gap: 12, marginTop: 14 }}>
        {list.length === 0 && <Text style={s.sub}>No vehicles in this category yet. Call us for availability.</Text>}
        {list.map((v) => {
          const src = img(v.image);
          return (
            <GlassCard key={v.slug} r={20}>
              {src && <Image source={src} style={s.img} resizeMode="contain" accessibilityLabel={v.name} />}
              <View style={{ padding: 16, gap: 6 }}>
                <View style={s.row}>
                  <Text style={s.name}>{v.name}</Text>
                  <Text style={s.price}>₹{v.pricePerKm}/km</Text>
                </View>
                <Text style={s.sub}>{v.category} · {v.seats} seats · {v.bags} bags{v.hasAC ? " · AC" : ""}</Text>
                <Text style={s.desc}>{v.description}</Text>
                <Button label={`Book ${v.name}`} onPress={() => router.push("/book?type=local")} style={{ marginTop: 8 }} />
              </View>
            </GlassCard>
          );
        })}
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { minHeight: 44, paddingHorizontal: 16, borderRadius: 22, justifyContent: "center", backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.glassBorder },
  chipText: { fontFamily: fonts.semibold, fontSize: 13, color: colors.white },
  img: { width: "100%", height: 170, marginTop: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  name: { fontFamily: fonts.heading, fontSize: 20, color: colors.white },
  price: { fontFamily: fonts.heading, fontSize: 18, color: colors.amber },
  sub: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted },
  desc: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: colors.white },
});
