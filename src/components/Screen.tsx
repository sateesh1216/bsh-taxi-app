import { useEffect, useRef, type ComponentRef, type ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, space } from "../theme/colors";

type Props = { children: ReactNode; scroll?: boolean; bottomPad?: number; style?: ViewStyle; scrollKey?: number };

/** Dark navy page with blue and amber glows behind the glass cards. */
export function Screen({ children, scroll = true, bottomPad = 110, style, scrollKey }: Props) {
  const insets = useSafeAreaInsets();
  const ref = useRef<ComponentRef<typeof ScrollView>>(null);
  useEffect(() => { ref.current?.scrollTo({ y: 0, animated: false }); }, [scrollKey]);
  const pad = { paddingTop: insets.top + space.lg, paddingBottom: bottomPad, paddingHorizontal: space.xl };
  return (
    <View style={styles.root}>
      <LinearGradient colors={["rgba(21,94,239,0.6)", "rgba(21,94,239,0)"]} start={{ x: 1, y: 0 }} end={{ x: 0.2, y: 0.5 }} style={StyleSheet.absoluteFill} />
      <LinearGradient colors={["rgba(245,162,0,0.28)", "rgba(245,162,0,0)"]} start={{ x: 1, y: 1 }} end={{ x: 0.4, y: 0.55 }} style={StyleSheet.absoluteFill} />
      {scroll ? (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}><ScrollView ref={ref} contentContainerStyle={[pad, style]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>{children}</ScrollView></KeyboardAvoidingView>
      ) : (
        <View style={[{ flex: 1 }, pad, style]}>{children}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: colors.navy } });
