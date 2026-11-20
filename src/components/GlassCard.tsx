import type { ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { BlurView } from "expo-blur";
import { colors, radius } from "../theme/colors";

type Props = { children: ReactNode; style?: StyleProp<ViewStyle>; strong?: boolean; r?: number; tone?: "light" | "dark" };

/**
 * light: a clean white surface with a hairline border (strong = soft blue tint).
 * dark: real frosted glass, meant to sit on the navy hero or on photos.
 */
export function GlassCard({ children, style, strong, r = radius.lg, tone = "light" }: Props) {
  if (tone === "dark") {
    return (
      <View style={[styles.wrap, { borderRadius: r, borderColor: colors.glassOnInkBorder }, style]}>
        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.glassOnInk }]} />
        {children}
      </View>
    );
  }
  return (
    <View style={[styles.wrap, { borderRadius: r, backgroundColor: strong ? "#F3F7FF" : colors.card, borderColor: strong ? "#D9E5FF" : colors.line }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: "hidden", borderWidth: 1 },
});
