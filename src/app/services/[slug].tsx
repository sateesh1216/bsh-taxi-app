import { Image, StyleSheet, Text } from "react-native";
import { colors } from "../../theme/colors";
import { fonts } from "../../theme/fonts";
import { router, useLocalSearchParams } from "expo-router";
import { Screen } from "../../components/Screen";
import { Header } from "../../components/Header";
import { Button } from "../../components/Button";
import { Body, Bullets, Section } from "../../components/Content";
import { img } from "../../data/images";
import { serviceDetails, services } from "../../data/site";
import { callSupport, whatsappSupport } from "../../lib/contact";

const BOOK: Record<string, { label: string; href: string }> = {
  "local-taxi": { label: "Book local taxi", href: "/book?type=local" },
  "outstation-taxi": { label: "Book outstation taxi", href: "/book?type=outstation" },
  "airport-transfer": { label: "Book airport taxi", href: "/book?type=airport" },
  "tour-packages": { label: "Book a tour package", href: "/book?type=tour" },
};

export default function ServiceDetail() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const s = services.find((x) => x.slug === slug);
  if (!s) return <Screen><Header title="Not found" /><Body>This service is not available.</Body></Screen>;
  const hero = img(s.image);
  const book = BOOK[s.slug];
  const extra = serviceDetails[s.slug];
  return (
    <Screen bottomPad={40}>
      <Header eyebrow="SERVICE" title={s.title} />
      {hero && <Image source={hero} style={st.hero} accessibilityLabel={s.title} />}
      {extra ? <Text style={st.tagline}>{extra.tagline}</Text> : null}
      <Body>{extra?.longDescription ?? s.description}</Body>
      {extra?.highlights?.length ? <Section title="Why choose this service"><Bullets items={extra.highlights} /></Section> : null}
      {extra?.notes?.length ? <Section title="Good to know"><Bullets items={extra.notes} /></Section> : null}
      <>
        {book ? <Button label={book.label} onPress={() => router.push(book.href as never)} style={{ marginTop: 18 }} /> : (
          <Button label="Enquire on WhatsApp" onPress={() => whatsappSupport(`Hi BSH Taxi Services, I need details for: ${s.title}.`)} style={{ marginTop: 18 }} />
        )}
        <Button label="Call us" variant="glass" onPress={callSupport} style={{ marginTop: 10 }} />
        {s.slug === "outstation-taxi" && <Button label="See all routes and fares" variant="outline" onPress={() => router.push("/outstation")} style={{ marginTop: 10 }} />}
        {s.slug === "tour-packages" && <Button label="Browse destinations" variant="outline" onPress={() => router.push("/destinations")} style={{ marginTop: 10 }} />}
      </>
    </Screen>
  );
}

const st = StyleSheet.create({ tagline: { fontFamily: fonts.heading, fontSize: 18, lineHeight: 24, color: colors.white, marginBottom: 8 }, hero: { width: "100%", height: 210, borderRadius: 20, marginBottom: 16 } });
