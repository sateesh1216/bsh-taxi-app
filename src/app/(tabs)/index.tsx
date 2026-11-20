import { useCallback, useState } from "react";
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Screen } from "../../components/Screen";
import { GlassCard } from "../../components/GlassCard";
import { Button } from "../../components/Button";
import { ImageCard } from "../../components/Content";
import { callSupport, whatsappSupport } from "../../lib/contact";
import { destinations, outstations, services, popularPickup, vehicleOptions } from "../../data/site";
import { getOutstationPricing } from "../../lib/outstation";
import { useAuth } from "../../lib/auth";
import { useT, type Key } from "../../lib/i18n";
import { useLightStatusBar } from "../../lib/statusBar";
import { getSavedPlaces, type SavedPlaces } from "../../lib/prefs";
import { listEnquiries, type SavedEnquiry } from "../../lib/storage";
import { colors } from "../../theme/colors";
import { fonts } from "../../theme/fonts";

type Icon = keyof typeof Ionicons.glyphMap;
const QUICK_BOOK: { type: "local" | "outstation" | "airport" | "tour"; key: Key; icon: Icon }[] = [
  { type: "local", key: "svc_local", icon: "car-sport" },
  { type: "airport", key: "svc_airport", icon: "airplane" },
  { type: "outstation", key: "svc_outstation", icon: "navigate" },
  { type: "tour", key: "svc_tours", icon: "map" },
];

type ActiveOffer = { id: string; title: string; message: string; actionLabel?: string };
// Add only verified, currently-active promotions here. Empty means no popup.
const ACTIVE_OFFERS: ActiveOffer[] = [];

export default function Home() {
  const { t } = useT();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  useLightStatusBar();
  const [saved, setSaved] = useState<SavedPlaces>({ home: "", office: "" });
  const [last, setLast] = useState<SavedEnquiry | null>(null);
  const [offerPopup, setOfferPopup] = useState<ActiveOffer | null>(null);

  useFocusEffect(useCallback(() => {
    getSavedPlaces().then(setSaved);
    listEnquiries().then((items) => setLast(items[0] ?? null));
  }, [user]));

  useFocusEffect(useCallback(() => {
    let active = true;
    const offer = ACTIVE_OFFERS[0];
    if (!offer) { setOfferPopup(null); return () => { active = false; }; }
    AsyncStorage.getItem(`bsh_offer_dismissed_${offer.id}`).then((dismissed) => {
      if (active && !dismissed) setOfferPopup(offer);
    }).catch(() => { if (active) setOfferPopup(offer); });
    return () => { active = false; };
  }, []));

  const dismissOffer = () => {
    if (offerPopup) AsyncStorage.setItem(`bsh_offer_dismissed_${offerPopup.id}`, "1").catch(() => { });
    setOfferPopup(null);
  };

  const first = user ? (user.name || user.email).split(" ")[0] : "";
  const lastRoute = last ? last.rows.filter((r) => ["Pickup", "From", "To", "Package"].includes(r.label)).map((r) => r.value).join(" → ") : "";

  return (
    <Screen padded={false}>
      {/* ---------- Hero: navy panel with the "Where to?" action ---------- */}
      <LinearGradient colors={[colors.ink, colors.inkSoft]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.hero, { paddingTop: insets.top + 12 }]}>
        <View style={s.glowA} pointerEvents="none" />
        <View style={s.glowB} pointerEvents="none" />
        <View style={s.top}>
          <Image source={require("../../../assets/images/logo-on-dark.png")} style={s.logo} resizeMode="contain" accessibilityLabel="BSH Taxi Services" />
          {user ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Profile" onPress={() => router.push("/profile")} style={s.avatar}>
              <Text style={s.initial}>{(user.name || user.email).charAt(0).toUpperCase()}</Text>
            </Pressable>
          ) : (
            <Pressable accessibilityRole="button" onPress={() => router.push("/login")} style={s.signin}>
              <Ionicons name="person-outline" size={15} color="#FFFFFF" />
              <Text style={s.signinText}>{t("sign_in_short")}</Text>
            </Pressable>
          )}
        </View>

        <Text style={s.h1}>{user ? `${t("hi")}, ${first}` : t("home_hero_title")}</Text>
        {user ? <Text style={s.heroSub}>{t("home_hero_title")}</Text> : <Text style={s.heroSub}>{t("home_hero_sub")}</Text>}

        <Pressable accessibilityRole="button" accessibilityLabel={t("where_to")} onPress={() => router.push("/book?type=local")} style={({ pressed }) => [s.where, pressed && { transform: [{ scale: 0.99 }] }]}>
          <View style={s.whereDot} />
          <Text style={s.whereText}>{t("where_to")}</Text>
          <View style={s.whereGo}><Ionicons name="arrow-forward" size={18} color={colors.ink} /></View>
        </Pressable>

        <View style={s.tiles}>
          {QUICK_BOOK.map((item) => (
            <Pressable key={item.type} accessibilityRole="button" accessibilityLabel={t(item.key)} onPress={() => router.push(`/book?type=${item.type}`)} style={s.tileWrap}>
              <GlassCard tone="dark" r={18} style={s.tile}>
                <Ionicons name={item.icon} size={22} color={colors.taxi} />
                <Text style={s.tileText} numberOfLines={1}>{t(item.key)}</Text>
              </GlassCard>
            </Pressable>
          ))}
        </View>
      </LinearGradient>

      <View style={s.body}>
        {/* ---------- Saved places ---------- */}
        <View style={s.pills}>
          <Pressable accessibilityRole="button" onPress={() => saved.home ? router.push(`/book?type=local&pickup=${encodeURIComponent(saved.home)}`) : router.push("/profile")} style={s.pill}>
            <View style={s.pillIcon}><Ionicons name={saved.home ? "home" : "home-outline"} size={16} color={colors.blue} /></View>
            <View style={{ flex: 1 }}>
              <Text style={s.pillText}>{saved.home ? t("place_home") : t("add_home")}</Text>
              {saved.home ? <Text numberOfLines={1} style={s.savedAddress}>{saved.home}</Text> : null}
            </View>
            {!saved.home ? <Ionicons name="add" size={16} color={colors.textMuted} /> : null}
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => saved.office ? router.push(`/book?type=local&pickup=${encodeURIComponent(saved.office)}`) : router.push("/profile")} style={s.pill}>
            <View style={s.pillIcon}><Ionicons name={saved.office ? "briefcase" : "briefcase-outline"} size={16} color={colors.blue} /></View>
            <View style={{ flex: 1 }}>
              <Text style={s.pillText}>{saved.office ? t("office") : t("add_office")}</Text>
              {saved.office ? <Text numberOfLines={1} style={s.savedAddress}>{saved.office}</Text> : null}
            </View>
            {!saved.office ? <Ionicons name="add" size={16} color={colors.textMuted} /> : null}
          </Pressable>
        </View>

        {/* ---------- Last booking ---------- */}
        {last ? (
          <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: "/confirmed", params: { number: last.number } })} style={s.last}>
            <View style={s.lastIcon}><Ionicons name="receipt-outline" size={20} color={colors.blue} /></View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={s.lastTitle}>{last.title}</Text>
              <Text style={s.lastSub} numberOfLines={1}>{lastRoute || last.number}</Text>
            </View>
            <Text style={s.lastAction}>View</Text>
          </Pressable>
        ) : null}

        {/* ---------- Popular Vizag routes ---------- */}
        <View style={s.sectionHead}>
          <View style={{ flex: 1 }}><Text style={s.h2}>{t("popular_vizag_routes")}</Text><Text style={s.sectionHint}>{t("quick_pickups_hint")}</Text></View>
        </View>
        <View style={s.list}>
          {popularPickup.slice(0, 5).map((place, i, arr) => (
            <Pressable key={place.primary} accessibilityRole="button" onPress={() => router.push(`/book?type=local&drop=${encodeURIComponent(place.fullLabel)}`)} style={[s.listRow, i === arr.length - 1 && { borderBottomWidth: 0 }]}>
              <View style={s.listIcon}><Ionicons name="location" size={16} color={colors.blue} /></View>
              <View style={{ flex: 1 }}>
                <Text style={s.listName}>{place.primary}</Text>
                <Text style={s.listMeta}>Visakhapatnam</Text>
              </View>
              <Ionicons name="chevron-forward" size={17} color={colors.faint} />
            </Pressable>
          ))}
        </View>

        {/* ---------- Outstation ---------- */}
        <View style={s.sectionHead}>
          <View style={{ flex: 1 }}><Text style={s.h2}>Popular outstation routes</Text><Text style={s.sectionHint}>Start your next trip from Vizag</Text></View>
          <Pressable accessibilityRole="button" onPress={() => router.push("/outstation")}><Text style={s.more}>View all</Text></Pressable>
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.horizontal}>
        {outstations.slice(0, 6).map((route) => {
          const fixed = vehicleOptions.map((v) => ({ vehicle: v, pricing: getOutstationPricing(route.slug, v.slug) })).filter((x) => x.pricing.mode === "fixed" && x.pricing.price > 0).sort((a, b) => (a.pricing.mode === "fixed" ? a.pricing.price : 0) - (b.pricing.mode === "fixed" ? b.pricing.price : 0));
          const cheapest = fixed[0];
          const drop = route.name.replace(/^Vizag to /i, "");
          const book = () => router.push(`/book?type=outstation&drop=${encodeURIComponent(drop)}${cheapest ? `&car=${encodeURIComponent(cheapest.vehicle.slug === "swift-dzire" ? "sedan" : cheapest.vehicle.slug === "ertiga" ? "suv" : cheapest.vehicle.slug === "innova-crysta" ? "innova_crysta" : "tempo_traveller")}` : ""}`);
          return (
            <Pressable key={route.slug} accessibilityRole="button" accessibilityLabel={`Book ${route.name}`} onPress={book} style={s.routeCard}>
              <View style={s.routeTop}>
                <View style={s.routeIcon}><Ionicons name="navigate" size={18} color={colors.blue} /></View>
                <Text style={s.routeMeta}>{route.distanceKm ? `${route.distanceKm} km` : "Outstation"}{route.driveTime ? ` · ${route.driveTime}` : ""}</Text>
              </View>
              <Text style={s.routeName} numberOfLines={2}>{route.name}</Text>
              <View style={{ flex: 1 }} />
              {cheapest ? (
                <View><Text style={s.routeUnit}>Fixed fare from</Text><Text style={s.routePrice}>₹{cheapest.pricing.mode === "fixed" ? cheapest.pricing.price.toLocaleString("en-IN") : ""}</Text></View>
              ) : route.costPerDay ? (
                <View><Text style={s.routeUnit}>From, per day</Text><Text style={s.routePrice}>₹{route.costPerDay.toLocaleString("en-IN")}</Text></View>
              ) : (
                <View><Text style={s.routeUnit}>Fare on request</Text><Text style={s.routePrice}>On call</Text></View>
              )}
              <View style={s.routeBook}><Text style={s.routeBookText}>Book now</Text><Ionicons name="arrow-forward" size={14} color="#FFFFFF" /></View>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={s.body}>
        {/* ---------- Services ---------- */}
        <View style={s.sectionHead}>
          <View style={{ flex: 1 }}><Text style={s.h2}>Our services</Text><Text style={s.sectionHint}>Travel options for every occasion</Text></View>
          <Pressable accessibilityRole="button" onPress={() => router.push("/services")}><Text style={s.more}>View all</Text></Pressable>
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.horizontal}>
        {services.slice(0, 6).map((service) => <View key={service.slug} style={{ width: 250 }}><ImageCard title={service.title} subtitle="Tap to explore and book" image={service.image} height={158} onPress={() => router.push(`/services/${service.slug}`)} /></View>)}
      </ScrollView>

      <View style={s.body}>
        {/* ---------- Destinations ---------- */}
        <View style={s.sectionHead}>
          <View style={{ flex: 1 }}><Text style={s.h2}>Explore destinations</Text><Text style={s.sectionHint}>Places worth the journey</Text></View>
          <Pressable accessibilityRole="button" onPress={() => router.push("/destinations")}><Text style={s.more}>View all</Text></Pressable>
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.horizontal}>
        {destinations.slice(0, 6).map((d) => <View key={d.slug} style={{ width: 224 }}><ImageCard title={d.name} subtitle={[d.distanceKm ? `${d.distanceKm} km` : null, d.driveTime].filter(Boolean).join(" · ")} image={d.image} height={170} onPress={() => router.push(`/destinations/${d.slug}`)} /></View>)}
      </ScrollView>

      <View style={s.body}>
        {/* ---------- Help ---------- */}
        <LinearGradient colors={[colors.ink, colors.inkSoft]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.help}>
          <View style={s.helpHead}>
            <View style={s.helpIcon}><Ionicons name="headset" size={20} color={colors.ink} /></View>
            <View style={{ flex: 1 }}>
              <Text style={s.helpTitle}>Need help choosing a ride?</Text>
              <Text style={s.helpText}>Our team is happy to help you plan your trip.</Text>
            </View>
          </View>
          <View style={s.helpActions}>
            <Button label="Call us" variant="taxi" icon="call" onPress={callSupport} style={{ flex: 1 }} />
            <Pressable accessibilityRole="button" onPress={() => whatsappSupport()} style={s.waBtn}>
              <Ionicons name="logo-whatsapp" size={18} color="#FFFFFF" /><Text style={s.waText}>WhatsApp</Text>
            </Pressable>
          </View>
        </LinearGradient>
        <Button label="Explore all services and routes" variant="glass" onPress={() => router.push("/explore")} style={{ marginTop: 14 }} />
      </View>

      <Modal visible={!!offerPopup} transparent animationType="fade" onRequestClose={dismissOffer}>
        <View style={s.offerOverlay}>
          <View style={s.offerModal}>
            <Pressable accessibilityRole="button" accessibilityLabel="Close" style={s.offerClose} onPress={dismissOffer}><Ionicons name="close" size={22} color={colors.heading} /></Pressable>
            <View style={s.offerIcon}><Ionicons name="gift-outline" size={30} color={colors.taxiDeep} /></View>
            <Text style={s.offerTitle}>{offerPopup?.title}</Text>
            <Text style={s.offerMessage}>{offerPopup?.message}</Text>
            <Button label={offerPopup?.actionLabel || "View offers"} variant="taxi" onPress={() => { dismissOffer(); router.push("/offers"); }} style={{ alignSelf: "stretch" }} />
            <Pressable onPress={dismissOffer}><Text style={s.offerDismiss}>Not now</Text></Pressable>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const s = StyleSheet.create({
  hero: { paddingHorizontal: 20, paddingBottom: 26, borderBottomLeftRadius: 34, borderBottomRightRadius: 34, overflow: "hidden" },
  glowA: { position: "absolute", width: 260, height: 260, borderRadius: 130, backgroundColor: "rgba(21,94,239,0.35)", right: -110, top: -90 },
  glowB: { position: "absolute", width: 200, height: 200, borderRadius: 100, backgroundColor: "rgba(245,162,0,0.10)", left: -90, bottom: -60 },
  top: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 22 },
  logo: { height: 38, width: 130 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.taxi, alignItems: "center", justifyContent: "center" },
  initial: { fontFamily: fonts.heading, fontSize: 18, color: colors.ink },
  signin: { minHeight: 40, paddingHorizontal: 15, borderRadius: 20, flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.glassOnInk, borderWidth: 1, borderColor: colors.glassOnInkBorder },
  signinText: { fontFamily: fonts.bold, fontSize: 13, color: "#FFFFFF" },
  h1: { fontFamily: fonts.heading, fontSize: 34, lineHeight: 40, color: "#FFFFFF" },
  heroSub: { marginTop: 8, fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: colors.onInkMuted, maxWidth: 320 },
  where: { marginTop: 22, minHeight: 62, borderRadius: 31, backgroundColor: "#FFFFFF", flexDirection: "row", alignItems: "center", paddingLeft: 20, paddingRight: 8, gap: 12 },
  whereDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.blue, borderWidth: 3, borderColor: "#BFD4FF" },
  whereText: { flex: 1, fontFamily: fonts.bold, fontSize: 17, color: colors.heading },
  whereGo: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.taxi, alignItems: "center", justifyContent: "center" },
  tiles: { flexDirection: "row", gap: 10, marginTop: 14 },
  tileWrap: { flex: 1 },
  tile: { minHeight: 78, alignItems: "center", justifyContent: "center", gap: 8, paddingHorizontal: 4 },
  tileText: { fontFamily: fonts.semibold, fontSize: 12.5, color: "#FFFFFF" },

  body: { paddingHorizontal: 20 },
  pills: { flexDirection: "row", gap: 10, marginTop: 20 },
  pill: { flex: 1, minHeight: 56, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, borderRadius: 18, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line },
  pillIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#EAF1FF", alignItems: "center", justifyContent: "center" },
  pillText: { fontFamily: fonts.semibold, fontSize: 13, color: colors.heading },
  savedAddress: { marginTop: 1, fontFamily: fonts.body, fontSize: 11, color: colors.textMuted },
  last: { marginTop: 14, flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 20, backgroundColor: colors.taxiSoft, borderWidth: 1, borderColor: "#FBE3A6" },
  lastIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  lastTitle: { fontFamily: fonts.heading, fontSize: 16, color: colors.heading },
  lastSub: { fontFamily: fonts.body, fontSize: 12, color: colors.taxiDeep },
  lastAction: { fontFamily: fonts.bold, fontSize: 13, color: colors.taxiDeep },

  sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 30, marginBottom: 12, gap: 12 },
  h2: { fontFamily: fonts.heading, fontSize: 22, color: colors.heading },
  sectionHint: { marginTop: 3, fontFamily: fonts.body, fontSize: 12.5, color: colors.textMuted },
  more: { fontFamily: fonts.bold, fontSize: 13, color: colors.blue, paddingBottom: 2 },
  list: { borderRadius: 22, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, paddingHorizontal: 14 },
  listRow: { minHeight: 62, flexDirection: "row", alignItems: "center", gap: 12, borderBottomWidth: 1, borderBottomColor: colors.divider },
  listIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#EAF1FF", alignItems: "center", justifyContent: "center" },
  listName: { fontFamily: fonts.semibold, fontSize: 14, color: colors.heading },
  listMeta: { marginTop: 1, fontFamily: fonts.body, fontSize: 11, color: colors.faint },

  horizontal: { gap: 12, paddingHorizontal: 20, paddingBottom: 2 },
  routeCard: { width: 214, minHeight: 190, padding: 15, borderRadius: 22, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line },
  routeTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  routeIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#EAF1FF", alignItems: "center", justifyContent: "center" },
  routeMeta: { fontFamily: fonts.semibold, fontSize: 11, color: colors.textMuted },
  routeName: { fontFamily: fonts.heading, fontSize: 17, lineHeight: 22, color: colors.heading },
  routeUnit: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted },
  routePrice: { fontFamily: fonts.heading, fontSize: 22, color: colors.heading },
  routeBook: { marginTop: 10, minHeight: 38, borderRadius: 19, backgroundColor: colors.blue, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  routeBookText: { fontFamily: fonts.bold, fontSize: 13, color: "#FFFFFF" },

  help: { marginTop: 30, padding: 18, gap: 16, borderRadius: 26, overflow: "hidden" },
  helpHead: { flexDirection: "row", alignItems: "center", gap: 12 },
  helpIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.taxi, alignItems: "center", justifyContent: "center" },
  helpTitle: { fontFamily: fonts.heading, fontSize: 18, color: "#FFFFFF" },
  helpText: { marginTop: 3, fontFamily: fonts.body, fontSize: 12.5, color: colors.onInkMuted },
  helpActions: { flexDirection: "row", gap: 10 },
  waBtn: { flex: 1, minHeight: 54, borderRadius: 27, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: colors.glassOnInk, borderWidth: 1.5, borderColor: colors.glassOnInkBorder },
  waText: { fontFamily: fonts.bold, fontSize: 15, color: "#FFFFFF" },

  offerOverlay: { flex: 1, backgroundColor: "rgba(10,26,63,0.55)", alignItems: "center", justifyContent: "center", padding: 22 },
  offerModal: { width: "100%", maxWidth: 420, backgroundColor: "#FFFFFF", borderRadius: 28, padding: 24, alignItems: "center", gap: 12 },
  offerClose: { alignSelf: "flex-end", padding: 4 },
  offerIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.taxiSoft, alignItems: "center", justifyContent: "center" },
  offerTitle: { fontFamily: fonts.heading, fontSize: 22, color: colors.heading, textAlign: "center" },
  offerMessage: { fontFamily: fonts.body, fontSize: 14, color: colors.body, lineHeight: 21, textAlign: "center" },
  offerDismiss: { color: colors.textMuted, fontFamily: fonts.semibold, paddingVertical: 8 },
});
