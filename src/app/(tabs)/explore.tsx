import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Screen } from "../../components/Screen";
import { GlassCard } from "../../components/GlassCard";
import { ImageCard } from "../../components/Content";
import { Button } from "../../components/Button";
import { destinations, fleetVehicles, outstations, popularPickup, reviews, services } from "../../data/site";
import { useT, type Key } from "../../lib/i18n";
import { colors } from "../../theme/colors";
import { fonts } from "../../theme/fonts";

type Icon = keyof typeof Ionicons.glyphMap;
const QUICK_BOOK: { titleKey: Key; subtitleKey: Key; icon: Icon; type: "local" | "airport" | "outstation" | "tour" }[] = [
  { titleKey: "city_ride", subtitleKey: "city_trips_hint", icon: "car-outline", type: "local" },
  { titleKey: "airport_taxi", subtitleKey: "airport_pickup_hint", icon: "airplane-outline", type: "airport" },
  { titleKey: "svc_outstation", subtitleKey: "one_round_hint", icon: "navigate-outline", type: "outstation" },
  { titleKey: "tour_packages", subtitleKey: "local_driver_hint", icon: "map-outline", type: "tour" },
];

const HUB: { title: string; sub: string; icon: Icon; href: string; count: number }[] = [
  { title: "All taxi services", sub: "Local, outstation, airport and more", icon: "briefcase-outline", href: "/services", count: services.length },
  { title: "Outstation routes", sub: "Popular trips and route information", icon: "navigate-outline", href: "/outstation", count: outstations.length },
  { title: "Tour destinations", sub: "Places around Andhra Pradesh", icon: "map-outline", href: "/destinations", count: destinations.length },
  { title: "Our taxi fleet", sub: "Compare cars, seats and luggage space", icon: "car-sport-outline", href: "/fleet", count: fleetVehicles.length },
  { title: "Reviews and FAQs", sub: "Traveller feedback and booking help", icon: "star-outline", href: "/reviews", count: reviews.length },
  { title: "About BSH Taxi", sub: "Know more about our service", icon: "information-circle-outline", href: "/about", count: 0 },
  { title: "Contact and support", sub: "Call or WhatsApp our team", icon: "call-outline", href: "/contact", count: 0 },
];

function SectionHeading({ title, action, onPress }: { title: string; action?: string; onPress?: () => void }) {
  return (
    <View style={s.sectionHead}>
      <Text style={s.sectionTitle}>{title}</Text>
      {action && onPress ? <Pressable accessibilityRole="button" onPress={onPress}><Text style={s.more}>{action}</Text></Pressable> : null}
    </View>
  );
}

export default function Explore() {
  const { t } = useT();
  return (
    <Screen>
      <Text style={s.eyebrow}>{t("explore_eyebrow")}</Text>
      <Text style={s.title}>{t("tab_explore")}</Text>
      <Text style={s.intro}>{t("explore_intro")}</Text>

      <GlassCard strong r={20} style={s.heroCard}>
        <View style={s.heroTop}>
          <View style={s.heroIcon}><Ionicons name="car-sport" size={22} color="#155EEF" /></View>
          <View style={{ flex: 1 }}>
            <Text style={s.heroTitle}>{t("where_go")}</Text>
            <Text style={s.heroSub}>{t("start_booking_hint")}</Text>
          </View>
        </View>
        <Button label={t("book_ride")} onPress={() => router.push("/book?type=local")} />
      </GlassCard>

      <SectionHeading title={t("quick_booking")} />
      <View style={s.quickGrid}>
        {QUICK_BOOK.map((item) => (
          <Pressable key={item.type} accessibilityRole="button" accessibilityLabel={`Book ${t(item.titleKey)}`} onPress={() => router.push(`/book?type=${item.type}`)} style={s.quickWrap}>
            <GlassCard r={17} style={s.quickCard}>
              <View style={s.quickIcon}><Ionicons name={item.icon} size={21} color="#155EEF" /></View>
              <Text style={s.quickTitle}>{t(item.titleKey)}</Text>
              <Text style={s.quickSub}>{t(item.subtitleKey)}</Text>
              <View style={s.quickFooter}><Text style={s.quickAction}>{t("book_now")}</Text><Ionicons name="arrow-forward" size={15} color="#155EEF" /></View>
            </GlassCard>
          </Pressable>
        ))}
      </View>

      <SectionHeading title={t("popular_locations")} action={t("all_locations")} onPress={() => router.push("/book?type=local")} />
      <Text style={s.helper}>{t("choose_destination_hint")}</Text>
      <View style={s.locationGrid}>
        {popularPickup.slice(0, 8).map((place) => (
          <Pressable key={place.primary} accessibilityRole="button" onPress={() => router.push(`/book?type=local&drop=${encodeURIComponent(place.fullLabel)}`)} style={s.locationItem}>
            <View style={s.locationIcon}><Ionicons name="location-outline" size={17} color="#155EEF" /></View>
            <View style={{ flex: 1 }}><Text style={s.locationName}>{place.primary}</Text><Text style={s.locationSub} numberOfLines={1}>{place.secondary}</Text></View>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </Pressable>
        ))}
      </View>

      <SectionHeading title="Popular outstation routes" action="See all" onPress={() => router.push("/outstation")} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.horizontal}>
        {outstations.slice(0, 8).map((route) => {
          const drop = route.name.replace(/^Vizag to /i, "");
          return (
            <Pressable key={route.slug} accessibilityRole="button" accessibilityLabel={`Book ${route.name}`} onPress={() => router.push(`/book?type=outstation&drop=${encodeURIComponent(drop)}`)} style={{ width: 220 }}>
              <GlassCard r={17} style={s.routeCard}>
                <View style={s.routeIcon}><Ionicons name="navigate" size={19} color="#155EEF" /></View>
                <Text style={s.routeName}>{route.name}</Text>
                <Text style={s.routeSub}>{route.distanceKm ? `${route.distanceKm} km` : "Outstation route"}{route.costPerDay ? ` · From ₹${route.costPerDay.toLocaleString("en-IN")}/day` : ""}</Text>
                <View style={s.cardAction}><Text style={s.cardActionText}>Book this route</Text><Ionicons name="arrow-forward" size={14} color="#155EEF" /></View>
              </GlassCard>
            </Pressable>
          );
        })}
      </ScrollView>

      <SectionHeading title="Tour destinations" action="Explore all" onPress={() => router.push("/destinations")} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.horizontal}>
        {destinations.slice(0, 6).map((destination) => (
          <View key={destination.slug} style={{ width: 238 }}>
            <ImageCard title={destination.name} subtitle={[destination.category, destination.distanceKm ? `${destination.distanceKm} km from Vizag` : null].filter(Boolean).join(" · ")} image={destination.image} height={155} onPress={() => router.push(`/destinations/${destination.slug}`)} />
            <Pressable accessibilityRole="button" onPress={() => router.push(`/book?type=outstation&drop=${encodeURIComponent(destination.name)}`)} style={s.underCardAction}><Text style={s.underCardText}>Book a cab to {destination.name}</Text><Ionicons name="arrow-forward" size={14} color="#155EEF" /></Pressable>
          </View>
        ))}
      </ScrollView>

      <SectionHeading title="Choose your taxi" action="View fleet" onPress={() => router.push("/fleet")} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.horizontal}>
        {fleetVehicles.slice(0, 6).map((vehicle) => (
          <Pressable key={vehicle.slug} accessibilityRole="button" onPress={() => router.push("/fleet")} style={{ width: 205 }}>
            <GlassCard r={17} style={s.vehicleCard}>
              <Text style={s.vehicleName}>{vehicle.name}</Text>
              <Text style={s.vehicleMeta}>{vehicle.seats} seats · {vehicle.bags} bags · {vehicle.hasAC ? "AC" : "Non-AC"}</Text>
              <Text style={s.vehicleUse}>{vehicle.description}</Text>
              <Text style={s.vehicleAction}>View details <Ionicons name="arrow-forward" size={13} color="#155EEF" /></Text>
            </GlassCard>
          </Pressable>
        ))}
      </ScrollView>

      <SectionHeading title="Our services" action="All services" onPress={() => router.push("/services")} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.horizontal}>
        {services.slice(0, 8).map((service) => (
          <View key={service.slug} style={{ width: 238 }}>
            <ImageCard title={service.title} subtitle="View details · Book this service" image={service.image} height={160} onPress={() => router.push(`/services/${service.slug}`)} />
          </View>
        ))}
      </ScrollView>

      <SectionHeading title="More from BSH" />
      <View style={s.list}>
        {HUB.map((item) => (
          <Pressable key={item.title} accessibilityRole="button" onPress={() => router.push(item.href as never)}>
            <GlassCard r={16} style={s.hubRow}>
              <View style={s.hubIcon}><Ionicons name={item.icon} size={20} color="#155EEF" /></View>
              <View style={{ flex: 1 }}><Text style={s.hubTitle}>{item.title}</Text><Text style={s.hubSub}>{item.sub}</Text></View>
              {item.count > 0 ? <Text style={s.count}>{item.count}</Text> : null}
              <Ionicons name="chevron-forward" size={17} color={colors.textMuted} />
            </GlassCard>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  eyebrow: { fontFamily: fonts.bold, fontSize: 10, letterSpacing: 1.6, color: colors.amber },
  title: { marginTop: 5, fontFamily: fonts.heading, fontSize: 32, color: colors.white },
  intro: { marginTop: 5, marginBottom: 18, fontFamily: fonts.body, fontSize: 13, lineHeight: 20, color: colors.textMuted },
  heroCard: { padding: 15, gap: 13 },
  heroTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  heroIcon: { width: 46, height: 46, borderRadius: 14, backgroundColor: "#EFF5FF", alignItems: "center", justifyContent: "center" },
  heroTitle: { fontFamily: fonts.heading, fontSize: 18, color: colors.white },
  heroSub: { marginTop: 3, fontFamily: fonts.body, fontSize: 12, color: colors.textMuted },
  sectionHead: { marginTop: 23, marginBottom: 11, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  sectionTitle: { fontFamily: fonts.heading, fontSize: 20, color: colors.white, flex: 1 },
  more: { fontFamily: fonts.semibold, fontSize: 12, color: colors.amber },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  quickWrap: { width: "48%", flexGrow: 1 },
  quickCard: { minHeight: 150, padding: 12, gap: 5 },
  quickIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: "#EFF5FF", alignItems: "center", justifyContent: "center", marginBottom: 3 },
  quickTitle: { fontFamily: fonts.heading, fontSize: 15, color: colors.white },
  quickSub: { minHeight: 30, fontFamily: fonts.body, fontSize: 11, lineHeight: 15, color: colors.textMuted },
  quickFooter: { marginTop: "auto", paddingTop: 7, borderTopWidth: 1, borderTopColor: colors.divider, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  quickAction: { fontFamily: fonts.semibold, fontSize: 12, color: colors.amber },
  helper: { marginTop: -5, marginBottom: 8, fontFamily: fonts.body, fontSize: 11, lineHeight: 16, color: colors.textMuted },
  locationGrid: { borderRadius: 16, borderWidth: 1, borderColor: colors.glassBorder, backgroundColor: "#FFFFFF", paddingHorizontal: 12 },
  locationItem: { minHeight: 59, flexDirection: "row", alignItems: "center", gap: 10, borderBottomWidth: 1, borderBottomColor: colors.divider },
  locationIcon: { width: 34, height: 34, borderRadius: 11, backgroundColor: "#EFF5FF", alignItems: "center", justifyContent: "center" },
  locationName: { fontFamily: fonts.semibold, fontSize: 13, color: colors.white },
  locationSub: { marginTop: 2, fontFamily: fonts.body, fontSize: 10, color: colors.textMuted },
  horizontal: { gap: 11, paddingRight: 2, paddingBottom: 2 },
  routeCard: { minHeight: 151, padding: 13, gap: 5 },
  routeIcon: { width: 36, height: 36, borderRadius: 11, backgroundColor: "#EFF5FF", alignItems: "center", justifyContent: "center", marginBottom: 2 },
  routeName: { fontFamily: fonts.heading, fontSize: 15, color: colors.white },
  routeSub: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted },
  cardAction: { marginTop: "auto", paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.divider, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardActionText: { fontFamily: fonts.semibold, fontSize: 11, color: colors.amber },
  underCardAction: { marginTop: 7, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 2 },
  underCardText: { fontFamily: fonts.semibold, fontSize: 11, color: colors.amber },
  vehicleCard: { minHeight: 122, padding: 13, gap: 5 },
  vehicleName: { fontFamily: fonts.heading, fontSize: 16, color: colors.white },
  vehicleMeta: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted },
  vehicleUse: { fontFamily: fonts.body, fontSize: 11, lineHeight: 15, color: colors.textMuted },
  vehicleAction: { marginTop: "auto", fontFamily: fonts.semibold, fontSize: 11, color: colors.amber },
  list: { gap: 9, marginBottom: 15 },
  hubRow: { flexDirection: "row", alignItems: "center", gap: 11, padding: 11 },
  hubIcon: { width: 39, height: 39, borderRadius: 12, backgroundColor: "#EFF5FF", alignItems: "center", justifyContent: "center" },
  hubTitle: { fontFamily: fonts.heading, fontSize: 14, color: colors.white },
  hubSub: { marginTop: 2, fontFamily: fonts.body, fontSize: 10, color: colors.textMuted },
  count: { fontFamily: fonts.bold, fontSize: 11, color: colors.amber, marginRight: 1 },
});
