import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors } from "../theme/colors";
import { fonts } from "../theme/fonts";

/** "WHO WE ARE" -> "Who we are" (keeps BSH in capitals). */
const soft = (s: string) => (s.charAt(0) + s.slice(1).toLowerCase()).replace(/\bbsh\b/i, "BSH");

export function Header({ title, eyebrow }: { title: string; eyebrow?: string }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))} style={s.back}>
        <Ionicons name="chevron-back" size={22} color={colors.heading} />
      </Pressable>
      {eyebrow ? <Text style={s.eyebrow}>{soft(eyebrow)}</Text> : null}
      <Text style={[s.title, !eyebrow && { marginTop: 14 }]} accessibilityRole="header">{title}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  back: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line },
  eyebrow: { marginTop: 16, fontFamily: fonts.semibold, fontSize: 13, color: colors.blue },
  title: { marginTop: 4, fontFamily: fonts.heading, fontSize: 30, lineHeight: 36, color: colors.heading },
});
