import type { ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { BlurView } from "expo-blur";
import { colors, radius } from "../theme/colors";

type Props = { children: ReactNode; style?: StyleProp<ViewStyle>; strong?: boolean; r?: number };

/** Frosted glass surface: blur + translucent white + thin light border. */
export function GlassCard({ children, style, strong, r = radius.lg }: Props) {
  return (
    <View style={[styles.wrap, { borderRadius: r }, style]}>
      <BlurView intensity={35} tint="light" style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: strong ? colors.glassStrong : colors.glass }]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: "hidden", borderWidth: 1, borderColor: colors.glassBorder },
});
