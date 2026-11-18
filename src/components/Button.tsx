import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, radius } from "../theme/colors";
import { fonts } from "../theme/fonts";

type Props = {
  label: string;
  onPress?: () => void;
  variant?: "primary" | "glass" | "outline" | "fleet";
  style?: ViewStyle;
  disabled?: boolean;
};

/** 52px high so it is easy to tap. */
export function Button({ label, onPress, variant = "primary", style, disabled }: Props) {
  const primary = variant === "primary";
  const fleet = variant === "fleet";
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variant === "glass" && styles.glass,
        variant === "outline" && styles.outline,
        fleet && styles.fleet,
        { opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
        style,
      ]}
    >
      {primary && <View style={[StyleSheet.absoluteFill, { backgroundColor: "#155EEF" }]} />}
      {fleet && <LinearGradient colors={["#EFF5FF", "#DCEAFF"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />}
      <Text style={[styles.text, { color: primary ? "#FFFFFF" : fleet ? "#155EEF" : variant === "outline" ? colors.amber : colors.white }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { minHeight: 52, borderRadius: radius.pill, alignItems: "center", justifyContent: "center", paddingHorizontal: 22, overflow: "hidden" },
  glass: { backgroundColor: colors.glassStrong, borderWidth: 1, borderColor: colors.glassBorder },
  outline: { borderWidth: 1.5, borderColor: colors.amber },
  fleet: { borderWidth: 1, borderColor: "#C7DAFF" },
  text: { fontFamily: fonts.bold, fontSize: 15 },
});
