import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors } from "../theme/colors";
import { fonts } from "../theme/fonts";

export function Header({ title, eyebrow }: { title: string; eyebrow?: string }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))} style={s.back}>
        <Ionicons name="chevron-back" size={22} color={colors.white} />
      </Pressable>
      {eyebrow ? <Text style={s.eyebrow}>{eyebrow}</Text> : null}
      <Text style={s.title}>{title}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  back: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: colors.glassStrong, borderWidth: 1, borderColor: colors.glassBorder },
  eyebrow: { marginTop: 16, fontFamily: fonts.bold, fontSize: 12, letterSpacing: 2, color: colors.amber },
  title: { marginTop: 8, fontFamily: fonts.heading, fontSize: 30, lineHeight: 34, color: colors.white },
});
