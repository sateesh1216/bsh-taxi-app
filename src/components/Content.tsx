import type { ReactNode } from "react";
import { Image, ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "@expo/vector-icons/Ionicons";
import { GlassCard } from "./GlassCard";
import { img } from "../data/images";
import type { Fact, Place } from "../data/site";
import { colors } from "../theme/colors";
import { fonts } from "../theme/fonts";

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={{ marginTop: 28 }}>
      <Text style={s.h2} accessibilityRole="header">{title}</Text>
      {children}
    </View>
  );
}

export const Body = ({ children }: { children: string }) => <Text style={s.body}>{children}</Text>;

export function Bullets({ items }: { items: string[] }) {
  return (
    <View style={{ gap: 9 }}>
      {items.map((t, i) => (
        <View key={i} style={{ flexDirection: "row", gap: 11, alignItems: "flex-start" }}>
          <View style={s.dot} />
          <Text style={[s.body, { flex: 1 }]}>{t}</Text>
        </View>
      ))}
    </View>
  );
}

export function FactGrid({ facts }: { facts: Fact[] }) {
  return (
    <View style={s.grid}>
      {facts.map((f) => (
        <GlassCard key={f.label} r={14} style={{ width: "48.5%", padding: 13 }}>
          <Text style={s.factLabel}>{f.label}</Text>
          <Text style={s.factValue}>{f.value}</Text>
        </GlassCard>
      ))}
    </View>
  );
}

export function PlaceRow({ p }: { p: Place }) {
  const src = img(p.image);
  return (
    <GlassCard r={20}>
      {src ? <Image source={src} style={s.placeImg} accessibilityLabel={p.imageAlt ?? p.name} /> : null}
      <View style={{ padding: 14, gap: 5 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
          <Text style={[s.placeName, { flex: 1 }]}>{p.name}</Text>
          {p.tag ? <Text style={s.tag}>{p.tag}</Text> : null}
        </View>
        {p.description ? <Text style={s.body}>{p.description}</Text> : null}
      </View>
    </GlassCard>
  );
}

type CardProps = { title: string; subtitle?: string; image?: string; onPress: () => void; height?: number };

/** Photo card, title on a navy gradient with a small arrow chip. */
export function ImageCard({ title, subtitle, image, onPress, height = 160 }: CardProps) {
  const src = img(image);
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={title} onPress={onPress} style={({ pressed }) => [s.card, { height, transform: [{ scale: pressed ? 0.985 : 1 }] }]}>
      {src ? <ImageBackground source={src} style={StyleSheet.absoluteFill} resizeMode="cover" /> : <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.glassStrong }]} />}
      <LinearGradient colors={["rgba(10,26,63,0)", "rgba(10,26,63,0.30)", "rgba(10,26,63,0.92)"]} locations={[0, 0.45, 1]} style={StyleSheet.absoluteFill} />
      <View style={s.cardRow}>
        <View style={{ flex: 1 }}>
          <Text style={s.cardTitle} numberOfLines={2}>{title}</Text>
          {subtitle ? <Text style={s.cardSub} numberOfLines={1}>{subtitle}</Text> : null}
        </View>
        <View style={s.cardArrow}><Ionicons name="arrow-forward" size={15} color={colors.ink} /></View>
      </View>
    </Pressable>
  );
}

export function Pill({ children }: { children: string }) {
  return <Text style={s.pill}>{children}</Text>;
}

const s = StyleSheet.create({
  h2: { fontFamily: fonts.heading, fontSize: 22, color: colors.heading, marginBottom: 12 },
  body: { fontFamily: fonts.body, fontSize: 14.5, lineHeight: 22, color: colors.body },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.taxi, marginTop: 8 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "space-between" },
  factLabel: { fontFamily: fonts.semibold, fontSize: 12, color: colors.textMuted },
  factValue: { marginTop: 4, fontFamily: fonts.bold, fontSize: 14.5, color: colors.heading },
  placeImg: { width: "100%", height: 160 },
  placeName: { fontFamily: fonts.heading, fontSize: 18, color: colors.heading },
  tag: { fontFamily: fonts.bold, fontSize: 11, color: colors.taxiDeep, backgroundColor: colors.taxiSoft, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 10, overflow: "hidden" },
  card: { borderRadius: 22, overflow: "hidden", justifyContent: "flex-end", backgroundColor: colors.ink },
  cardRow: { flexDirection: "row", alignItems: "flex-end", gap: 10, padding: 14 },
  cardTitle: { fontFamily: fonts.heading, fontSize: 19, lineHeight: 24, color: "#FFFFFF" },
  cardSub: { marginTop: 3, fontFamily: fonts.body, fontSize: 12, color: "rgba(255,255,255,0.85)" },
  cardArrow: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.taxi, alignItems: "center", justifyContent: "center" },
  pill: { alignSelf: "flex-start", fontFamily: fonts.bold, fontSize: 12, color: colors.blue, backgroundColor: "#EAF1FF", paddingHorizontal: 11, paddingVertical: 5, borderRadius: 12, overflow: "hidden" },
});
