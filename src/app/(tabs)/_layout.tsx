import { StyleSheet, View } from "react-native";
import { Tabs } from "expo-router";
import { BlurView } from "expo-blur";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, lift } from "../../theme/colors";
import { useT } from "../../lib/i18n";
import { fonts } from "../../theme/fonts";

type IconName = keyof typeof Ionicons.glyphMap;

/** Active tab gets a soft blue pill behind a filled icon; inactive tabs use outline icons. */
const icon = (base: string) => ({ color, focused }: { color: unknown; size: number; focused: boolean }) => (
  <View style={[s.iconWrap, focused && s.iconWrapOn]}>
    <Ionicons name={(focused ? base : `${base}-outline`) as IconName} size={21} color={color as string} />
  </View>
);

export default function TabsLayout() {
  const { t } = useT();
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.blue,
        tabBarInactiveTintColor: colors.faint,
        tabBarLabelStyle: { fontFamily: fonts.semibold, fontSize: 11, marginTop: 0 },
        tabBarItemStyle: { paddingTop: 6 },
        tabBarStyle: { position: "absolute", left: 14, right: 14, bottom: Math.max(insets.bottom, 10) + 2, height: 68, borderRadius: 26, borderTopWidth: 0, backgroundColor: "transparent", elevation: 0 },
        tabBarBackground: () => (
          <View style={[StyleSheet.absoluteFill, s.shell]}>
            <View style={s.clip}>
              <BlurView intensity={60} tint="light" style={StyleSheet.absoluteFill} />
              <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(255,255,255,0.92)" }]} />
            </View>
          </View>
        ),
      }}
    >
      <Tabs.Screen name="index" options={{ title: t("tab_home"), tabBarIcon: icon("home") }} />
      <Tabs.Screen name="bookings" options={{ title: t("tab_bookings"), tabBarIcon: icon("receipt") }} />
      <Tabs.Screen name="explore" options={{ title: t("tab_explore"), tabBarIcon: icon("compass") }} />
      <Tabs.Screen name="offers" options={{ title: "Offers", tabBarIcon: icon("pricetag") }} />
      <Tabs.Screen name="profile" options={{ title: t("tab_profile"), tabBarIcon: icon("person") }} />
    </Tabs>
  );
}

const s = StyleSheet.create({
  shell: { borderRadius: 26, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: colors.line, ...lift },
  clip: { flex: 1, borderRadius: 25, overflow: "hidden" },
  iconWrap: { width: 52, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  iconWrapOn: { backgroundColor: "#E4EDFF" },
});
