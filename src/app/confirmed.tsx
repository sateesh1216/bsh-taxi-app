import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { Screen } from "../components/Screen";
import { GlassCard } from "../components/GlassCard";
import { Button } from "../components/Button";
import { Rows } from "../components/Rows";
import { getEnquiry, type SavedEnquiry } from "../lib/storage";
import { callSupport, whatsappSupport } from "../lib/contact";
import { formatCurrency } from "../lib/booking";
import { colors } from "../theme/colors";
import { fonts } from "../theme/fonts";

export default function Confirmed() {
  const { number } = useLocalSearchParams<{ number?: string }>();
  const [e, setE] = useState<SavedEnquiry | null>(null);
  useEffect(() => { if (number) getEnquiry(number).then(setE); }, [number]);
  const shown = number && !number.startsWith("local-") ? number : null;

  return (
    <Screen bottomPad={40}>
      <View style={s.center}>
        <LinearGradient colors={[colors.amberLight, colors.amber]} style={s.tick}>
          <Ionicons name="checkmark" size={44} color={colors.navy} />
        </LinearGradient>
        <Text style={s.h1}>Enquiry sent</Text>
        {shown && <Text style={s.sub}>Enquiry no. <Text style={{ color: colors.white, fontFamily: fonts.bold }}>{shown}</Text></Text>}
        <Text style={[s.sub, { marginTop: 8 }]}>Our team will contact you shortly to confirm your booking.</Text>
      </View>

      {e && (
        <GlassCard style={{ marginTop: 24, paddingHorizontal: 18, paddingVertical: 8 }}>
          <Rows rows={[{ label: "Service", value: e.title }, ...e.rows, { label: "Fare", value: e.fare !== null ? formatCurrency(e.fare) : "Confirmed on call" }]} />
        </GlassCard>
      )}

      <View style={{ gap: 10, marginTop: 20 }}>
        <Button label="Continue on WhatsApp" onPress={() => whatsappSupport(e?.whatsapp)} />
        <Button label="Call us" variant="glass" onPress={callSupport} />
        <Button label="Back to Home" variant="outline" onPress={() => router.replace("/")} />
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  center: { alignItems: "center", marginTop: 40 },
  tick: { width: 84, height: 84, borderRadius: 42, alignItems: "center", justifyContent: "center" },
  h1: { marginTop: 18, fontFamily: fonts.heading, fontSize: 30, color: colors.white },
  sub: { marginTop: 4, fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: colors.textMuted, textAlign: "center" },
});
