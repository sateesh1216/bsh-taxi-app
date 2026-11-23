import { useEffect, useRef, type ComponentRef, type ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, space } from "../theme/colors";

type Props = { children: ReactNode; scroll?: boolean; bottomPad?: number; style?: ViewStyle; scrollKey?: number };

/** White page with restrained blue ambient highlights. */
export function Screen({ children, scroll = true, bottomPad = 110, style, scrollKey }: Props) {
  const insets = useSafeAreaInsets();
  const ref = useRef<ComponentRef<typeof ScrollView>>(null);
  useEffect(() => { ref.current?.scrollTo({ y: 0, animated: false }); }, [scrollKey]);
  const pad = { paddingTop: insets.top + space.lg, paddingBottom: bottomPad, paddingHorizontal: space.xl };
  return (
    <View style={styles.root}>
      <View pointerEvents="none" style={styles.glowTop} />
      <View pointerEvents="none" style={styles.glowBottom} />
      {scroll ? (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}><ScrollView ref={ref} contentContainerStyle={[pad, style]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>{children}</ScrollView></KeyboardAvoidingView>
      ) : (
        <View style={[{ flex: 1 }, pad, style]}>{children}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: "#FFFFFF" }, glowTop: { position: "absolute", width: 300, height: 300, borderRadius: 150, backgroundColor: "rgba(21,94,239,0.07)", right: -170, top: -170 }, glowBottom: { position: "absolute", width: 280, height: 280, borderRadius: 140, backgroundColor: "rgba(21,94,239,0.045)", left: -180, top: "48%" } });
