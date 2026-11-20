import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors, radius } from "../theme/colors";
import { fonts } from "../theme/fonts";

type Props = {
  label: string;
  onPress?: () => void;
  variant?: "primary" | "glass" | "outline" | "fleet" | "taxi" | "dark";
  style?: ViewStyle;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
};

const PALETTE = {
  primary: { bg: colors.blue, fg: "#FFFFFF", border: colors.blue },
  taxi: { bg: colors.taxi, fg: colors.ink, border: colors.taxi },
  dark: { bg: colors.ink, fg: "#FFFFFF", border: colors.ink },
  glass: { bg: "#EAEFF8", fg: colors.heading, border: "#EAEFF8" },
  outline: { bg: "#FFFFFF", fg: colors.blue, border: "#B9CFFB" },
  fleet: { bg: "#EAF1FF", fg: colors.blue, border: "#C7DAFF" },
} as const;

/** 54px high so it is easy to tap. `taxi` is the one main action per screen. */
export function Button({ label, onPress, variant = "primary", style, disabled, icon }: Props) {
  const p = PALETTE[variant];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: p.bg, borderColor: p.border, opacity: disabled ? 0.5 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
        style,
      ]}
    >
      <View style={styles.inner}>
        {icon ? <Ionicons name={icon} size={18} color={p.fg} /> : null}
        <Text style={[styles.text, { color: p.fg }]} numberOfLines={1}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { minHeight: 54, borderRadius: radius.pill, borderWidth: 1.5, alignItems: "center", justifyContent: "center", paddingHorizontal: 22 },
  inner: { flexDirection: "row", alignItems: "center", gap: 8 },
  text: { fontFamily: fonts.bold, fontSize: 15 },
});
