import { useCallback, useState } from "react";
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { Screen } from "../../components/Screen";
import { GlassCard } from "../../components/GlassCard";
import { Button } from "../../components/Button";
import { ImageCard } from "../../components/Content";
import { callSupport, whatsappSupport } from "../../lib/contact";
import { destinations, outstations, services, popularPickup } from "../../data/site";
import { useAuth } from "../../lib/auth";
import { useT, type Key } from "../../lib/i18n";
import { getSavedPlaces, type SavedPlaces } from "../../lib/prefs";
import { listEnquiries, type SavedEnquiry } from "../../lib/storage";
import { colors } from "../../theme/colors";
import { fonts } from "../../theme/fonts";

type Icon = keyof typeof Ionicons.glyphMap;
const QUICK_BOOK: { type: "local" | "outstation" | "airport" | "tour"; key: Key; icon: Icon; noteKey: Key }[] = [
  { type: "local", key: "svc_local", icon: "car-sport", noteKey: "city_trips_hint" },
  { type: "outstation", key: "svc_outstation", icon: "navigate", noteKey: "one_round_hint" },
  { type: "airport", key: "svc_airport", icon: "airplane", noteKey: "airport_pickup_hint" },
  { type: "tour", key: "svc_tours", icon: "map", noteKey: "local_driver_hint" },
];

type ActiveOffer = { id: string; title: string; message: string; actionLabel?: string };
// Add only verified, currently-active promotions here. Empty means no popup.
const ACTIVE_OFFERS: ActiveOffer[] = [];

export default function Home() {
  const { t } = useT();
  const { user } = useAuth();
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

  const first = user ? (user.name || user.email).split(" ")[0] : "";
  const lastRoute = last ? last.rows.filter((r) => ["Pickup", "From", "To", "Package"].includes(r.label)).map((r) => r.value).join(" → ") : "";

  return (
    <Screen>
      <View style={s.top}>
        <Image source={require("../../../assets/images/logo-light.webp")} style={s.logo} resizeMode="contain" accessibilityLabel="BSH Taxi Services" />
        {user ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Profile" onPress={() => router.push("/profile")} style={s.avatar}><Text style={s.initial}>{(user.name || user.email).charAt(0).toUpperCase()}</Text></Pressable>
        ) : (
          <Pressable accessibilityRole="button" onPress={() => router.push("/login")} style={s.signin}><Text style={s.signinText}>{t("sign_in_short")}</Text></Pressable>
        )}
      </View>

      <View style={s.heroWrap}>
        <LinearGradient colors={["#FFFFFF", "#F8FAFF", "#F2F6FF"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.hero}>
          <View style={s.heroGlow} />
          <Text style={s.eyebrow}>{user ? `${t("hi")}, ${first}` : "BSH TAXI SERVICES · VIZAG"}</Text>
          <Text style={s.h1}>{t("home_hero_title")}</Text>
          <Text style={s.heroSub}>{t("home_hero_sub")}</Text>
          <Pressable accessibilityRole="button" onPress={() => router.push("/book?type=local")} style={s.searchAction}>
            <View style={s.searchIcon}><Ionicons name="search" size={20} color="#FFFFFF" /></View>
            <View style={{ flex: 1 }}><Text style={s.searchTitle}>{t("book_home")}</Text><Text style={s.searchSub}>{t("book_home_hint")}</Text></View>
            <Ionicons name="arrow-forward-circle" size={29} color={colors.amber} />
          </Pressable>
          <View style={s.trustLine}>
            <View style={s.trustItem}><Ionicons name="shield-checkmark" size={14} color={colors.amber} /><Text style={s.trustText}>{t("reliable_service")}</Text></View>
            <View style={s.trustItem}><Ionicons name="call" size={14} color={colors.amber} /><Text style={s.trustText}>24/7 support</Text></View>
          </View>
        </LinearGradient>
      </View>

      <View style={s.homeBooking}>
        <View style={s.homeBookingHead}><View style={{ flex: 1 }}><Text style={s.h2}>{t("book_home")}</Text><Text style={s.sectionHint}>{t("everyday_rides")}</Text></View><View style={s.homeBookingIcon}><Ionicons name="home" size={20} color="#155EEF" /></View></View>
        <View style={s.homeBookingActions}>
          <Pressable accessibilityRole="button" onPress={() => router.push("/book?type=local")} style={s.homeAction}><Ionicons name="car-outline" size={19} color="#155EEF" /><Text style={s.homeActionText}>{t("city_ride")}</Text></Pressable>
          <Pressable accessibilityRole="button" onPress={() => router.push("/book?type=airport")} style={s.homeAction}><Ionicons name="airplane-outline" size={19} color="#155EEF" /><Text style={s.homeActionText}>Airport</Text></Pressable>
          <Pressable accessibilityRole="button" onPress={() => router.push("/book?type=outstation")} style={s.homeAction}><Ionicons name="navigate-outline" size={19} color="#155EEF" /><Text style={s.homeActionText}>Outstation</Text></Pressable>
        </View>
        <Pressable accessibilityRole="button" onPress={() => router.push("/book?type=airport")} style={s.airportBanner}><View style={s.airportIcon}><Ionicons name="airplane" size={20} color="#155EEF" /></View><View style={{ flex: 1 }}><Text style={s.airportTitle}>{t("airport_pickup_drop")}</Text><Text style={s.airportSub}>{t("airport_ride_hint")}</Text></View><Ionicons name="chevron-forward" size={20} color="#155EEF" /></Pressable>
      </View>

      <View style={s.sectionHead}><Text style={s.h2}>{t("book_by_service")}</Text><Text style={s.sectionHint}>{t("choose_need")}</Text></View>
      <View style={s.tiles}>
        {QUICK_BOOK.map((item) => (
          <Pressable key={item.type} accessibilityRole="button" accessibilityLabel={t(item.key)} onPress={() => router.push(`/book?type=${item.type}`)} style={s.tileWrap}>
            <GlassCard r={18} style={s.tile}>
              <View style={s.tileTop}><View style={s.tileIcon}><Ionicons name={item.icon} size={22} color={colors.navy} /></View><Ionicons name="arrow-up-right-box" size={17} color={colors.amber} /></View>
              <Text style={s.tileText}>{t(item.key)}</Text><Text style={s.tileNote}>{t(item.noteKey)}</Text>
            </GlassCard>
          </Pressable>
        ))}
      </View>

      <View style={s.savedSection}>
        <View style={s.sectionHead}><View><Text style={s.h2}>{t("saved_addresses_home")}</Text><Text style={s.sectionHint}>{t("usual_places_hint")}</Text></View><Pressable accessibilityRole="button" onPress={() => router.push("/profile")}><Text style={s.more}>{t("manage")}</Text></Pressable></View>
        <View style={s.pills}>
          {saved.home ? <Pressable accessibilityRole="button" onPress={() => router.push(`/book?type=local&pickup=${encodeURIComponent(saved.home)}`)} style={s.pill}><Ionicons name="home" size={16} color={colors.amber} /><View style={{ flex: 1 }}><Text style={s.pillText}>Home</Text><Text numberOfLines={1} style={s.savedAddress}>{saved.home}</Text></View><Ionicons name="arrow-forward" size={14} color={colors.textMuted} /></Pressable> : <Pressable accessibilityRole="button" onPress={() => router.push("/profile")} style={s.pill}><Ionicons name="home-outline" size={16} color={colors.amber} /><Text style={s.pillText}>{t("add_home")}</Text><Ionicons name="add" size={16} color={colors.textMuted} /></Pressable>}
          {saved.office ? <Pressable accessibilityRole="button" onPress={() => router.push(`/book?type=local&pickup=${encodeURIComponent(saved.office)}`)} style={s.pill}><Ionicons name="briefcase" size={16} color={colors.amber} /><View style={{ flex: 1 }}><Text style={s.pillText}>{t("office")}</Text><Text numberOfLines={1} style={s.savedAddress}>{saved.office}</Text></View><Ionicons name="arrow-forward" size={14} color={colors.textMuted} /></Pressable> : <Pressable accessibilityRole="button" onPress={() => router.push("/profile")} style={s.pill}><Ionicons name="briefcase-outline" size={16} color={colors.amber} /><Text style={s.pillText}>{t("add_office")}</Text><Ionicons name="add" size={16} color={colors.textMuted} /></Pressable>}
        </View>
      </View>

      <View style={s.sectionHead}><View><Text style={s.h2}>{t("popular_vizag_routes")}</Text><Text style={s.sectionHint}>{t("quick_pickups_hint")}</Text></View><Pressable accessibilityRole="button" onPress={() => router.push("/book?type=local")}><Text style={s.more}>Book a ride</Text></Pressable></View>
      <View style={s.localRoutes}>
        {popularPickup.slice(0, 6).map((place) => <Pressable key={place.primary} accessibilityRole="button" onPress={() => router.push(`/book?type=local&drop=${encodeURIComponent(place.fullLabel)}`)} style={s.localRoute}><View style={s.localRouteIcon}><Ionicons name="location-outline" size={17} color="#155EEF" /></View><View style={{ flex: 1 }}><Text style={s.localRouteName}>{place.primary}</Text><Text style={s.localRouteMeta}>Visakhapatnam</Text></View><Ionicons name="arrow-forward" size={17} color={colors.textMuted} /></Pressable>)}
      </View>

      {last ? <>
        <Text style={s.h2}>Continue where you left off</Text>
        <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: "/confirmed", params: { number: last.number } })}>
          <GlassCard style={s.lastCard}><View style={s.lastIcon}><Ionicons name="receipt-outline" size={22} color={colors.navy} /></View><View style={{ flex: 1, gap: 3 }}><Text style={s.lastTitle}>{last.title}</Text><Text style={s.lastSub} numberOfLines={1}>{lastRoute || last.number}</Text></View><Ionicons name="chevron-forward" size={20} color={colors.amber} /></GlassCard>
        </Pressable>
      </> : null}

      <View style={s.sectionHead}><View><Text style={s.h2}>Popular outstation routes</Text><Text style={s.sectionHint}>Start your next trip from Vizag</Text></View><Pressable accessibilityRole="button" onPress={() => router.push("/outstation")}><Text style={s.more}>View all</Text></Pressable></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.horizontal}>
        {outstations.slice(0, 6).map((route) => (
          <Pressable key={route.slug} accessibilityRole="button" onPress={() => router.push(`/book?type=outstation&drop=${encodeURIComponent(route.name.replace(/^Vizag to /i, ""))}`)} style={{ width: 218 }}>
            <GlassCard r={18} style={s.routeCard}>
              <View style={s.routeIcon}><Ionicons name="navigate" size={20} color={colors.navy} /></View>
              <Text style={s.routeName}>{route.name}</Text>
              <Text style={s.routeMeta}>{route.distanceKm ? `${route.distanceKm} km` : "Outstation trip"}{route.driveTime ? ` · ${route.driveTime}` : ""}</Text>
              {route.costPerDay ? <Text style={s.routePrice}>From ₹{route.costPerDay.toLocaleString("en-IN")}<Text style={s.routeUnit}> / day</Text></Text> : null}
              <View style={s.routeBook}><Text style={s.routeBookText}>Book this route</Text><Ionicons name="arrow-forward" size={15} color={colors.amber} /></View>
            </GlassCard>
          </Pressable>
        ))}
      </ScrollView>

      <View style={s.sectionHead}><View><Text style={s.h2}>Our services</Text><Text style={s.sectionHint}>Travel options for every occasion</Text></View><Pressable accessibilityRole="button" onPress={() => router.push("/services")}><Text style={s.more}>View all</Text></Pressable></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.horizontal}>
        {services.slice(0, 6).map((service) => <View key={service.slug} style={{ width: 245 }}><ImageCard title={service.title} subtitle="Tap to explore and book" image={service.image} height={156} onPress={() => router.push(`/services/${service.slug}`)} /></View>)}
      </ScrollView>

      <View style={s.sectionHead}><View><Text style={s.h2}>Explore destinations</Text><Text style={s.sectionHint}>Places worth the journey</Text></View><Pressable accessibilityRole="button" onPress={() => router.push("/destinations")}><Text style={s.more}>View all</Text></Pressable></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.horizontal}>
        {destinations.slice(0, 6).map((d) => <View key={d.slug} style={{ width: 218 }}><ImageCard title={d.name} subtitle={[d.distanceKm ? `${d.distanceKm} km` : null, d.driveTime].filter(Boolean).join(" · ")} image={d.image} height={145} onPress={() => router.push(`/destinations/${d.slug}`)} /></View>)}
      </ScrollView>

      <GlassCard strong style={s.help}>
        <View style={s.helpHead}><View style={s.helpIcon}><Ionicons name="headset" size={20} color={colors.navy} /></View><View style={{ flex: 1 }}><Text style={s.helpTitle}>Need help choosing a ride?</Text><Text style={s.helpText}>Our team is happy to help you plan your trip.</Text></View></View>
        <View style={s.helpActions}><Button label="Call us" onPress={callSupport} style={{ flex: 1 }} /><Button label="WhatsApp" variant="outline" onPress={() => whatsappSupport()} style={{ flex: 1 }} /></View>
      </GlassCard>
      <Button label="Explore all services and routes" variant="glass" onPress={() => router.push("/explore")} style={{ marginTop: 14 }} />
          <Modal visible={!!offerPopup} transparent animationType="fade" onRequestClose={() => {
        if (offerPopup) AsyncStorage.setItem(`bsh_offer_dismissed_${offerPopup.id}`, "1").catch(() => {});
        setOfferPopup(null);
      }}>
        <View style={s.offerOverlay}>
          <View style={s.offerModal}>
            <Pressable style={s.offerClose} onPress={() => {
              if (offerPopup) AsyncStorage.setItem(`bsh_offer_dismissed_${offerPopup.id}`, "1").catch(() => {});
              setOfferPopup(null);
            }}><Ionicons name="close" size={22} color={colors.text} /></Pressable>
            <Ionicons name="gift-outline" size={36} color={colors.primary} />
            <Text style={s.offerTitle}>{offerPopup?.title}</Text>
            <Text style={s.offerMessage}>{offerPopup?.message}</Text>
            <Button label={offerPopup?.actionLabel || "View offers"} onPress={() => {
              if (offerPopup) AsyncStorage.setItem(`bsh_offer_dismissed_${offerPopup.id}`, "1").catch(() => {});
              setOfferPopup(null); router.push("/offers");
            }} />
            <Pressable onPress={() => {
              if (offerPopup) AsyncStorage.setItem(`bsh_offer_dismissed_${offerPopup.id}`, "1").catch(() => {});
              setOfferPopup(null);
            }}><Text style={s.offerDismiss}>Not now</Text></Pressable>
          </View>
        </View>
      </Modal>
</Screen>
  );
}

const s = StyleSheet.create({
  top: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 16 },
  logo: { height: 48, width: 190, flexShrink: 1 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.amber, alignItems: "center", justifyContent: "center" },
  initial: { fontFamily: fonts.heading, fontSize: 18, color: colors.navy },
  signin: { minHeight: 42, paddingHorizontal: 17, borderRadius: 22, justifyContent: "center", backgroundColor: colors.amber },
  signinText: { fontFamily: fonts.bold, fontSize: 14, color: colors.navy },
  heroWrap: { borderRadius: 25, overflow: "hidden", marginBottom: 24 },
  hero: { padding: 20, paddingTop: 23, overflow: "hidden", borderRadius: 25, borderWidth: 1, borderColor: "#E4ECFA" },
  heroGlow: { position: "absolute", width: 180, height: 180, borderRadius: 90, backgroundColor: "rgba(21,94,239,0.10)", right: -70, top: -65 },
  eyebrow: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1.5, color: "#155EEF" },
  h1: { marginTop: 9, fontFamily: fonts.heading, fontSize: 34, lineHeight: 39, color: "#101828" },
  heroSub: { marginTop: 8, fontFamily: fonts.body, fontSize: 13, lineHeight: 19, color: "#667085" },
  searchAction: { marginTop: 20, minHeight: 70, borderRadius: 17, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#D0DDF5", flexDirection: "row", alignItems: "center", paddingHorizontal: 13, gap: 12 },
  searchIcon: { width: 40, height: 40, borderRadius: 13, backgroundColor: "#155EEF", alignItems: "center", justifyContent: "center" },
  searchTitle: { fontFamily: fonts.bold, fontSize: 16, color: "#101828" },
  searchSub: { marginTop: 2, fontFamily: fonts.body, fontSize: 12, color: "#667085" },
  trustLine: { flexDirection: "row", gap: 18, marginTop: 17 },
  trustItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  trustText: { fontFamily: fonts.semibold, fontSize: 11, color: "#667085" },
  homeBooking: { padding: 16, borderRadius: 20, borderWidth: 1, borderColor: "#E4E7EC", backgroundColor: "#FFFFFF", marginBottom: 22, gap: 13 },
  homeBookingHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  homeBookingIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: "#EFF5FF", alignItems: "center", justifyContent: "center" },
  homeBookingActions: { flexDirection: "row", gap: 8 },
  homeAction: { flex: 1, minHeight: 58, borderRadius: 14, backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#EAECF0", alignItems: "center", justifyContent: "center", gap: 5 },
  homeActionText: { fontFamily: fonts.semibold, fontSize: 12, color: "#344054" },
  airportBanner: { minHeight: 66, borderRadius: 15, backgroundColor: "#EFF5FF", paddingHorizontal: 12, flexDirection: "row", alignItems: "center", gap: 11 },
  airportIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  airportTitle: { fontFamily: fonts.bold, fontSize: 14, color: "#1849A9" },
  airportSub: { marginTop: 2, fontFamily: fonts.body, fontSize: 11, color: "#475467" },
  savedSection: { marginBottom: 18 },
  savedAddress: { fontFamily: fonts.body, fontSize: 10, color: "#667085", maxWidth: 140 },
  localRoutes: { borderRadius: 18, borderWidth: 1, borderColor: "#E4E7EC", backgroundColor: "#FFFFFF", paddingHorizontal: 13, marginBottom: 20 },
  localRoute: { minHeight: 60, flexDirection: "row", alignItems: "center", gap: 11, borderBottomWidth: 1, borderBottomColor: "#F2F4F7" },
  localRouteIcon: { width: 34, height: 34, borderRadius: 11, backgroundColor: "#EFF5FF", alignItems: "center", justifyContent: "center" },
  localRouteName: { fontFamily: fonts.semibold, fontSize: 13, color: "#344054" },
  localRouteMeta: { marginTop: 2, fontFamily: fonts.body, fontSize: 10, color: "#98A2B3" },
  sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 2, marginBottom: 11, gap: 12 },
  h2: { fontFamily: fonts.heading, fontSize: 21, color: colors.white },
  sectionHint: { marginTop: 3, fontFamily: fonts.body, fontSize: 12, color: colors.textMuted },
  more: { fontFamily: fonts.semibold, fontSize: 13, color: colors.amber, paddingBottom: 2 },
  tiles: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 18 },
  tileWrap: { width: "48%", flexGrow: 1 },
  tile: { minHeight: 122, padding: 13, justifyContent: "space-between" },
  tileTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  tileIcon: { width: 40, height: 40, borderRadius: 13, backgroundColor: colors.amber, alignItems: "center", justifyContent: "center" },
  tileText: { marginTop: 10, fontFamily: fonts.heading, fontSize: 16, color: colors.white },
  tileNote: { marginTop: 3, fontFamily: fonts.body, fontSize: 11, color: colors.textMuted },
  pills: { flexDirection: "row", gap: 9, marginBottom: 18 },
  pill: { minHeight: 43, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 13, borderRadius: 22, backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.glassBorder },
  pillText: { fontFamily: fonts.semibold, fontSize: 13, color: colors.white },
  lastCard: { padding: 14, flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 18 },
  lastIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.amber, alignItems: "center", justifyContent: "center" },
  lastTitle: { fontFamily: fonts.heading, fontSize: 16, color: colors.white },
  lastSub: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted },
  horizontal: { gap: 11, paddingRight: 2, paddingBottom: 2 },
  routeCard: { minHeight: 176, padding: 14, gap: 5 },
  routeIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.amber, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  routeName: { fontFamily: fonts.heading, fontSize: 16, color: colors.white },
  routeMeta: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted },
  routePrice: { marginTop: 4, fontFamily: fonts.bold, fontSize: 15, color: colors.amber },
  routeUnit: { fontFamily: fonts.body, fontSize: 10, color: colors.textMuted },
  routeBook: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: colors.divider, paddingTop: 9, marginTop: 7 },
  routeBookText: { fontFamily: fonts.semibold, fontSize: 12, color: colors.white },
  help: { marginTop: 24, padding: 16, gap: 14 },
  helpHead: { flexDirection: "row", alignItems: "center", gap: 11 },
  helpIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.amber, alignItems: "center", justifyContent: "center" },
  helpTitle: { fontFamily: fonts.heading, fontSize: 17, color: colors.white },
  helpText: { marginTop: 3, fontFamily: fonts.body, fontSize: 12, color: colors.textMuted },
  helpActions: { flexDirection: "row", gap: 10 },
  offerOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", alignItems: "center", justifyContent: "center", padding: 22 },
  offerModal: { width: "100%", maxWidth: 420, backgroundColor: colors.white, borderRadius: 22, padding: 24, alignItems: "center", gap: 12 },
  offerClose: { alignSelf: "flex-end", padding: 4 },
  offerTitle: { fontFamily: fonts.heading, fontSize: 22, color: colors.white, textAlign: "center" },
  offerMessage: { fontFamily: fonts.body, fontSize: 14, color: colors.textMuted, lineHeight: 21, textAlign: "center" },
  offerDismiss: { color: colors.textMuted, fontFamily: fonts.semibold, paddingVertical: 8 },
});
