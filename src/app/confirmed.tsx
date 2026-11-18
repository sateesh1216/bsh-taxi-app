import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Screen } from "../components/Screen";
import { GlassCard } from "../components/GlassCard";
import { Button } from "../components/Button";
import { Rows } from "../components/Rows";
import { getEnquiry, type SavedEnquiry } from "../lib/storage";
import { callSupport, whatsappSupport } from "../lib/contact";
import { formatCurrency } from "../lib/booking";
import { colors } from "../theme/colors";
import { useT } from "../lib/i18n";
import { useAuth } from "../lib/auth";
import { fonts } from "../theme/fonts";

export default function Confirmed() {
  const { t } = useT();
  const { user } = useAuth();
  const { number } = useLocalSearchParams<{ number?: string }>();
  const numStr = typeof number === "string" ? number : Array.isArray(number) ? number[0] : "";
  const [e, setE] = useState<SavedEnquiry | null>(null);
  useEffect(() => { if (numStr) getEnquiry(numStr).then(setE); }, [numStr]);
  const shown = numStr && !numStr.startsWith("local-") ? numStr : null;

  return (
    <Screen bottomPad={40}>
      <View style={s.center}>
        <View style={s.tick}>
          <Ionicons name="checkmark" size={44} color="#FFFFFF" />
        </View>
        <Text style={s.h1}>{t("enq_sent")}</Text>
        {shown && <Text style={s.sub}>{t("enq_no")} <Text style={{ color: colors.white, fontFamily: fonts.bold }}>{shown}</Text></Text>}
        <Text style={[s.sub, { marginTop: 8 }]}>{t("enq_contact")}</Text>
        <Text style={[s.sub, { marginTop: 6, color: colors.amber }]}>{user ? t("saved_account") : t("saved_phone")}</Text>
      </View>

      {e && (
        <GlassCard style={{ marginTop: 24, paddingHorizontal: 18, paddingVertical: 8 }}>
          <Rows rows={[{ label: "Service", value: e.title }, ...e.rows, { label: "Fare", value: e.fare !== null ? formatCurrency(e.fare) : "Confirmed on call" }]} />
        </GlassCard>
      )}

      <View style={{ gap: 10, marginTop: 20 }}>
        <Button label={t("continue_wa")} onPress={() => whatsappSupport(e?.whatsapp)} />
        <Button label={t("call_us")} variant="glass" onPress={callSupport} />
        <Button label={t("back_home")} variant="outline" onPress={() => router.replace("/")} />
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  center: { alignItems: "center", marginTop: 40 },
  tick: { width: 84, height: 84, borderRadius: 42, alignItems: "center", justifyContent: "center", backgroundColor: "#155EEF" },
  h1: { marginTop: 18, fontFamily: fonts.heading, fontSize: 30, color: colors.white },
  sub: { marginTop: 4, fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: colors.textMuted, textAlign: "center" },
});
