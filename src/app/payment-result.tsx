import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Screen } from "../components/Screen";
import { GlassCard } from "../components/GlassCard";
import { Button } from "../components/Button";
import { Rows } from "../components/Rows";
import { getPaymentStatus, type PaymentStatusResult } from "../lib/api";
import { whatsappSupport } from "../lib/contact";
import { formatCurrency } from "../lib/booking";
import { colors } from "../theme/colors";
import { fonts } from "../theme/fonts";

type Outcome = "success" | "pending" | "failed" | "cancelled" | "expired" | "error";
const POLL_MS = 3000;
const MAX_POLLS = 10;

function toOutcome(raw: string | null | undefined): Outcome {
  const v = String(raw ?? "").trim().toLowerCase();
  if (["success", "paid", "captured"].includes(v)) return "success";
  if (["failed", "failure", "declined"].includes(v)) return "failed";
  if (["cancelled", "canceled", "user_dropped", "terminated"].includes(v)) return "cancelled";
  if (v === "expired") return "expired";
  if (v === "error") return "error";
  return "pending";
}

const COPY: Record<Outcome, { title: string; text: string; icon: "checkmark-circle" | "time" | "close-circle" | "alert-circle" }> = {
  success: { title: "Payment successful", text: "Thank you! Your booking is confirmed. Our team will contact you with the driver and vehicle details.", icon: "checkmark-circle" },
  pending: { title: "Confirming your payment…", text: "Please wait while we confirm your payment with the bank.", icon: "time" },
  failed: { title: "Payment failed", text: "Your payment could not be completed. If an amount was deducted, your bank will refund it automatically.", icon: "close-circle" },
  cancelled: { title: "Payment cancelled", text: "You cancelled the payment. No money has been charged.", icon: "close-circle" },
  expired: { title: "Payment expired", text: "This payment link expired. Please start a new booking.", icon: "close-circle" },
  error: { title: "Could not verify payment", text: "If money was deducted, please contact us with your reference and we will sort it out.", icon: "alert-circle" },
};

export default function PaymentResult() {
  const { ref, number } = useLocalSearchParams<{ ref?: string; number?: string }>();
  const [outcome, setOutcome] = useState<Outcome>("pending");
  const [info, setInfo] = useState<PaymentStatusResult | null>(null);
  const [gaveUp, setGaveUp] = useState(false);
  const polls = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const check = useCallback(async () => {
    if (!ref) return setOutcome("error");
    try {
      const data = await getPaymentStatus(ref);
      setInfo(data);
      const next = toOutcome(data.status);
      setOutcome(next);
      if (next === "pending") {
        if (polls.current < MAX_POLLS) { polls.current += 1; timer.current = setTimeout(check, POLL_MS); } else setGaveUp(true);
      }
    } catch {
      if (polls.current < 3) { polls.current += 1; timer.current = setTimeout(check, POLL_MS); } else setOutcome((o) => (o === "success" ? o : "error"));
    }
  }, [ref]);

  useEffect(() => {
    check();
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [check]);

  const c = COPY[outcome];
  const color = outcome === "success" ? colors.amber : outcome === "pending" ? colors.white : colors.danger;
  const rows = [
    ...(number ? [{ label: "Enquiry no.", value: number }] : []),
    ...(ref ? [{ label: "Reference", value: ref }] : []),
    ...(info && outcome === "success" ? [{ label: "Amount paid", value: formatCurrency(info.paid_amount ?? info.amount) }] : []),
  ];

  return (
    <Screen bottomPad={40}>
      <View style={s.center}>
        {outcome === "pending" && !gaveUp ? <ActivityIndicator size="large" color={colors.amber} /> : <Ionicons name={c.icon} size={72} color={color} />}
        <Text style={s.h1}>{gaveUp && outcome === "pending" ? "Still confirming" : c.title}</Text>
        <Text style={s.sub}>{gaveUp && outcome === "pending" ? "The bank is taking longer than usual. Check again in a minute, or contact us with your reference." : c.text}</Text>
      </View>
      {rows.length > 0 && <GlassCard style={{ marginTop: 24, paddingHorizontal: 18, paddingVertical: 8 }}><Rows rows={rows} /></GlassCard>}
      <View style={{ gap: 10, marginTop: 20 }}>
        {gaveUp && outcome === "pending" && <Button label="Check again" onPress={() => { polls.current = 0; setGaveUp(false); check(); }} />}
        {info?.invoice?.pdf_url && outcome === "success" && <Button label="View invoice" onPress={() => WebBrowser.openBrowserAsync(info.invoice!.pdf_url)} />}
        {outcome !== "success" && outcome !== "pending" && <Button label="Try again" onPress={() => router.replace("/book")} />}
        <Button label="Need help? WhatsApp" variant="glass" onPress={() => whatsappSupport(`Hi BSH Taxi Services, I need help with my payment${ref ? ` (ref: ${ref})` : ""}.`)} />
        <Button label="Back to Home" variant="outline" onPress={() => router.replace("/")} />
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  center: { alignItems: "center", marginTop: 40, gap: 8 },
  h1: { marginTop: 8, fontFamily: fonts.heading, fontSize: 28, color: colors.white, textAlign: "center" },
  sub: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: colors.textMuted, textAlign: "center" },
});
