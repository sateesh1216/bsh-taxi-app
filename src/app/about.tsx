import { Image, StyleSheet, Text, View } from "react-native";
import { Screen } from "../components/Screen";
import { Header } from "../components/Header";
import { GlassCard } from "../components/GlassCard";
import { Body, Bullets, Section } from "../components/Content";
import { img } from "../data/images";
import { about } from "../data/site";
import { colors } from "../theme/colors";
import { fonts } from "../theme/fonts";

export default function About() {
  const hero = img(about.image);
  return (
    <Screen bottomPad={40}>
      <Header eyebrow="WHO WE ARE" title={about.heading} />
      {hero && <Image source={hero} style={s.hero} accessibilityLabel="BSH Taxi Services" />}
      <View style={{ marginTop: 14 }}><Body>{about.intro}</Body></View>
      <View style={s.stats}>
        {about.stats.map((x) => (
          <GlassCard key={x.label} r={16} style={{ width: "31.5%", paddingVertical: 14, alignItems: "center" }}>
            <Text style={s.statValue}>{x.value}</Text>
            <Text style={s.statLabel}>{x.label}</Text>
          </GlassCard>
        ))}
      </View>
      <Section title={about.whoWeAre}><Bullets items={about.highlights} /></Section>
      <Section title="Our mission"><Body>{about.mission}</Body></Section>
      <Section title="Our vision"><Body>{about.vision}</Body></Section>
      <Section title="Our values">
        <View style={{ gap: 10 }}>
          {about.values.map((v) => (
            <GlassCard key={v.title} r={16} style={{ padding: 14 }}>
              <Text style={s.vTitle}>{v.title}</Text>
              <Text style={s.vDesc}>{v.desc}</Text>
            </GlassCard>
          ))}
        </View>
      </Section>
    </Screen>
  );
}

const s = StyleSheet.create({
  hero: { width: "100%", height: 200, borderRadius: 20 },
  stats: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 18, justifyContent: "space-between" },
  statValue: { fontFamily: fonts.heading, fontSize: 19, color: colors.amber },
  statLabel: { marginTop: 2, fontFamily: fonts.body, fontSize: 11, color: colors.textMuted, textAlign: "center", paddingHorizontal: 4 },
  vTitle: { fontFamily: fonts.heading, fontSize: 16, color: colors.white },
  vDesc: { marginTop: 2, fontFamily: fonts.body, fontSize: 13, lineHeight: 19, color: colors.textMuted },
});
