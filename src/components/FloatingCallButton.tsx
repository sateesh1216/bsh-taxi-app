import { useRef, useState } from "react";
import { Dimensions, PanResponder, Pressable, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { callSupport } from "../lib/contact";

const BUTTON_W = 82;
const BUTTON_H = 58;
const EDGE = 8;

export function FloatingCallButton() {
  const { width, height } = Dimensions.get("window");
  const [position, setPosition] = useState({ x: width - BUTTON_W - 14, y: height - BUTTON_H - 112 });
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
        y: Math.max(EDGE + 28, Math.min(height - BUTTON_H - EDGE - 76, dragStartRef.current.y + gesture.dy)),
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
          <Ionicons name="call" size={20} color="#FFFFFF" />
          <Text style={styles.label}>Call</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dragWrap: { position: "absolute", width: BUTTON_W, height: BUTTON_H, zIndex: 9999, elevation: 20 },
  button: { width: BUTTON_W, height: BUTTON_H, borderRadius: 30, backgroundColor: "#155EEF", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, shadowColor: "#155EEF", shadowOpacity: 0.28, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 8 },
  pressed: { opacity: 0.84, transform: [{ scale: 0.97 }] },
  label: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
});
