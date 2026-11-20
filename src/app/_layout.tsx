import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { Stack, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { Fraunces_700Bold } from "@expo-google-fonts/fraunces";
import { PublicSans_400Regular, PublicSans_600SemiBold, PublicSans_700Bold } from "@expo-google-fonts/public-sans";
import { FloatingCallButton } from "../components/FloatingCallButton";
import { colors } from "../theme/colors";
import { AuthProvider } from "../lib/auth";
import { LangProvider } from "../lib/i18n";

SplashScreen.preventAutoHideAsync();

// The booking screen has its own fixed action bar, so the floating call button stays out of the way there.
const HIDE_CALL_ON = ["/book", "/login"];

export default function RootLayout() {
  const [loaded] = useFonts({ Fraunces_700Bold, PublicSans_400Regular, PublicSans_600SemiBold, PublicSans_700Bold });
  const pathname = usePathname();

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <LangProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <View style={styles.appRoot}>
          <Stack screenOptions={{ headerShown: false, animation: "slide_from_right", contentStyle: { backgroundColor: colors.paper } }} />
          {HIDE_CALL_ON.some((p) => pathname.startsWith(p)) ? null : <FloatingCallButton />}
        </View>
      </AuthProvider>
    </LangProvider>
  );
}

const styles = StyleSheet.create({
  appRoot: { flex: 1 },
});
