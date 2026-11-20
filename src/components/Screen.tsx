import { useEffect, useRef, type ComponentRef, type ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, space } from "../theme/colors";

type Props = {
  children: ReactNode;
  scroll?: boolean;
  bottomPad?: number;
  style?: ViewStyle;
  scrollKey?: number;
  /** false: no automatic padding, the screen lays out its own full-width header (e.g. Home, Book). */
  padded?: boolean;
};

/** Cool paper background; cards sit on it as white surfaces. */
export function Screen({ children, scroll = true, bottomPad = 124, style, scrollKey, padded = true }: Props) {
  const insets = useSafeAreaInsets();
  const ref = useRef<ComponentRef<typeof ScrollView>>(null);
  useEffect(() => { ref.current?.scrollTo({ y: 0, animated: false }); }, [scrollKey]);
  const pad: ViewStyle = padded
    ? { paddingTop: insets.top + space.md, paddingBottom: bottomPad, paddingHorizontal: space.xl }
    : { paddingBottom: bottomPad };
  return (
    <View style={styles.root}>
      {scroll ? (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView ref={ref} contentContainerStyle={[pad, style]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>{children}</ScrollView>
        </KeyboardAvoidingView>
      ) : (
        <View style={[{ flex: 1 }, pad, style]}>{children}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: colors.paper } });
