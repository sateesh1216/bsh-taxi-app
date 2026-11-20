import { useRef, useState } from "react";
import { Dimensions, PanResponder, Pressable, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { callSupport } from "../lib/contact";
import { colors, lift } from "../theme/colors";
import { fonts } from "../theme/fonts";

const BUTTON_W = 84;
const BUTTON_H = 52;
const EDGE = 8;

/** Draggable support button. Taxi amber so it reads as "call the cab office". */
export function FloatingCallButton() {
  const { width, height } = Dimensions.get("window");
  const [position, setPosition] = useState({ x: width - BUTTON_W - 14, y: height - BUTTON_H - 160 });
  const posRef = useRef(position);
  const movedRef = useRef(false);
  const dragStartRef = useRef(position);
  const pan = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_evt, gesture) => Math.abs(gesture.dx) > 5 || Math.abs(gesture.dy) > 5,
    onPanResponderGrant: () => { dragStartRef.current = posRef.current; movedRef.current = false; },
    onPanResponderMove: (_evt, gesture) => {
      movedRef.current = true;
      const next = {
        x: Math.max(EDGE, Math.min(width - BUTTON_W - EDGE, dragStartRef.current.x + gesture.dx)),
        y: Math.max(EDGE + 28, Math.min(height - BUTTON_H - EDGE - 90, dragStartRef.current.y + gesture.dy)),
      };
      posRef.current = next;
      setPosition(next);
    },
    onPanResponderRelease: () => { },
    onPanResponderTerminate: () => { },
  })).current;

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <View {...pan.panHandlers} style={[styles.dragWrap, { left: position.x, top: position.y }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Call BSH Taxi support"
          onPressIn={() => { movedRef.current = false; }}
          onPress={() => { if (!movedRef.current) callSupport(); }}
          style={({ pressed }) => [styles.button, pressed && !movedRef.current ? styles.pressed : null]}
        >
          <Ionicons name="call" size={18} color={colors.ink} />
          <Text style={styles.label}>Call</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dragWrap: { position: "absolute", width: BUTTON_W, height: BUTTON_H, zIndex: 9999, elevation: 20 },
  button: { width: BUTTON_W, height: BUTTON_H, borderRadius: 26, backgroundColor: colors.taxi, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, ...lift, shadowColor: colors.taxi, shadowOpacity: 0.35 },
  pressed: { opacity: 0.88, transform: [{ scale: 0.97 }] },
  label: { color: colors.ink, fontSize: 15, fontFamily: fonts.bold },
});
