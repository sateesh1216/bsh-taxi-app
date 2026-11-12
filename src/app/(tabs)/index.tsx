import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Screen } from "../../components/Screen";
import { GlassCard } from "../../components/GlassCard";
import { Button } from "../../components/Button";
import { callSupport, whatsappSupport } from "../../lib/contact";
import { colors } from "../../theme/colors";
import { fonts } from "../../theme/fonts";

const SERVICES = ["Airport", "Local", "Outstation", "Tours"];
const ROUTES = [
  { from: "Vizag", to: "Araku Valley" },
  { from: "Vizag", to: "Tirupati" },
  { from: "Vizag", to: "Lambasingi" },
];

export default function Home() {
  return (
    <Screen>
      <View style={styles.top}>
        <Image source={require("../../../assets/images/logo-light.png")} style={styles.logo} resizeMode="contain" accessibilityLabel="BSH Taxi Services" />
        <GlassCard r={20} style={styles.badge}>
          <Text style={styles.badgeText}>Open 24/7</Text>
        </GlassCard>
      </View>

      <Text style={styles.eyebrow}>VISAKHAPATNAM</Text>
      <Text style={styles.h1}>Where are we{"\n"}going today?</Text>

      <GlassCard style={styles.search}>
        <Text style={styles.searchFrom}>Current location</Text>
        <View style={styles.sep} />
        <Text style={styles.searchTo}>Enter drop location</Text>
      </GlassCard>

      <View style={styles.chips}>
        {SERVICES.map((s, i) => (
          <Pressable key={s} accessibilityRole="button" style={[styles.chip, i === 0 && styles.chipOn]}>
            <Text style={[styles.chipText, i === 0 && { color: colors.navy }]}>{s}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.h2}>Popular routes</Text>
      <View style={{ gap: 10 }}>
        {ROUTES.map((r) => (
          <GlassCard key={r.to} r={16} style={styles.route}>
            <Text style={styles.routeText}>{r.from} → {r.to}</Text>
            <Text style={styles.routeSub}>Fixed fare · enquire to confirm</Text>
          </GlassCard>
        ))}
      </View>

      <GlassCard strong style={styles.help}>
        <Text style={styles.helpText}>Need help? Talk to us 24/7</Text>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Button label="Call now" onPress={callSupport} style={{ flex: 1 }} />
          <Button label="WhatsApp" variant="outline" onPress={() => whatsappSupport()} style={{ flex: 1 }} />
        </View>
      </GlassCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  logo: { height: 36, width: 98 },
  badge: { paddingHorizontal: 14, paddingVertical: 7 },
  badgeText: { fontFamily: fonts.bold, fontSize: 12, color: colors.amber },
  eyebrow: { marginTop: 24, fontFamily: fonts.bold, fontSize: 12, letterSpacing: 2, color: colors.amber },
  h1: { marginTop: 8, fontFamily: fonts.heading, fontSize: 34, lineHeight: 38, color: colors.white },
  search: { marginTop: 20, paddingHorizontal: 18 },
  searchFrom: { fontFamily: fonts.body, fontSize: 15, color: colors.white, paddingVertical: 16 },
  sep: { height: 1, backgroundColor: colors.divider },
  searchTo: { fontFamily: fonts.semibold, fontSize: 15, color: colors.white, paddingVertical: 16 },
  chips: { flexDirection: "row", gap: 8, marginTop: 16, flexWrap: "wrap" },
  chip: { minHeight: 44, paddingHorizontal: 18, borderRadius: 22, justifyContent: "center", backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.glassBorder },
  chipOn: { backgroundColor: colors.amber, borderColor: colors.amber },
  chipText: { fontFamily: fonts.semibold, fontSize: 14, color: colors.white },
  h2: { marginTop: 26, marginBottom: 10, fontFamily: fonts.heading, fontSize: 20, color: colors.white },
  route: { paddingHorizontal: 16, paddingVertical: 14 },
  routeText: { fontFamily: fonts.heading, fontSize: 17, color: colors.white },
  routeSub: { marginTop: 2, fontFamily: fonts.body, fontSize: 12, color: colors.textMuted },
  help: { marginTop: 16, padding: 16, gap: 12 },
  helpText: { fontFamily: fonts.semibold, fontSize: 14, color: colors.white },
});
