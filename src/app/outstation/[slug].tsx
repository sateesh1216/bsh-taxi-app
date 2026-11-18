import { StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Screen } from "../../components/Screen";
import { Header } from "../../components/Header";
import { GlassCard } from "../../components/GlassCard";
import { Button } from "../../components/Button";
import { Body, Bullets, FactGrid, PlaceRow, Section } from "../../components/Content";
import { outstations, vehicleOptions } from "../../data/site";
import { calculateOutstationFare, getOutstationPricing } from "../../lib/outstation";
import { callSupport, whatsappSupport } from "../../lib/contact";
import { formatCurrency } from "../../lib/booking";
import { colors } from "../../theme/colors";
import { fonts } from "../../theme/fonts";

export default function OutstationDetail() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const o = outstations.find((x) => x.slug === slug);
  if (!o) return <Screen><Header title="Not found" /><Body>This route is not available.</Body></Screen>;
  const place = o.name.replace(/^Vizag to /i, "").replace(/ Taxi.*$/i, "");

  return (
    <Screen bottomPad={40}>
      <Header eyebrow={o.category.toUpperCase()} title={o.name} />
      {o.tagline ? <Text style={s.tagline}>{o.tagline}</Text> : null}
      <Text style={s.meta}>{[o.distanceFromVizag, o.driveTime && `Drive: ${o.driveTime}`].filter(Boolean).join(" · ")}</Text>
      <View style={{ marginTop: 10 }}><Body>{o.description}</Body></View>
      <View style={{ marginTop: 14, gap: 10 }}>
        <Button label={`Book taxi to ${place}`} onPress={() => router.push(`/book?type=outstation&drop=${encodeURIComponent(place)}`)} />
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Button label="Call us" variant="glass" style={{ flex: 1 }} onPress={callSupport} />
          <Button label="WhatsApp" variant="outline" style={{ flex: 1 }} onPress={() => whatsappSupport(`Hi BSH Taxi Services, I need a taxi from Vizag to ${place}.`)} />
        </View>
      </View>

      <Section title="Choose your ride">
        <View style={{ gap: 10 }}>
          {vehicleOptions.map((v) => {
            const p = getOutstationPricing(o.slug, v.slug);
            return (
              <GlassCard key={v.slug} r={18} style={{ padding: 14, gap: 6 }}>
                <View style={s.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.vName}>{v.name}</Text>
                    <Text style={s.vSub}>{v.category} · {v.seats} seats · {v.bags} bags</Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={s.price}>{p.mode === "fixed" ? formatCurrency(p.price) : p.label}</Text>
                    <Text style={s.vSub}>{p.mode === "fixed" ? "round trip" : "per km"}</Text>
                  </View>
                </View>
                {p.mode === "perKm" && o.distanceKm ? <Text style={s.vSub}>Estimate: {formatCurrency(calculateOutstationFare(o.distanceKm, v))} for the round trip</Text> : null}
                <Text style={s.vSub}>Base {v.basePackageKm} km: {formatCurrency(v.basePackagePrice)} · Extra {formatCurrency(v.extraKmRate)}/km · {formatCurrency(v.extraHourRate)}/hr</Text>
                <Text style={s.best}>{v.bestFor}</Text>
              </GlassCard>
            );
          })}
        </View>
        <Text style={[s.vSub, { marginTop: 8 }]}>Tolls, parking and driver food are extra. Final fare is confirmed on call.</Text>
      </Section>

      {o.quickFacts && o.quickFacts.length > 0 && <Section title="Quick facts"><FactGrid facts={o.quickFacts} /></Section>}
      {o.highlights && o.highlights.length > 0 && <Section title="Highlights"><Bullets items={o.highlights} /></Section>}
      {o.places && o.places.length > 0 && <Section title="Places to visit"><View style={{ gap: 12 }}>{o.places.map((p) => <PlaceRow key={p.name} p={p} />)}</View></Section>}
      {o.history ? <Section title="History"><Body>{o.history}</Body></Section> : null}
      {o.bestTimeToVisit ? <Section title="Best time to visit"><Body>{o.bestTimeToVisit}</Body></Section> : null}
      {o.howToReach ? <Section title="How to reach"><Body>{o.howToReach}</Body></Section> : null}
      {o.funFact ? <Section title="Fun fact"><Body>{o.funFact}</Body></Section> : null}
      {o.importantNotes && o.importantNotes.length > 0 && <Section title="Important notes"><Bullets items={o.importantNotes} /></Section>}
    </Screen>
  );
}

const s = StyleSheet.create({
  tagline: { fontFamily: fonts.heading, fontSize: 18, lineHeight: 24, color: colors.white },
  meta: { marginTop: 6, fontFamily: fonts.semibold, fontSize: 13, color: colors.amber },
  row: { flexDirection: "row", gap: 10, alignItems: "center" },
  vName: { fontFamily: fonts.heading, fontSize: 17, color: colors.white },
  vSub: { fontFamily: fonts.body, fontSize: 12, lineHeight: 17, color: colors.textMuted },
  price: { fontFamily: fonts.heading, fontSize: 19, color: colors.amber },
  best: { fontFamily: fonts.body, fontSize: 13, lineHeight: 19, color: colors.white },
});
