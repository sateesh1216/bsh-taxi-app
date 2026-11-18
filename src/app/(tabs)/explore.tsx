import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Screen } from "../../components/Screen";
import { GlassCard } from "../../components/GlassCard";
import { SearchBox } from "../../components/Search";
import { destinations, fleetVehicles, outstations, reviews, services } from "../../data/site";
import { colors } from "../../theme/colors";
import { fonts } from "../../theme/fonts";

type Icon = keyof typeof Ionicons.glyphMap;
const HUB: { title: string; sub: string; icon: Icon; href: string }[] = [
  { title: "Services", sub: `${services.length} services`, icon: "briefcase", href: "/services" },
  { title: "Tour destinations", sub: `${destinations.length} destinations from Vizag`, icon: "map", href: "/destinations" },
  { title: "Outstation routes", sub: `${outstations.length} cities with fares`, icon: "navigate", href: "/outstation" },
  { title: "Our fleet", sub: `${fleetVehicles.length} vehicles`, icon: "car", href: "/fleet" },
  { title: "Reviews and FAQs", sub: `${reviews.length} traveller reviews`, icon: "star", href: "/reviews" },
  { title: "About us", sub: "Who we are", icon: "information-circle", href: "/about" },
  { title: "Contact", sub: "Call, WhatsApp, address", icon: "call", href: "/contact" },
];

export default function Explore() {
  return (
    <Screen>
      <Text style={s.title}>Explore</Text>
      <SearchBox />
      <View style={{ gap: 10, marginTop: 20 }}>
        {HUB.map((h) => (
          <Pressable key={h.title} accessibilityRole="button" onPress={() => router.push(h.href as never)}>
            <GlassCard r={18} style={s.row}>
              <View style={s.icon}><Ionicons name={h.icon} size={22} color={colors.navy} /></View>
              <View style={{ flex: 1 }}>
                <Text style={s.name}>{h.title}</Text>
                <Text style={s.sub}>{h.sub}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.amber} />
            </GlassCard>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  title: { fontFamily: fonts.heading, fontSize: 28, color: colors.white, marginBottom: 16 },
  row: { flexDirection: "row", alignItems: "center", gap: 14, padding: 14 },
  icon: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.amber, alignItems: "center", justifyContent: "center" },
  name: { fontFamily: fonts.heading, fontSize: 17, color: colors.white },
  sub: { marginTop: 2, fontFamily: fonts.body, fontSize: 12, color: colors.textMuted },
});
