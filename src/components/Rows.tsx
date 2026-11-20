import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";
import { fonts } from "../theme/fonts";

export function Rows({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <View>
      {rows.map((r, i) => (
        <View key={`${r.label}-${i}`} style={[s.row, i === rows.length - 1 && { borderBottomWidth: 0 }]}>
          <Text style={s.label}>{r.label}</Text>
          <Text style={s.value}>{r.value}</Text>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", gap: 16, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: colors.divider },
  label: { fontFamily: fonts.body, fontSize: 14, color: colors.textMuted },
  value: { flex: 1, textAlign: "right", fontFamily: fonts.semibold, fontSize: 14, color: colors.heading },
});
