import { Image, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Screen } from "../../components/Screen";
import { Header } from "../../components/Header";
import { GlassCard } from "../../components/GlassCard";
import { Button } from "../../components/Button";
import { Body, Bullets, FactGrid, PlaceRow, Pill, Section } from "../../components/Content";
import { img } from "../../data/images";
import { destinations } from "../../data/site";
import { callSupport } from "../../lib/contact";
import { formatCurrency } from "../../lib/booking";
import { colors } from "../../theme/colors";
import { fonts } from "../../theme/fonts";

export default function DestinationDetail() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const d = destinations.find((x) => x.slug === slug);
  if (!d) return <Screen><Header title="Not found" /><Body>This destination is not available.</Body></Screen>;
  const hero = img(d.image);
  const prices = Object.entries(d.fleetPrices ?? {});

  return (
    <Screen bottomPad={40}>
      <Header eyebrow={d.category.toUpperCase()} title={d.name} />
      {hero && <Image source={hero} style={s.hero} accessibilityLabel={d.imageAlt ?? d.name} />}
      <View style={{ marginTop: 14, gap: 10 }}>
        {d.tagline ? <Text style={s.tagline}>{d.tagline}</Text> : null}
        <Text style={s.meta}>{[d.distanceFromVizag, d.driveTime && `Drive: ${d.driveTime}`].filter(Boolean).join(" · ")}</Text>
        <Body>{d.description}</Body>
        <Button label={`Book taxi to ${d.name}`} onPress={() => router.push(`/book?type=outstation&drop=${encodeURIComponent(d.name)}`)} />
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Button label="Tour packages" variant="glass" style={{ flex: 1 }} onPress={() => router.push("/book?type=tour")} />
          <Button label="Call us" variant="outline" style={{ flex: 1 }} onPress={callSupport} />
        </View>
      </View>

      {d.quickFacts && d.quickFacts.length > 0 && <Section title="Quick facts"><FactGrid facts={d.quickFacts} /></Section>}

      {prices.length > 0 && (
        <Section title={`Taxi fares${d.fleetPriceLabel ? ` (${d.fleetPriceLabel.toLowerCase()})` : ""}`}>
          <Text style={{ fontSize: 13, lineHeight: 19, color: colors.textMuted, marginBottom: 10 }}>Fixed fare estimates are shown by vehicle. Confirm trip details and availability before booking. Online Pay Now is available only for booking types supported by the payment gateway.</Text>
          <GlassCard style={{ paddingHorizontal: 16, paddingVertical: 6 }}>
            {prices.map(([name, price], i) => (
              <View key={name} style={[s.priceRow, i > 0 && { borderTopWidth: 1, borderTopColor: colors.divider }]}>
                <Text style={s.priceName}>{name}</Text>
                <Text style={s.price}>{formatCurrency(price)}</Text>
              </View>
            ))}
          </GlassCard>
        </Section>
      )}

      {d.highlights && d.highlights.length > 0 && <Section title="Highlights"><Bullets items={d.highlights} /></Section>}
      {d.places && d.places.length > 0 && <Section title="Places covered"><View style={{ gap: 12 }}>{d.places.map((p) => <PlaceRow key={p.name} p={p} />)}</View></Section>}
      {d.history ? <Section title="History"><Body>{d.history}</Body></Section> : null}
      {d.bestTimeToVisit ? <Section title="Best time to visit"><Body>{d.bestTimeToVisit}</Body></Section> : null}
      {d.howToReach ? <Section title="How to reach"><Body>{d.howToReach}</Body></Section> : null}
      {d.funFact ? <Section title="Fun fact"><Body>{d.funFact}</Body></Section> : null}
      {d.importantNotes && d.importantNotes.length > 0 && <Section title="Important notes"><Bullets items={d.importantNotes} /></Section>}
    </Screen>
  );
}

const s = StyleSheet.create({
  hero: { width: "100%", height: 220, borderRadius: 20 },
  tagline: { fontFamily: fonts.heading, fontSize: 18, lineHeight: 24, color: colors.white },
  meta: { fontFamily: fonts.semibold, fontSize: 13, color: colors.amber },
  priceRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 13 },
  priceName: { fontFamily: fonts.semibold, fontSize: 15, color: colors.white },
  price: { fontFamily: fonts.heading, fontSize: 17, color: colors.amber },
});
