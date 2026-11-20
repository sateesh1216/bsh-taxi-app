import { useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image, Platform, Pressable, StyleSheet, Text, TextInput, View, type KeyboardTypeOptions } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { colors } from "../theme/colors";
import { fonts } from "../theme/fonts";

export function Label({ children }: { children: string }) {
  if (!children) return null;
  return <Text style={s.label}>{children}</Text>;
}

type FieldProps = { label: string; value: string; onChangeText: (t: string) => void; placeholder?: string; keyboardType?: KeyboardTypeOptions; autoCapitalize?: "none" | "words" | "sentences"; secure?: boolean };

export function Field({ label, value, onChangeText, placeholder, keyboardType, autoCapitalize = "words", secure }: FieldProps) {
  const [hidden, setHidden] = useState(true);
  const [focus, setFocus] = useState(false);
  return (
    <View style={{ gap: 6 }}>
      <Label>{label}</Label>
      <View style={[s.box, focus && s.boxFocus, { flexDirection: "row", alignItems: "center" }]}>
        <TextInput
          accessibilityLabel={label}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          placeholder={placeholder}
          placeholderTextColor={colors.faint}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          secureTextEntry={secure && hidden}
          autoCorrect={!secure}
          style={[s.input, { flex: 1 }]}
        />
        {secure ? (
          <Pressable accessibilityRole="button" accessibilityLabel={hidden ? "Show password" : "Hide password"} onPress={() => setHidden((h) => !h)} hitSlop={8} style={{ paddingHorizontal: 14 }}>
            <Ionicons name={hidden ? "eye-outline" : "eye-off-outline"} size={20} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

type SegProps<T extends string> = { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void };

/** Pill track with a white thumb on the selected option. */
export function Segmented<T extends string>({ options, value, onChange }: SegProps<T>) {
  return (
    <View style={s.track}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable key={o.value} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => onChange(o.value)} style={[s.seg, on && s.segOn]}>
            <Text style={[s.segText, on && { color: colors.ink, fontFamily: fonts.bold }]} numberOfLines={1}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

type DTProps = { label: string; mode: "date" | "time"; value: Date; onChange: (d: Date) => void; minimumDate?: Date };

export function DateTimeField({ label, mode, value, onChange, minimumDate }: DTProps) {
  const [show, setShow] = useState(false);
  const text = mode === "date"
    ? value.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : value.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  return (
    <View style={{ gap: 6, flex: 1 }}>
      <Label>{label}</Label>
      {Platform.OS === "ios" ? (
        <View style={[s.box, { minHeight: 54, justifyContent: "center", alignItems: "flex-start", paddingHorizontal: 8 }]}>
          <DateTimePicker value={value} mode={mode} display="compact" themeVariant="light" minimumDate={minimumDate} onChange={(_, d) => d && onChange(d)} />
        </View>
      ) : (
        <>
          <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={() => setShow(true)} style={[s.box, { flexDirection: "row", alignItems: "center", paddingLeft: 14 }]}>
            <Ionicons name={mode === "date" ? "calendar-outline" : "time-outline"} size={18} color={colors.blue} />
            <Text style={[s.input, { flex: 1 }]}>{text}</Text>
          </Pressable>
          {show && <DateTimePicker value={value} mode={mode} minimumDate={minimumDate} onChange={(e, d) => { setShow(false); if (e.type === "set" && d) onChange(d); }} />}
        </>
      )}
    </View>
  );
}

type CarProps = { name: string; subtitle: string; seats: number; image: number; fare: string; selected: boolean; onPress: () => void };

/** Ride option row: photo, name + seats, fare on the right. */
export function CarCard({ name, subtitle, seats, image, fare, selected, onPress }: CarProps) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected }} accessibilityLabel={`${name}, ${seats} seats, ${fare}`} onPress={onPress} style={({ pressed }) => [s.car, selected && s.carOn, { transform: [{ scale: pressed ? 0.99 : 1 }] }]}>
      <Image source={image} style={s.carImg} resizeMode="contain" />
      <View style={{ flex: 1, gap: 3 }}>
        <Text style={s.carName} numberOfLines={2}>{name}</Text>
        <Text style={s.carSub} numberOfLines={1}>{subtitle}</Text>
        <View style={s.seatRow}><Ionicons name="people-outline" size={13} color={colors.textMuted} /><Text style={s.seatText}>{seats} seats</Text></View>
      </View>
      <View style={{ alignItems: "flex-end", gap: 6 }}>
        <Text style={[s.carFare, fare.toLowerCase().includes("call") && { fontSize: 12, color: colors.textMuted, fontFamily: fonts.semibold }]}>{fare}</Text>
        <View style={[s.radio, selected && s.radioOn]}>{selected ? <Ionicons name="checkmark" size={14} color="#FFFFFF" /> : null}</View>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  label: { fontFamily: fonts.semibold, fontSize: 13, color: colors.body },
  box: { backgroundColor: colors.card, borderRadius: 16, borderWidth: 1.5, borderColor: colors.line, overflow: "hidden" },
  boxFocus: { borderColor: colors.blue },
  input: { minHeight: 52, paddingHorizontal: 14, fontFamily: fonts.body, fontSize: 15, color: colors.heading, textAlignVertical: "center", paddingVertical: 14 },
  track: { flexDirection: "row", padding: 4, borderRadius: 18, backgroundColor: "#E7ECF6", gap: 2 },
  seg: { flex: 1, minHeight: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", paddingHorizontal: 4 },
  segOn: { backgroundColor: "#FFFFFF", shadowColor: colors.ink, shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 2 },
  segText: { fontFamily: fonts.semibold, fontSize: 13, color: colors.body },
  car: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 20, backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.line },
  carOn: { borderColor: colors.blue, backgroundColor: "#F3F7FF" },
  carImg: { width: 88, height: 60 },
  carName: { fontFamily: fonts.heading, fontSize: 16, lineHeight: 20, color: colors.heading },
  carSub: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted },
  seatRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  seatText: { fontFamily: fonts.semibold, fontSize: 12, color: colors.textMuted },
  carFare: { fontFamily: fonts.heading, fontSize: 18, color: colors.heading, maxWidth: 84, textAlign: "right" },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: "#C5CEDF", alignItems: "center", justifyContent: "center" },
  radioOn: { backgroundColor: colors.blue, borderColor: colors.blue },
});
