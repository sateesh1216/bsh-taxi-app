import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../theme/colors";
import { fonts } from "../theme/fonts";

/** Three-step progress: Trip, Car, Confirm. */
export function Stepper({ step, labels }: { step: number; labels: string[] }) {
  return (
    <View style={s.stepper} accessibilityLabel={`Step ${step} of ${labels.length}: ${labels[step - 1]}`}>
      {labels.map((l, i) => {
        const n = i + 1;
        const done = n < step;
        const on = n === step;
        return (
          <View key={l} style={s.stepItem}>
            <View style={[s.bar, (done || on) && { backgroundColor: colors.amber }]} />
            <Text style={[s.stepLabel, on && { color: colors.white, fontFamily: fonts.bold }]}>{n}. {l}</Text>
          </View>
        );
      })}
    </View>
  );
}

/** Fixed action bar at the bottom of the screen. */
export function BottomBar({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.bar2, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(6,15,36,0.55)" }]} />
      <View style={s.row}>{children}</View>
    </View>
  );
}

const s = StyleSheet.create({
  stepper: { flexDirection: "row", gap: 8, marginTop: 14 },
  stepItem: { flex: 1, gap: 6 },
  bar: { height: 4, borderRadius: 2, backgroundColor: colors.glassStrong },
  stepLabel: { fontFamily: fonts.semibold, fontSize: 12, color: colors.textMuted },
  bar2: { position: "absolute", left: 0, right: 0, bottom: 0, borderTopWidth: 1, borderTopColor: colors.glassBorder, paddingTop: 12, paddingHorizontal: 20 },
  row: { flexDirection: "row", gap: 10, alignItems: "center" },
});
