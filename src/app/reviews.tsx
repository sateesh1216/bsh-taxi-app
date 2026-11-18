import { useState } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Screen } from "../components/Screen";
import { Header } from "../components/Header";
import { GlassCard } from "../components/GlassCard";
import { Button } from "../components/Button";
import { Body, Section } from "../components/Content";
import { faqs, GOOGLE_REVIEW_URL, INSTAGRAM_URL, reviews } from "../data/site";
import { colors } from "../theme/colors";
import { fonts } from "../theme/fonts";

export default function Reviews() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <Screen bottomPad={40}>
      <Header eyebrow="HAPPY TRAVELLERS" title="Reviews and FAQs" />
      <View style={{ gap: 12 }}>
        {reviews.map((r) => (
          <GlassCard key={r.name} style={{ padding: 16, gap: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View style={s.avatar}><Text style={s.initial}>{r.initial}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={s.name}>{r.name}</Text>
                <Text style={s.meta}>{r.date}</Text>
              </View>
              <View style={{ flexDirection: "row" }}>{[0, 1, 2, 3, 4].map((i) => <Ionicons key={i} name="star" size={14} color={colors.amber} />)}</View>
            </View>
            <Text style={s.text}>{r.text}</Text>
          </GlassCard>
        ))}
      </View>
      <View style={{ gap: 10, marginTop: 16 }}>
        <Button label="Write a Google review" onPress={() => Linking.openURL(GOOGLE_REVIEW_URL)} />
        <Button label="Follow us on Instagram" variant="glass" onPress={() => Linking.openURL(INSTAGRAM_URL)} />
      </View>
      <Section title="Frequently asked questions">
        <View style={{ gap: 10 }}>
          {faqs.map((f, i) => (
            <GlassCard key={f.question} r={16}>
              <Pressable accessibilityRole="button" accessibilityState={{ expanded: open === i }} onPress={() => setOpen(open === i ? null : i)} style={s.faqHead}>
                <Text style={s.q}>{f.question}</Text>
                <Ionicons name={open === i ? "chevron-up" : "chevron-down"} size={18} color={colors.amber} />
              </Pressable>
              {open === i && <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}><Body>{f.answer}</Body></View>}
            </GlassCard>
          ))}
        </View>
      </Section>
    </Screen>
  );
}

const s = StyleSheet.create({
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.amber, alignItems: "center", justifyContent: "center" },
  initial: { fontFamily: fonts.bold, fontSize: 14, color: colors.navy },
  name: { fontFamily: fonts.heading, fontSize: 16, color: colors.white },
  meta: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted },
  text: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.white },
  faqHead: { flexDirection: "row", alignItems: "center", gap: 10, padding: 16, minHeight: 56 },
  q: { flex: 1, fontFamily: fonts.semibold, fontSize: 15, color: colors.white },
});
