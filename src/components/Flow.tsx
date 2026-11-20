import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, lift } from "../theme/colors";
import { fonts } from "../theme/fonts";

/** Three-step progress: Trip, Car, Confirm. `onDark` is for use on the navy header. */
export function Stepper({ step, labels, onDark }: { step: number; labels: string[]; onDark?: boolean }) {
  return (
    <View style={s.stepper} accessibilityLabel={`Step ${step} of ${labels.length}: ${labels[step - 1]}`}>
      {labels.map((l, i) => {
        const n = i + 1;
        const done = n < step;
        const on = n === step;
        const track = onDark ? "rgba(255,255,255,0.2)" : "#DDE4F1";
        const fill = onDark ? colors.taxi : colors.blue;
        return (
          <View key={l} style={s.stepItem}>
            <View style={[s.bar, { backgroundColor: done || on ? fill : track }]} />
            <Text style={[s.stepLabel, { color: onDark ? colors.onInkMuted : colors.textMuted }, on && { color: onDark ? "#FFFFFF" : colors.heading, fontFamily: fonts.bold }]}>{l}</Text>
          </View>
        );
      })}
    </View>
  );
}

/** Fixed action bar at the bottom of the screen (light glass). */
export function BottomBar({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.bar2, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <BlurView intensity={50} tint="light" style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(255,255,255,0.9)" }]} />
      <View style={s.row}>{children}</View>
    </View>
  );
}

const s = StyleSheet.create({
  stepper: { flexDirection: "row", gap: 8, marginTop: 16 },
  stepItem: { flex: 1, gap: 7 },
  bar: { height: 4, borderRadius: 2 },
  stepLabel: { fontFamily: fonts.semibold, fontSize: 12 },
  bar2: { position: "absolute", left: 0, right: 0, bottom: 0, borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 12, paddingHorizontal: 20, ...lift, shadowOffset: { width: 0, height: -4 } },
  row: { flexDirection: "row", gap: 10, alignItems: "center" },
});
