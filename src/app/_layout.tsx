import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { Fraunces_700Bold } from "@expo-google-fonts/fraunces";
import { PublicSans_400Regular, PublicSans_600SemiBold, PublicSans_700Bold } from "@expo-google-fonts/public-sans";
import { colors } from "../theme/colors";
import { AuthProvider } from "../lib/auth";
import { LangProvider } from "../lib/i18n";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({ Fraunces_700Bold, PublicSans_400Regular, PublicSans_600SemiBold, PublicSans_700Bold });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <LangProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.navy } }} />
      </AuthProvider>
    </LangProvider>
  );
}
