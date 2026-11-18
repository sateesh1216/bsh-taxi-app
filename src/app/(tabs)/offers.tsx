import { Share, StyleSheet, Text, View } from "react-native";
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
      <Text style={s.eyebrow}>BSH TAXI SERVICES</Text>
      <Text style={s.title}>Offers & trip ideas</Text>
      <Text style={s.intro}>Looking for a good deal? Contact our team for the latest available prices and offers. Any discount will be confirmed by BSH Taxi before booking.</Text>
      <GlassCard style={s.feature}>
        <View style={s.featureIcon}><Ionicons name="pricetag-outline" size={25} color="#155EEF" /></View>
        <Text style={s.featureTitle}>Ask about current offers</Text>
        <Text style={s.copy}>Tell us your route, travel date and preferred vehicle. Our team can confirm the applicable fare and any active offer.</Text>
        <Button label="Check offers on WhatsApp" onPress={() => whatsappSupport("Hi BSH Taxi Services! Please share the current offers and best available fare for my trip.")} />
      </GlassCard>
      <Text style={s.sectionTitle}>Explore booking options</Text>
      <View style={{ gap: 10 }}>
        {OFFER_CATEGORIES.map((item) => (
          <GlassCard key={item.type} style={s.item}>
            <View style={s.icon}><Ionicons name={item.icon} size={21} color="#155EEF" /></View>
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={s.itemTitle}>{item.title}</Text>
              <Text style={s.copy}>{item.detail}</Text>
            </View>
            <Button label="Book" onPress={() => router.push(`/book?type=${item.type}`)} style={{ minHeight: 42, paddingHorizontal: 15 }} />
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
  eyebrow: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 2, color: colors.blue },
  title: { marginTop: 6, fontFamily: fonts.heading, fontSize: 29, color: "#101828" },
  intro: { marginTop: 8, marginBottom: 18, fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.textMuted },
  feature: { padding: 18, gap: 10, backgroundColor: "#F8FAFF" },
  featureIcon: { width: 48, height: 48, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: "#EFF5FF" },
  featureTitle: { fontFamily: fonts.heading, fontSize: 20, color: "#101828" },
  copy: { fontFamily: fonts.body, fontSize: 12, lineHeight: 18, color: colors.textMuted },
  sectionTitle: { marginTop: 23, marginBottom: 11, fontFamily: fonts.heading, fontSize: 20, color: "#101828" },
  item: { padding: 12, flexDirection: "row", alignItems: "center", gap: 10 },
  icon: { width: 40, height: 40, borderRadius: 13, backgroundColor: "#EFF5FF", alignItems: "center", justifyContent: "center" },
  itemTitle: { fontFamily: fonts.semibold, fontSize: 14, color: "#101828" },
  share: { padding: 16, marginTop: 18, gap: 9 },
});
