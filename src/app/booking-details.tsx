import { useCallback, useState } from "react";
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Screen } from "../components/Screen";
import { GlassCard } from "../components/GlassCard";
import { Button } from "../components/Button";
import { Rows } from "../components/Rows";
import { ApiError, getMyBooking, payForBooking, type BookingDetails } from "../lib/api";
import { bookingRows, num, PAYMENT_LABEL, serviceTitle, statusLabel } from "../lib/bookings";
import { formatCurrency } from "../lib/booking";
import { callSupport, whatsappSupport } from "../lib/contact";
import { colors } from "../theme/colors";
import { fonts } from "../theme/fonts";

const STEPS = ["pending", "contacted", "confirmed", "completed"] as const;

/** One booking from the server: live status, driver + vehicle, price, payments, invoices, and Pay. */
export default function BookingDetailsScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const bookingId = typeof id === "string" ? id : Array.isArray(id) ? id[0] : "";
  const [data, setData] = useState<BookingDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState<"advance" | "full" | null>(null);

  const load = useCallback(async () => {
    if (!bookingId) return;
    try { setData(await getMyBooking(bookingId)); setError(null); }
    catch (e) { setError(e instanceof ApiError ? e.message : "Unable to load this booking."); }
  }, [bookingId]);

  // Refresh when the screen is opened (also after coming back from the payment page) and every 15 s.
  useFocusEffect(useCallback(() => {
    void load();
    const timer = setInterval(() => { void load(); }, 15_000);
    return () => clearInterval(timer);
  }, [load]));

  async function pay(type: "advance" | "full") {
    setPaying(type); setError(null);
    try {
      const res = await payForBooking(bookingId, type);
      if (!/^https?:\/\//i.test(res.redirectUrl || "")) throw new ApiError("Could not open the payment page. Please try again.");
      await WebBrowser.openBrowserAsync(res.redirectUrl);
      router.push({ pathname: "/payment-result", params: { ref: res.payment.merchant_txn_id, number: String(data?.enquiry.enquiry_number ?? "") } });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Unable to start the payment. Please try again.");
    } finally {
      setPaying(null);
    }
  }

  if (!data) {
    return (
      <Screen bottomPad={40}>
        <Back />
        {error ? (
          <GlassCard style={{ padding: 18, gap: 12, marginTop: 16 }}>
            <Text style={s.body}>{error}</Text>
            <Button label="Try again" onPress={load} />
          </GlassCard>
        ) : <ActivityIndicator color={colors.amber} style={{ marginTop: 60 }} />}
      </Screen>
    );
  }

  const b = data.enquiry;
  const price = num(b.final_price);
  const paid = num(b.amount_paid) ?? 0;
  const balance = num(b.balance_due) ?? (price !== null ? Math.max(0, price - paid) : null);
  const advance = num(b.advance_amount) ?? 0;
  const advanceLeft = Math.max(0, advance - paid);
  const canPay = b.status === "confirmed" && price !== null && balance !== null && balance > 0;
  const cancelled = b.status === "cancelled";
  const stepIndex = STEPS.indexOf(b.status as (typeof STEPS)[number]);
  const hasDriver = Boolean(b.driver_name || b.vehicle_name || b.vehicle_number);
  const shownPayments = data.payments.filter((p) => p.status !== "initiated");

  return (
    <Screen bottomPad={40}>
      <Back />
      <Text style={s.eyebrow}>ENQUIRY NO. {String(b.enquiry_number)}</Text>
      <Text style={s.h1}>{serviceTitle(b)}</Text>

      <GlassCard strong style={s.statusCard}>
        <Text style={[s.status, cancelled && { color: colors.danger }]}>{statusLabel(b.status)}</Text>
        {!cancelled && (
          <View style={s.steps}>
            {STEPS.map((step, i) => (
              <View key={step} style={s.step}>
                <View style={[s.dot, i <= stepIndex && s.dotOn]} />
                <Text style={[s.stepText, i <= stepIndex && { color: colors.white }]}>{statusLabel(step).replace("Team contacted you", "Contacted").replace("Request received", "Received").replace("Trip completed", "Done")}</Text>
              </View>
            ))}
          </View>
        )}
        <Text style={s.body}>
          {b.status === "pending" && "Our team will call you shortly to confirm the details and price."}
          {b.status === "contacted" && "Our team has contacted you. Your booking will be confirmed once the details are final."}
          {b.status === "confirmed" && (hasDriver ? "Your booking is confirmed. Driver and vehicle details are below." : "Your booking is confirmed. Driver details will appear here once assigned.")}
          {b.status === "completed" && "Thank you for travelling with BSH Taxi Services."}
          {cancelled && "This booking was cancelled. Contact us if you need help."}
        </Text>
      </GlassCard>

      {hasDriver && !cancelled && (
        <GlassCard style={s.card}>
          <Text style={s.cardTitle}>Driver & vehicle</Text>
          <Rows rows={[
            ...(b.driver_name ? [{ label: "Driver", value: b.driver_name }] : []),
            ...(b.vehicle_name ? [{ label: "Vehicle", value: b.vehicle_name }] : []),
            ...(b.vehicle_number ? [{ label: "Number plate", value: b.vehicle_number }] : []),
            ...(b.pickup_details ? [{ label: "Pickup", value: b.pickup_details }] : []),
          ]} />
          {b.driver_phone ? <Button label={`Call driver ${b.driver_phone}`} variant="glass" onPress={() => Linking.openURL(`tel:${b.driver_phone}`)} /> : null}
        </GlassCard>
      )}

      <GlassCard style={s.card}>
        <Text style={s.cardTitle}>Trip</Text>
        <Rows rows={bookingRows(b).filter((r) => r.label !== "Name" && r.label !== "Mobile")} />
      </GlassCard>

      <GlassCard style={s.card}>
        <Text style={s.cardTitle}>Payment</Text>
        <Rows rows={[
          { label: "Fare", value: price !== null ? formatCurrency(price) : "To be confirmed on call" },
          ...(advance > 0 ? [{ label: "Advance", value: formatCurrency(advance) }] : []),
          { label: "Paid", value: formatCurrency(paid) },
          ...(balance !== null && price !== null ? [{ label: "Balance due", value: formatCurrency(balance) }] : []),
          { label: "Status", value: PAYMENT_LABEL[String(b.payment_status)] ?? String(b.payment_status ?? "Unpaid") },
        ]} />
        {canPay && advanceLeft > 0 && advanceLeft < (balance ?? 0) && (
          <Button label={paying === "advance" ? "Opening…" : `Pay advance ${formatCurrency(advanceLeft)}`} onPress={() => pay("advance")} disabled={paying !== null} />
        )}
        {canPay && (
          <Button label={paying === "full" ? "Opening…" : `${paid > 0 ? "Pay balance" : "Pay full amount"} ${formatCurrency(balance)}`} variant={advanceLeft > 0 && advanceLeft < (balance ?? 0) ? "glass" : "primary"} onPress={() => pay("full")} disabled={paying !== null} />
        )}
        {!canPay && !cancelled && b.status !== "completed" && balance !== null && balance > 0 && (
          <Text style={s.body}>Online payment opens once our team confirms your booking.</Text>
        )}
        {error ? <Text accessibilityRole="alert" style={s.error}>{error}</Text> : null}
      </GlassCard>

      {shownPayments.length > 0 && (
        <GlassCard style={s.card}>
          <Text style={s.cardTitle}>Payments</Text>
          {shownPayments.map((p) => {
            const invoice = data.invoices.find((i) => i.payment_id === p.id);
            return (
              <View key={p.id} style={s.payRow}>
                <View style={{ flex: 1 }}>
                  <Text style={s.payAmount}>{formatCurrency(p.paid_amount ?? p.amount)} · {p.status === "success" ? "Paid" : p.status}</Text>
                  <Text style={s.payMeta}>{new Date(p.paid_at || p.created_at).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}{p.payment_mode ? ` · ${p.payment_mode}` : ""}</Text>
                </View>
                {invoice?.pdf_url ? (
                  <Pressable accessibilityRole="button" onPress={() => WebBrowser.openBrowserAsync(invoice.pdf_url)} style={s.invoiceBtn}>
                    <Ionicons name="document-text-outline" size={16} color={colors.blue} />
                    <Text style={s.invoiceText}>Invoice</Text>
                  </Pressable>
                ) : null}
              </View>
            );
          })}
        </GlassCard>
      )}

      <View style={{ gap: 10, marginTop: 6 }}>
        <Button label="Call us" variant="glass" onPress={callSupport} />
        <Button label="WhatsApp us" variant="outline" onPress={() => whatsappSupport(`Hi BSH Taxi Services, I need help with my booking (Enquiry no: ${b.enquiry_number}).`)} />
      </View>
    </Screen>
  );
}

function Back() {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => (router.canGoBack() ? router.back() : router.replace("/bookings"))} style={s.back}>
      <Ionicons name="chevron-back" size={22} color={colors.white} />
    </Pressable>
  );
}

const s = StyleSheet.create({
  back: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: colors.glassStrong, borderWidth: 1, borderColor: colors.glassBorder },
  eyebrow: { marginTop: 14, fontFamily: fonts.bold, fontSize: 10, letterSpacing: 2, color: colors.blue },
  h1: { marginTop: 4, fontFamily: fonts.heading, fontSize: 28, color: colors.white },
  statusCard: { marginTop: 16, padding: 16, gap: 10 },
  status: { fontFamily: fonts.heading, fontSize: 20, color: colors.blue },
  steps: { flexDirection: "row", justifyContent: "space-between" },
  step: { flex: 1, alignItems: "center", gap: 5 },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: "#D0D5DD" },
  dotOn: { backgroundColor: colors.blue },
  stepText: { fontFamily: fonts.semibold, fontSize: 10, color: colors.textMuted, textAlign: "center" },
  body: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.textMuted },
  card: { marginTop: 14, padding: 16, gap: 10 },
  cardTitle: { fontFamily: fonts.heading, fontSize: 17, color: colors.white },
  error: { fontFamily: fonts.semibold, fontSize: 13, color: colors.danger },
  payRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 6, borderTopWidth: 1, borderTopColor: colors.divider },
  payAmount: { fontFamily: fonts.semibold, fontSize: 14, color: colors.white },
  payMeta: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted },
  invoiceBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 20, backgroundColor: "#EFF5FF" },
  invoiceText: { fontFamily: fonts.semibold, fontSize: 12, color: colors.blue },
});
