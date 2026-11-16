import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Screen } from "../components/Screen";
import { GlassCard } from "../components/GlassCard";
import { Button } from "../components/Button";
import { CarCard, DateTimeField, Field, Label, Segmented } from "../components/Form";
import { CAR_TYPES, LOCAL_FARES, LOCAL_PACKAGES, TERMS_AND_CONDITIONS, TOUR_FARES, TOUR_PACKAGES } from "../data/catalog";
import { ApiError, startPayNow, submitEnquiry } from "../lib/api";
import { KINDS, KIND_LABEL, buildPayload, buildPayNow, fareFor, formatCurrency, newDraft, rows, validate, whatsappMessage, tourPkg, type Draft, type ServiceKind } from "../lib/booking";
import { saveEnquiry } from "../lib/storage";
import { whatsappSupport } from "../lib/contact";
import { colors } from "../theme/colors";
import { fonts } from "../theme/fonts";

const TITLES: Record<ServiceKind, string> = { local: "Local Taxi", outstation: "Outstation Cab", airport: "Airport Taxi", tour: "Tour Packages" };

export default function Book() {
  const params = useLocalSearchParams<{ type?: string; drop?: string }>();
  const initial = KINDS.find((k) => k === params.type) ?? "local";
  const [d, setD] = useState<Draft>(() => newDraft(initial, params.drop ?? ""));
  const [busy, setBusy] = useState<"enquiry" | "pay" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const set = (p: Partial<Draft>) => { setError(null); setD((prev) => ({ ...prev, ...p })); };
  const fare = fareFor(d);
  const canPay = d.kind === "local" || d.kind === "tour";

  function carFare(id: Draft["carId"]) {
    if (d.kind === "local") return formatCurrency(LOCAL_FARES[id][d.localPkg]);
    if (d.kind === "tour") return formatCurrency(TOUR_FARES[d.tourId][id]);
    return "On call";
  }

  async function onEnquiry() {
    const err = validate(d);
    if (err) return setError(err);
    setBusy("enquiry");
    try {
      const res = await submitEnquiry(buildPayload(d));
      const number = res.enquiry?.enquiry_number ?? `local-${Date.now()}`;
      await saveEnquiry({ number, title: TITLES[d.kind], rows: rows(d), fare, createdAt: new Date().toISOString(), whatsapp: whatsappMessage(d, res.enquiry?.enquiry_number) });
      router.replace({ pathname: "/confirmed", params: { number } });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Unable to send your enquiry. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  async function onPay() {
    const err = validate(d);
    if (err) return setError(err);
    setBusy("pay");
    try {
      const res = await startPayNow(buildPayNow(d));
      if (!/^https?:\/\//i.test(res.redirectUrl || "")) throw new ApiError("Could not open the payment page. Please try again.");
      await saveEnquiry({ number: res.enquiry.enquiry_number, title: TITLES[d.kind], rows: rows(d), fare, createdAt: new Date().toISOString(), whatsapp: whatsappMessage(d, res.enquiry.enquiry_number) });
      await WebBrowser.openBrowserAsync(res.redirectUrl);
      router.replace({ pathname: "/payment-result", params: { ref: res.payment.merchant_txn_id, number: res.enquiry.enquiry_number } });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Unable to start the payment. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <Screen bottomPad={40}>
      <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()} style={s.back}>
        <Ionicons name="chevron-back" size={22} color={colors.white} />
      </Pressable>
      <Text style={s.eyebrow}>BOOK A RIDE</Text>
      <Text style={s.h1}>{TITLES[d.kind]}</Text>

      <View style={{ marginTop: 16 }}>
        <Segmented options={KINDS.map((k) => ({ value: k, label: KIND_LABEL[k] }))} value={d.kind} onChange={(kind) => set({ kind, pickup: kind === "outstation" ? "Visakhapatnam" : "", drop: "" })} />
      </View>

      <View style={s.form}>
        {d.kind === "local" && (
          <>
            <Field label="Pickup address" value={d.pickup} onChangeText={(pickup) => set({ pickup })} placeholder="Where should we pick you up?" />
            <Label>Package</Label>
            <Segmented options={LOCAL_PACKAGES.map((p) => ({ value: p.id, label: p.label.replace(" Hours", "hr").replace(" KM", "km") }))} value={d.localPkg} onChange={(localPkg) => set({ localPkg })} />
          </>
        )}
        {d.kind === "outstation" && (
          <>
            <Field label="Pickup" value={d.pickup} onChangeText={(pickup) => set({ pickup })} placeholder="Pickup city or address" />
            <Field label="Drop" value={d.drop} onChangeText={(drop) => set({ drop })} placeholder="Where are you going?" />
            <Segmented options={[{ value: "one", label: "One Way" }, { value: "round", label: "Round Trip" }]} value={d.round ? "round" : "one"} onChange={(v) => set({ round: v === "round" })} />
          </>
        )}
        {d.kind === "airport" && (
          <>
            <Segmented options={[{ value: "from", label: "From airport" }, { value: "to", label: "To airport" }]} value={d.fromAirport ? "from" : "to"} onChange={(v) => set({ fromAirport: v === "from", pickup: "" })} />
            <Field label={d.fromAirport ? "Drop location" : "Pickup location"} value={d.pickup} onChangeText={(pickup) => set({ pickup })} placeholder="Hotel, home or address" />
          </>
        )}
        {d.kind === "tour" && (
          <>
            <Label>Choose a package</Label>
            {TOUR_PACKAGES.map((t) => {
              const on = t.id === d.tourId;
              return (
                <Pressable key={t.id} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => set({ tourId: t.id })}>
                  <GlassCard r={16} strong={on} style={[{ padding: 14 }, on && { borderColor: colors.amber, borderWidth: 1.5 }]}>
                    <Text style={s.tourName}>{t.name}</Text>
                    <Text style={s.tourSub}>{t.days}D / {t.nights}N · {t.description}</Text>
                  </GlassCard>
                </Pressable>
              );
            })}
            {tourPkg(d).highlights.length > 0 && <Text style={s.tourSub}>Covers: {tourPkg(d).highlights.slice(0, 5).join(", ")}…</Text>}
          </>
        )}

        <View style={{ flexDirection: "row", gap: 10 }}>
          <DateTimeField label="Date" mode="date" value={d.date} minimumDate={new Date()} onChange={(date) => set({ date })} />
          {d.kind !== "tour" && <DateTimeField label="Time" mode="time" value={d.time} onChange={(time) => set({ time })} />}
        </View>

        <Label>Choose your car</Label>
        <View style={{ gap: 10 }}>
          {CAR_TYPES.map((c) => (
            <CarCard key={c.id} name={c.name} subtitle={c.subtitle} seats={c.seats} image={c.image} fare={carFare(c.id)} selected={c.id === d.carId} onPress={() => set({ carId: c.id })} />
          ))}
        </View>

        <Field label="Your name" value={d.name} onChangeText={(name) => set({ name })} placeholder="Full name" />
        <Field label="Mobile number" value={d.mobile} onChangeText={(mobile) => set({ mobile })} placeholder="10-digit mobile number" keyboardType="phone-pad" autoCapitalize="none" />
        <Field label="Email (optional)" value={d.email} onChangeText={(email) => set({ email })} placeholder="name@example.com" keyboardType="email-address" autoCapitalize="none" />

        <GlassCard strong style={s.fare}>
          <Text style={s.fareLabel}>{fare !== null ? "Fixed fare" : "Fare"}</Text>
          <Text style={s.fareValue}>{fare !== null ? formatCurrency(fare) : "Confirmed on call / WhatsApp"}</Text>
        </GlassCard>

        {error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}

        {busy ? (
          <ActivityIndicator color={colors.amber} style={{ minHeight: 52 }} />
        ) : (
          <View style={{ gap: 10 }}>
            {canPay && <Button label={`Pay Now ${formatCurrency(fare)}`} onPress={onPay} />}
            <Button label="Send Enquiry" variant={canPay ? "glass" : "primary"} onPress={onEnquiry} />
            <Button label="Quick WhatsApp" variant="outline" onPress={() => { const err = validate(d); err ? setError(err) : whatsappSupport(whatsappMessage(d)); }} />
          </View>
        )}

        <Text style={s.terms}>{TERMS_AND_CONDITIONS.map((t, i) => `${i + 1}. ${t}`).join("\n")}</Text>
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  back: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: colors.glassStrong, borderWidth: 1, borderColor: colors.glassBorder },
  eyebrow: { marginTop: 16, fontFamily: fonts.bold, fontSize: 12, letterSpacing: 2, color: colors.amber },
  h1: { marginTop: 6, fontFamily: fonts.heading, fontSize: 30, color: colors.white },
  form: { marginTop: 16, gap: 14 },
  tourName: { fontFamily: fonts.heading, fontSize: 16, color: colors.white },
  tourSub: { marginTop: 2, fontFamily: fonts.body, fontSize: 12, lineHeight: 17, color: colors.textMuted },
  fare: { padding: 16, gap: 4 },
  fareLabel: { fontFamily: fonts.semibold, fontSize: 12, color: colors.textMuted },
  fareValue: { fontFamily: fonts.heading, fontSize: 22, color: colors.amber },
  error: { fontFamily: fonts.semibold, fontSize: 14, color: colors.danger },
  terms: { fontFamily: fonts.body, fontSize: 12, lineHeight: 18, color: colors.textMuted },
});
