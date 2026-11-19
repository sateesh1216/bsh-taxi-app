import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Screen } from "../components/Screen";
import { GlassCard } from "../components/GlassCard";
import { Button } from "../components/Button";
import { BottomBar, Stepper } from "../components/Flow";
import { Rows } from "../components/Rows";
import { CarCard, DateTimeField, Field, Label, Segmented } from "../components/Form";
import { LocationField } from "../components/Search";
import { CAR_TYPES, LOCAL_FARES, LOCAL_PACKAGES, TERMS_AND_CONDITIONS, TOUR_FARES, TOUR_PACKAGES } from "../data/catalog";
import { popularDrop, popularPickup, type PlaceSuggestion } from "../data/site";
import { ApiError, startPayNow, submitEnquiry } from "../lib/api";
import { KINDS, buildPayload, buildPayNow, fareFor, formatCurrency, newDraft, rows, tourPkg, validateContact, validateTrip, whatsappMessage, type Draft, type ServiceKind } from "../lib/booking";
import { getEnquiry, saveEnquiry } from "../lib/storage";
import { useAuth } from "../lib/auth";
import { REQUIRE_LOGIN } from "../lib/authConfig";
import { useT, type Key } from "../lib/i18n";
import { getSavedPlaces, type SavedPlaces } from "../lib/prefs";
import { whatsappSupport } from "../lib/contact";
import { colors } from "../theme/colors";
import { fonts } from "../theme/fonts";

const TITLES: Record<ServiceKind, string> = { local: "Local Taxi", outstation: "Outstation Cab", airport: "Airport Taxi", tour: "Tour Packages" };

export default function Book() {
  const { t } = useT();
  const { user } = useAuth();
  const params = useLocalSearchParams<{ type?: string; drop?: string; pickup?: string; car?: string; rebook?: string }>();
  const initial = KINDS.find((k) => k === params.type) ?? "local";
  const initialCarId = params.car ? CAR_TYPES.find((c) => c.id === params.car || c.name.toLowerCase().includes(String(params.car).toLowerCase()))?.id : undefined;
  const [d, setD] = useState<Draft>(() => { const x = newDraft(initial, params.drop ?? ""); return { ...x, ...(params.pickup ? { pickup: params.pickup } : {}), ...(initialCarId ? { carId: initialCarId } : {}) }; });
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState<"enquiry" | "pay" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<SavedPlaces>({ home: "", office: "" });

  useEffect(() => { getSavedPlaces().then(setSaved); }, [user]);
  useEffect(() => { if (user) setD((p) => ({ ...p, name: p.name || user.name, email: p.email || user.email, mobile: p.mobile || (user.phone ? user.phone.replace(/^\+91/, "") : "") })); }, [user]);
  useEffect(() => {
    if (!params.rebook) return;
    let active = true;
    getEnquiry(String(params.rebook)).then((saved) => {
      if (!active || !saved) return;
      const values = Object.fromEntries(saved.rows.map((r) => [r.label.toLowerCase(), r.value]));
      const title = saved.title.toLowerCase();
      const kind: ServiceKind = title.includes("airport") ? "airport" : title.includes("outstation") ? "outstation" : title.includes("tour") ? "tour" : "local";
      const carName = String(values.car || "").toLowerCase();
      const carId = CAR_TYPES.find((c) => c.name.toLowerCase() === carName || carName.includes(c.name.toLowerCase()))?.id ?? CAR_TYPES[0].id;
      const localLabel = String(values.package || "");
      const localPkg = LOCAL_PACKAGES.find((p) => p.label.toLowerCase() === localLabel.toLowerCase())?.id ?? LOCAL_PACKAGES[0].id;
      const tourId = TOUR_PACKAGES.find((p) => p.name.toLowerCase() === localLabel.toLowerCase())?.id ?? TOUR_PACKAGES[0].id;
      const from = String(values.from || values.pickup || "");
      const to = String(values.to || "");
      const airportOrigin = from.toLowerCase().includes("airport");
      const pickup = kind === "airport" ? (airportOrigin ? to : from) : from;
      setD((prev) => ({ ...prev, kind, pickup: kind === "outstation" ? pickup || "Visakhapatnam" : pickup, drop: kind === "outstation" ? to : "", carId, localPkg, tourId, round: String(values.trip || "").toLowerCase().includes("round"), fromAirport: airportOrigin, date: new Date(), name: prev.name, email: prev.email }));
    }).catch(() => {});
    return () => { active = false; };
  }, [params.rebook]);

  const account = user ? { email: user.email } : undefined;
  const pickupList = useMemo<PlaceSuggestion[]>(() => [
    ...(saved.home ? [{ primary: t("place_home"), secondary: saved.home, fullLabel: saved.home, lat: "", lon: "" }] : []),
    ...(saved.office ? [{ primary: t("place_office"), secondary: saved.office, fullLabel: saved.office, lat: "", lon: "" }] : []),
    ...popularPickup,
  ], [saved, t]);

  const set = (p: Partial<Draft>) => { setError(null); setD((prev) => ({ ...prev, ...p })); };
  const fare = fareFor(d);
  const canPay = d.kind === "local" || d.kind === "tour";
  const labels = [t("step_trip"), t("step_car"), t("step_confirm")];

  function carFare(id: Draft["carId"]) {
    if (d.kind === "local") return formatCurrency(LOCAL_FARES[id][d.localPkg]);
    if (d.kind === "tour") return formatCurrency(TOUR_FARES[d.tourId][id]);
    return t("on_call");
  }

  function next() {
    if (step === 1) { const e = validateTrip(d); if (e) return setError(t(e)); }
    setError(null);
    setStep((s) => Math.min(3, s + 1));
  }
  function back() {
    setError(null);
    if (step === 1) router.back(); else setStep((s) => s - 1);
  }

  /** Bookings must belong to an account when REQUIRE_LOGIN is on (see lib/authConfig.ts). */
  const mustSignIn = REQUIRE_LOGIN && !user;
  function askSignIn() {
    setError(t("login_to_book"));
    router.push("/login");
  }

  async function onEnquiry() {
    const err = validateTrip(d) ?? validateContact(d);
    if (err) return setError(t(err));
    if (mustSignIn) return askSignIn();
    setBusy("enquiry");
    try {
      const res = await submitEnquiry(buildPayload(d, account));
      const rawNum = res.enquiry?.enquiry_number ?? (res as unknown as { enquiry?: { id?: unknown } })?.enquiry?.id;
      const number = rawNum != null ? String(rawNum) : `local-${Date.now()}`;
      await saveEnquiry({ number, id: res.enquiry?.id, status: "pending", title: TITLES[d.kind], rows: rows(d), fare, createdAt: new Date().toISOString(), whatsapp: whatsappMessage(d, number) });
      router.replace({ pathname: "/confirmed", params: { number } });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Unable to send your enquiry. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  async function onPay() {
    const err = validateTrip(d) ?? validateContact(d);
    if (err) return setError(t(err));
    if (mustSignIn) return askSignIn();
    setBusy("pay");
    try {
      const res = await startPayNow(buildPayNow(d, account));
      if (!/^https?:\/\//i.test(res.redirectUrl || "")) throw new ApiError("Could not open the payment page. Please try again.");
      const rawNum = res.enquiry?.enquiry_number ?? (res as unknown as { enquiry?: { id?: unknown } })?.enquiry?.id;
      const number = rawNum != null ? String(rawNum) : `local-${Date.now()}`;
      await saveEnquiry({ number, id: (res.enquiry as { id?: string })?.id, status: "pending", title: TITLES[d.kind], rows: rows(d), fare, createdAt: new Date().toISOString(), whatsapp: whatsappMessage(d, number) });
      await WebBrowser.openBrowserAsync(res.redirectUrl);
      router.replace({ pathname: "/payment-result", params: { ref: res.payment.merchant_txn_id, number } });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Unable to start the payment. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  const tripRows = rows(d).filter((r) => r.label !== "Name" && r.label !== "Mobile" && r.label !== "Car");

  return (
    <View style={{ flex: 1 }}>
      <Screen bottomPad={130} scrollKey={step}>
        <Pressable accessibilityRole="button" accessibilityLabel={t("back")} onPress={back} style={s.back}>
          <Ionicons name="chevron-back" size={22} color={colors.white} />
        </Pressable>
        <Text style={s.h1}>{t(`title_${d.kind}` as Key)}</Text>
        <Stepper step={step} labels={labels} />

        {step === 1 && (
          <View style={s.form}>
            <Segmented options={KINDS.map((k) => ({ value: k, label: t(`kind_${k}` as Key) }))} value={d.kind} onChange={(kind) => set({ kind, pickup: kind === "outstation" ? "Visakhapatnam" : "", drop: "" })} />

            {d.kind === "local" && (
              <>
                <LocationField label={t("lbl_pickup_address")} value={d.pickup} onChangeText={(pickup) => set({ pickup })} placeholder={t("ph_pickup_area")} popular={pickupList} limitToVizag />
                <Label>{t("lbl_package")}</Label>
                <Segmented options={LOCAL_PACKAGES.map((p) => ({ value: p.id, label: p.label.replace(" Hours", "hr").replace(" KM", "km") }))} value={d.localPkg} onChange={(localPkg) => set({ localPkg })} />
              </>
            )}
            {d.kind === "outstation" && (
              <>
                <LocationField label={t("lbl_pickup")} value={d.pickup} onChangeText={(pickup) => set({ pickup })} placeholder={t("ph_pickup")} popular={pickupList} limitToVizag />
                <LocationField label={t("lbl_drop")} value={d.drop} onChangeText={(drop) => set({ drop })} placeholder={t("ph_drop")} popular={popularDrop} />
                <Segmented options={[{ value: "one", label: t("one_way") }, { value: "round", label: t("round_trip") }]} value={d.round ? "round" : "one"} onChange={(v) => set({ round: v === "round" })} />
              </>
            )}
            {d.kind === "airport" && (
              <>
                <Segmented options={[{ value: "from", label: t("from_airport") }, { value: "to", label: t("to_airport") }]} value={d.fromAirport ? "from" : "to"} onChange={(v) => set({ fromAirport: v === "from", pickup: "" })} />
                <LocationField label={d.fromAirport ? t("lbl_drop_loc") : t("lbl_pickup_loc")} value={d.pickup} onChangeText={(pickup) => set({ pickup })} placeholder={t("ph_airport_loc")} popular={pickupList} limitToVizag />
              </>
            )}
            {d.kind === "tour" && (
              <>
                <Label>{t("choose_package")}</Label>
                {TOUR_PACKAGES.map((x) => {
                  const on = x.id === d.tourId;
                  return (
                    <Pressable key={x.id} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => set({ tourId: x.id })}>
                      <GlassCard r={16} strong={on} style={[{ padding: 14 }, on && { borderColor: colors.amber, borderWidth: 1.5 }]}>
                        <Text style={s.tourName}>{x.name}</Text>
                        <Text style={s.tourSub}>{x.days}D / {x.nights}N · {x.description}</Text>
                      </GlassCard>
                    </Pressable>
                  );
                })}
                {tourPkg(d).highlights.length > 0 && <Text style={s.tourSub}>{t("covers")}: {tourPkg(d).highlights.slice(0, 5).join(", ")}…</Text>}
              </>
            )}

            <View style={{ flexDirection: "row", gap: 10 }}>
              <DateTimeField label={t("lbl_date")} mode="date" value={d.date} minimumDate={new Date()} onChange={(date) => set({ date })} />
              {d.kind !== "tour" && <DateTimeField label={t("lbl_time")} mode="time" value={d.time} onChange={(time) => set({ time })} />}
            </View>
          </View>
        )}

        {step === 2 && (
          <View style={s.form}>
            <Label>{t("choose_car")}</Label>
            <View style={{ gap: 10 }}>
              {CAR_TYPES.map((c) => (
                <CarCard key={c.id} name={c.name} subtitle={c.subtitle} seats={c.seats} image={c.image} fare={carFare(c.id)} selected={c.id === d.carId} onPress={() => set({ carId: c.id })} />
              ))}
            </View>
          </View>
        )}

        {step === 3 && (
          <View style={s.form}>
            <Label>{t("your_trip")}</Label>
            <GlassCard style={{ paddingHorizontal: 16, paddingVertical: 6 }}>
              <Rows rows={[...tripRows, { label: "Car", value: CAR_TYPES.find((c) => c.id === d.carId)?.name ?? "" }]} />
            </GlassCard>
            <GlassCard strong style={s.fare}>
              <Text style={s.fareLabel}>{fare !== null ? t("fare_fixed") : t("fare_label")}</Text>
              <Text style={s.fareValue}>{fare !== null ? formatCurrency(fare) : t("fare_on_call")}</Text>
            </GlassCard>

            {mustSignIn && (
              <GlassCard style={{ padding: 14, gap: 10 }}>
                <Text style={s.tourSub}>{t("login_to_book")}</Text>
                <Button label={t("sign_in")} variant="glass" onPress={() => router.push("/login")} />
              </GlassCard>
            )}

            <Label>{t("your_details")}</Label>
            <Field label={t("lbl_name")} value={d.name} onChangeText={(name) => set({ name })} placeholder={t("ph_name")} />
            <Field label={t("lbl_mobile")} value={d.mobile} onChangeText={(mobile) => set({ mobile })} placeholder={t("ph_mobile")} keyboardType="phone-pad" autoCapitalize="none" />
            <Field label={t("lbl_email")} value={d.email} onChangeText={(email) => set({ email })} placeholder="name@example.com" keyboardType="email-address" autoCapitalize="none" />

            {canPay && <Button label={t("send_enquiry")} variant="glass" onPress={onEnquiry} disabled={busy !== null} />}
            <Button label={t("quick_whatsapp")} variant="outline" onPress={() => { const e = validateTrip(d) ?? validateContact(d); e ? setError(t(e)) : whatsappSupport(whatsappMessage(d)); }} />
            <Text style={s.terms}>{TERMS_AND_CONDITIONS.map((x, i) => `${i + 1}. ${x}`).join("\n")}</Text>
          </View>
        )}
      </Screen>

      <BottomBar>
        {error ? <Text accessibilityRole="alert" style={s.error}>{error}</Text> : null}
        {busy ? (
          <ActivityIndicator color={colors.amber} style={{ flex: 1, minHeight: 52 }} />
        ) : (
          <>
            {step > 1 && <Button label={t("back")} variant="glass" onPress={back} style={{ flex: 1 }} />}
            {step < 3 ? (
              <Button label={step === 1 ? t("next_car") : t("next_confirm")} onPress={next} style={{ flex: 2 }} />
            ) : canPay ? (
              <Button label={`${t("pay_now")} ${formatCurrency(fare)}`} onPress={onPay} style={{ flex: 2 }} />
            ) : (
              <Button label={t("send_enquiry")} onPress={onEnquiry} style={{ flex: 2 }} />
            )}
          </>
        )}
      </BottomBar>
    </View>
  );
}

const s = StyleSheet.create({
  back: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: colors.glassStrong, borderWidth: 1, borderColor: colors.glassBorder },
  h1: { marginTop: 14, fontFamily: fonts.heading, fontSize: 30, color: colors.white },
  form: { marginTop: 18, gap: 14 },
  tourName: { fontFamily: fonts.heading, fontSize: 16, color: colors.white },
  tourSub: { marginTop: 2, fontFamily: fonts.body, fontSize: 12, lineHeight: 17, color: colors.textMuted },
  fare: { padding: 16, gap: 4 },
  fareLabel: { fontFamily: fonts.semibold, fontSize: 12, color: colors.textMuted },
  fareValue: { fontFamily: fonts.heading, fontSize: 24, color: colors.amber },
  error: { position: "absolute", top: -34, left: 0, right: 0, textAlign: "center", fontFamily: fonts.semibold, fontSize: 13, color: colors.danger, backgroundColor: "rgba(6,15,36,0.92)", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 10, overflow: "hidden" },
  terms: { fontFamily: fonts.body, fontSize: 12, lineHeight: 18, color: colors.textMuted },
});
