import type { ReactNode } from "react";
import { Image, ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { GlassCard } from "./GlassCard";
import { img } from "../data/images";
import type { Fact, Place } from "../data/site";
import { colors } from "../theme/colors";
import { fonts } from "../theme/fonts";

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={{ marginTop: 26 }}>
      <Text style={s.h2}>{title}</Text>
      {children}
    </View>
  );
}

export const Body = ({ children }: { children: string }) => <Text style={s.body}>{children}</Text>;

export function Bullets({ items }: { items: string[] }) {
  return (
    <View style={{ gap: 8 }}>
      {items.map((t, i) => (
        <View key={i} style={{ flexDirection: "row", gap: 10 }}>
          <Text style={{ color: colors.amber, fontFamily: fonts.bold }}>•</Text>
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
        <GlassCard key={f.label} r={14} style={{ width: "48.5%", padding: 12 }}>
          <Text style={s.factLabel}>{f.label.toUpperCase()}</Text>
          <Text style={s.factValue}>{f.value}</Text>
        </GlassCard>
      ))}
    </View>
  );
}

export function PlaceRow({ p }: { p: Place }) {
  const src = img(p.image);
  return (
    <GlassCard r={18}>
      {src ? <Image source={src} style={s.placeImg} accessibilityLabel={p.imageAlt ?? p.name} /> : null}
      <View style={{ padding: 14, gap: 4 }}>
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

/** Photo card with the title on a dark gradient. */
export function ImageCard({ title, subtitle, image, onPress, height = 160 }: CardProps) {
  const src = img(image);
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={title} onPress={onPress} style={[s.card, { height }]}>
      {src ? <ImageBackground source={src} style={StyleSheet.absoluteFill} resizeMode="cover" /> : <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.glassStrong }]} />}
      <LinearGradient colors={["rgba(6,15,36,0)", "rgba(6,15,36,0.88)"]} style={StyleSheet.absoluteFill} />
      <View style={s.cardText}>
        <Text style={s.cardTitle}>{title}</Text>
        {subtitle ? <Text style={s.cardSub}>{subtitle}</Text> : null}
      </View>
    </Pressable>
  );
}

export function Pill({ children }: { children: string }) {
  return <Text style={s.pill}>{children}</Text>;
}

const s = StyleSheet.create({
  h2: { fontFamily: fonts.heading, fontSize: 21, color: colors.white, marginBottom: 10 },
  body: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.textMuted },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "space-between" },
  factLabel: { fontFamily: fonts.bold, fontSize: 10, letterSpacing: 1.5, color: colors.amber },
  factValue: { marginTop: 4, fontFamily: fonts.semibold, fontSize: 14, color: colors.white },
  placeImg: { width: "100%", height: 150 },
  placeName: { fontFamily: fonts.heading, fontSize: 17, color: colors.white },
  tag: { fontFamily: fonts.bold, fontSize: 11, color: colors.navy, backgroundColor: colors.amber, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, overflow: "hidden" },
  card: { borderRadius: 20, overflow: "hidden", borderWidth: 1, borderColor: colors.glassBorder, justifyContent: "flex-end" },
  cardText: { padding: 14 },
  cardTitle: { fontFamily: fonts.heading, fontSize: 19, color: colors.white },
  cardSub: { marginTop: 2, fontFamily: fonts.body, fontSize: 12, color: "rgba(255,255,255,0.85)" },
  pill: { alignSelf: "flex-start", fontFamily: fonts.bold, fontSize: 12, color: colors.amber, borderWidth: 1, borderColor: colors.amber, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, overflow: "hidden" },
});
