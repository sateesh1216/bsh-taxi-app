import { Pressable, StyleSheet, Text, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, radius } from "../theme/colors";
import { fonts } from "../theme/fonts";

type Props = {
  label: string;
  onPress?: () => void;
  variant?: "primary" | "glass" | "outline";
  style?: ViewStyle;
  disabled?: boolean;
};

/** 52px high so it is easy to tap. */
export function Button({ label, onPress, variant = "primary", style, disabled }: Props) {
  const primary = variant === "primary";
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
        { opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
        style,
      ]}
    >
      {primary && <LinearGradient colors={[colors.amberLight, colors.amber]} style={StyleSheet.absoluteFill} />}
      <Text style={[styles.text, { color: primary ? colors.navy : variant === "outline" ? colors.amber : colors.white }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { minHeight: 52, borderRadius: radius.pill, alignItems: "center", justifyContent: "center", paddingHorizontal: 22, overflow: "hidden" },
  glass: { backgroundColor: colors.glassStrong, borderWidth: 1, borderColor: colors.glassBorder },
  outline: { borderWidth: 1.5, borderColor: colors.amber },
  text: { fontFamily: fonts.bold, fontSize: 15 },
});
