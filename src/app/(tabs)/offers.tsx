import { Share, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Screen } from "../../components/Screen";
import { GlassCard } from "../../components/GlassCard";
import { Button } from "../../components/Button";
import { whatsappSupport } from "../../lib/contact";
import { colors } from "../../theme/colors";
import { fonts } from "../../theme/fonts";

const OFFER_CATEGORIES = [
  { icon: "car-outline" as const, title: "Local rides", detail: "Ask our team about current local taxi packages.", type: "local" },
  { icon: "airplane-outline" as const, title: "Airport transfers", detail: "Check availability and current airport transfer pricing.", type: "airport" },
  { icon: "map-outline" as const, title: "Outstation trips", detail: "Request a one-way or round-trip quote for your route.", type: "outstation" },
  { icon: "camera-outline" as const, title: "Tour packages", detail: "Ask about sightseeing packages and vehicle options.", type: "tour" },
];

export default function Offers() {
  return (
    <Screen>
      <Text style={s.title}>Offers & trip ideas</Text>
      <Text style={s.intro}>Looking for a good deal? Contact our team for the latest available prices and offers. Any discount will be confirmed by BSH Taxi before booking.</Text>
      <LinearGradient colors={[colors.ink, colors.inkSoft]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.feature}>
        <View style={s.featureIcon}><Ionicons name="pricetag" size={24} color={colors.ink} /></View>
        <Text style={s.featureTitle}>Ask about current offers</Text>
        <Text style={s.featureCopy}>Tell us your route, travel date and preferred vehicle. Our team can confirm the applicable fare and any active offer.</Text>
        <Button label="Check offers on WhatsApp" variant="taxi" icon="logo-whatsapp" onPress={() => whatsappSupport("Hi BSH Taxi Services! Please share the current offers and best available fare for my trip.")} />
      </LinearGradient>
      <Text style={s.sectionTitle}>Explore booking options</Text>
      <View style={{ gap: 10 }}>
        {OFFER_CATEGORIES.map((item) => (
          <GlassCard key={item.type} style={s.item}>
            <View style={s.icon}><Ionicons name={item.icon} size={21} color={colors.blue} /></View>
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={s.itemTitle}>{item.title}</Text>
              <Text style={s.copy}>{item.detail}</Text>
            </View>
            <Button label="Book" variant="primary" onPress={() => router.push(`/book?type=${item.type}`)} style={{ minHeight: 42, paddingHorizontal: 15 }} />
          </GlassCard>
        ))}
      </View>
      <GlassCard style={s.share}>
        <Text style={s.itemTitle}>Share BSH Taxi</Text>
        <Text style={s.copy}>Recommend our taxi service to friends and family.</Text>
        <Button label="Share app" variant="glass" onPress={() => Share.share({ message: "Need a taxi in Vizag? Contact BSH Taxi Services for local, airport, outstation and tour bookings." })} />
      </GlassCard>
    </Screen>
  );
}

const s = StyleSheet.create({
  title: { fontFamily: fonts.heading, fontSize: 32, color: colors.heading },
  intro: { marginTop: 8, marginBottom: 18, fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.body },
  feature: { padding: 20, gap: 12, borderRadius: 26, overflow: "hidden" },
  featureIcon: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", backgroundColor: colors.taxi },
  featureTitle: { fontFamily: fonts.heading, fontSize: 22, color: "#FFFFFF" },
  featureCopy: { fontFamily: fonts.body, fontSize: 13.5, lineHeight: 20, color: colors.onInkMuted, marginBottom: 4 },
  copy: { fontFamily: fonts.body, fontSize: 12.5, lineHeight: 18, color: colors.textMuted },
  sectionTitle: { marginTop: 28, marginBottom: 12, fontFamily: fonts.heading, fontSize: 22, color: colors.heading },
  item: { padding: 13, flexDirection: "row", alignItems: "center", gap: 12 },
  icon: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#EAF1FF", alignItems: "center", justifyContent: "center" },
  itemTitle: { fontFamily: fonts.semibold, fontSize: 15, color: colors.heading },
  share: { padding: 16, marginTop: 18, gap: 10 },
});
