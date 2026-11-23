import { StyleSheet } from "react-native";
import { Tabs } from "expo-router";
import { BlurView } from "expo-blur";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors } from "../../theme/colors";
import { useT } from "../../lib/i18n";
import { fonts } from "../../theme/fonts";

type IconName = keyof typeof Ionicons.glyphMap;
const icon = (name: IconName) => ({ color, size }: { color: unknown; size: number }) => <Ionicons name={name} size={size} color={color as string} />;

export default function TabsLayout() {
  const { t } = useT();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.amber,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontFamily: fonts.semibold, fontSize: 12 },
        tabBarStyle: { position: "absolute", borderTopColor: colors.glassBorder, backgroundColor: "transparent", height: 70, paddingTop: 6 },
        tabBarBackground: () => <BlurView intensity={50} tint="light" style={StyleSheet.absoluteFill} />,
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
