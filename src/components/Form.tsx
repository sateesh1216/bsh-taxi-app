import { useState } from "react";
import { Image, Platform, Pressable, StyleSheet, Text, TextInput, View, type KeyboardTypeOptions } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { GlassCard } from "./GlassCard";
import { colors } from "../theme/colors";
import { fonts } from "../theme/fonts";

export function Label({ children }: { children: string }) {
  return <Text style={s.label}>{children}</Text>;
}

type FieldProps = { label: string; value: string; onChangeText: (t: string) => void; placeholder?: string; keyboardType?: KeyboardTypeOptions; autoCapitalize?: "none" | "words" | "sentences"; secure?: boolean };

export function Field({ label, value, onChangeText, placeholder, keyboardType, autoCapitalize = "words", secure }: FieldProps) {
  return (
    <View style={{ gap: 6 }}>
      <Label>{label}</Label>
      <GlassCard r={14}>
        <TextInput
          accessibilityLabel={label}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#98A2B3"
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          secureTextEntry={secure}
          autoCorrect={!secure}
          style={s.input}
        />
      </GlassCard>
    </View>
  );
}

type SegProps<T extends string> = { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void };

export function Segmented<T extends string>({ options, value, onChange }: SegProps<T>) {
  return (
    <GlassCard r={16} style={{ flexDirection: "row", padding: 3 }}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable key={o.value} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => onChange(o.value)} style={[s.seg, on && { backgroundColor: colors.amber }]}>
            <Text style={[s.segText, on && { color: colors.navy, fontFamily: fonts.bold }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </GlassCard>
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
        <GlassCard r={14} style={{ minHeight: 52, justifyContent: "center", alignItems: "flex-start", paddingHorizontal: 8 }}>
          <DateTimePicker value={value} mode={mode} display="compact" themeVariant="light" minimumDate={minimumDate} onChange={(_, d) => d && onChange(d)} />
        </GlassCard>
      ) : (
        <>
          <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={() => setShow(true)}>
            <GlassCard r={14}><Text style={s.input}>{text}</Text></GlassCard>
          </Pressable>
          {show && <DateTimePicker value={value} mode={mode} minimumDate={minimumDate} onChange={(e, d) => { setShow(false); if (e.type === "set" && d) onChange(d); }} />}
        </>
      )}
    </View>
  );
}

type CarProps = { name: string; subtitle: string; seats: number; image: number; fare: string; selected: boolean; onPress: () => void };

export function CarCard({ name, subtitle, seats, image, fare, selected, onPress }: CarProps) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected }} accessibilityLabel={`${name}, ${seats} seats, ${fare}`} onPress={onPress}>
      <GlassCard r={18} strong={selected} style={selected ? { borderColor: colors.amber, borderWidth: 1.5 } : undefined}>
        <View style={s.car}>
          <Image source={image} style={s.carImg} resizeMode="contain" />
          <View style={{ flex: 1 }}>
            <Text style={s.carName}>{name}</Text>
            <Text style={s.carSub}>{subtitle} · {seats} seats</Text>
          </View>
          <Text style={s.carFare}>{fare}</Text>
        </View>
      </GlassCard>
    </Pressable>
  );
}

const s = StyleSheet.create({
  label: { fontFamily: fonts.semibold, fontSize: 12, color: colors.textMuted },
  input: { minHeight: 52, paddingHorizontal: 14, fontFamily: fonts.body, fontSize: 15, color: colors.white, textAlignVertical: "center", paddingVertical: 14 },
  seg: { flex: 1, minHeight: 44, borderRadius: 13, alignItems: "center", justifyContent: "center", paddingHorizontal: 4 },
  segText: { fontFamily: fonts.semibold, fontSize: 13, color: colors.white },
  car: { flexDirection: "row", alignItems: "center", gap: 10, padding: 10 },
  carImg: { width: 84, height: 58 },
  carName: { fontFamily: fonts.heading, fontSize: 15, color: colors.white },
  carSub: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  carFare: { fontFamily: fonts.bold, fontSize: 14, color: colors.amber, maxWidth: 74, textAlign: "right" },
});
