import { StyleSheet, Text, View } from "react-native";
import { Screen } from "../../components/Screen";
import { GlassCard } from "../../components/GlassCard";
import { Button } from "../../components/Button";
import { callSupport, whatsappSupport } from "../../lib/contact";
import { SUPPORT_PHONE_DISPLAY } from "../../data/bookingConfig";
import { colors } from "../../theme/colors";
import { fonts } from "../../theme/fonts";

export default function Profile() {
  return (
    <Screen>
      <Text style={styles.title}>Profile</Text>
      <GlassCard style={styles.card}>
        <Text style={styles.label}>24/7 SUPPORT</Text>
        <Text style={styles.phone}>{SUPPORT_PHONE_DISPLAY}</Text>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Button label="Call us" onPress={callSupport} style={{ flex: 1 }} />
          <Button label="WhatsApp" variant="glass" onPress={() => whatsappSupport()} style={{ flex: 1 }} />
        </View>
      </GlassCard>
      <Text style={styles.note}>Sign-in, saved places and language settings arrive in a later phase.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.heading, fontSize: 28, color: colors.white, marginBottom: 16 },
  card: { padding: 20, gap: 14 },
  label: { fontFamily: fonts.bold, fontSize: 12, letterSpacing: 2, color: colors.amber },
  phone: { fontFamily: fonts.heading, fontSize: 24, color: colors.white },
  note: { marginTop: 16, fontFamily: fonts.body, fontSize: 13, lineHeight: 19, color: colors.textMuted },
});
