import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { GlassCard } from "./GlassCard";
import { Label } from "./Form";
import { searchSite } from "../lib/search";
import { useT } from "../lib/i18n";
import type { PlaceSuggestion } from "../data/site";
import { colors } from "../theme/colors";
import { fonts } from "../theme/fonts";

/** Site search. Results open directly below the box. */
export function SearchBox() {
  const { t } = useT();
  const [q, setQ] = useState("");
  const hits = searchSite(q);
  return (
    <View style={{ gap: 8 }}>
      <GlassCard r={16} style={s.inputRow}>
        <Ionicons name="search" size={20} color={colors.textMuted} />
        <TextInput accessibilityLabel="Search places, routes and services" value={q} onChangeText={setQ} placeholder={t("search_ph")} placeholderTextColor="#98A2B3" style={s.input} autoCapitalize="none" returnKeyType="search" />
        {q ? <Pressable accessibilityLabel="Clear search" onPress={() => setQ("")} hitSlop={10}><Ionicons name="close-circle" size={20} color={colors.textMuted} /></Pressable> : null}
      </GlassCard>
      {q.trim() ? (
        <GlassCard r={16}>
          {hits.length === 0 ? <Text style={s.empty}>No match. Try another name, or call us.</Text> : hits.map((h, i) => (
            <Pressable key={h.key} accessibilityRole="button" onPress={() => { setQ(""); router.push(h.href as never); }} style={[s.row, i > 0 && s.rowLine]}>
              <View style={{ flex: 1 }}>
                <Text style={s.title}>{h.title}</Text>
                <Text style={s.sub}>{h.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.amber} />
            </Pressable>
          ))}
        </GlassCard>
      ) : null}
    </View>
  );
}

type PhotonFeature = { properties: { name?: string; street?: string; housenumber?: string; district?: string; city?: string; state?: string; country?: string }; geometry: { coordinates: [number, number] } };
const VIZAG = { lat: 17.6868, lon: 83.2185 };
const BBOX = [VIZAG.lon - 65 / 106, VIZAG.lat - 65 / 111, VIZAG.lon + 65 / 106, VIZAG.lat + 65 / 111].join(",");

function toSuggestion(f: PhotonFeature): PlaceSuggestion {
  const p = f.properties;
  const primary = p.name || [p.housenumber, p.street].filter(Boolean).join(" ") || p.street || p.city || "Unnamed location";
  const secondary = Array.from(new Set([p.street && p.name && p.street !== primary ? p.street : null, p.district, p.city, p.state, p.country].filter(Boolean) as string[])).join(", ");
  return { primary, secondary, fullLabel: [primary, secondary].filter(Boolean).join(", "), lat: String(f.geometry.coordinates[1]), lon: String(f.geometry.coordinates[0]) };
}

type LocProps = { label: string; value: string; onChangeText: (t: string) => void; placeholder?: string; popular: PlaceSuggestion[]; limitToVizag?: boolean };

/** Address box: suggestions (live search + popular places) open directly below it. */
export function LocationField({ label, value, onChangeText, placeholder, popular, limitToVizag }: LocProps) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<PlaceSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const skip = useRef(false);
  const reqId = useRef(0);

  useEffect(() => {
    if (skip.current) { skip.current = false; return; }
    const q = value.trim();
    if (!q) { setItems([]); setFailed(false); return; }
    const id = ++reqId.current;
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setLoading(true); setFailed(false);
      try {
        const params = new URLSearchParams({ q, lang: "en", limit: "8", lat: String(VIZAG.lat), lon: String(VIZAG.lon) });
        if (limitToVizag) params.set("bbox", BBOX);
        const res = await fetch(`https://photon.komoot.io/api/?${params}`, { signal: ctrl.signal });
        if (!res.ok) throw new Error("search failed");
        const data = (await res.json()) as { features: PhotonFeature[] };
        if (id === reqId.current) setItems(data.features.map(toSuggestion));
      } catch (e) {
        if (id === reqId.current && !(e instanceof Error && e.name === "AbortError")) { setItems([]); setFailed(true); }
      } finally {
        if (id === reqId.current) setLoading(false);
      }
    }, 350);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [value, limitToVizag]);

  const q = value.trim().toLowerCase();
  const local = popular.filter((p) => !q || `${p.primary} ${p.secondary}`.toLowerCase().split(/[\s,]+/).some((w) => w.startsWith(q))).slice(0, 5);
  const list = q ? (items.length ? items : local) : popular.slice(0, 6);
  const pick = (p: PlaceSuggestion) => { skip.current = true; onChangeText(p.fullLabel); setOpen(false); };

  return (
    <View style={{ gap: 6 }}>
      <Label>{label}</Label>
      <GlassCard r={14}>
        <TextInput accessibilityLabel={label} value={value} onChangeText={(t) => { onChangeText(t); setOpen(true); }} onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 200)} placeholder={placeholder} placeholderTextColor="#98A2B3" style={s.field} autoCapitalize="words" />
      </GlassCard>
      {open && (
        <GlassCard r={14} strong>
          {loading && <ActivityIndicator color={colors.amber} style={{ padding: 12 }} />}
          {!loading && list.length === 0 && <Text style={s.empty}>{failed ? "Search is unavailable. You can type the address." : "No places found. You can type the full address."}</Text>}
          {list.map((p, i) => (
            <Pressable key={`${p.fullLabel}-${i}`} accessibilityRole="button" onPress={() => pick(p)} style={[s.row, i > 0 && s.rowLine]}>
              <Ionicons name="location" size={18} color={colors.amber} />
              <View style={{ flex: 1 }}>
                <Text style={s.title}>{p.primary}</Text>
                {p.secondary ? <Text style={s.sub} numberOfLines={1}>{p.secondary}</Text> : null}
              </View>
            </Pressable>
          ))}
        </GlassCard>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  inputRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, minHeight: 52 },
  input: { flex: 1, minHeight: 48, fontFamily: fonts.body, fontSize: 15, color: colors.white },
  field: { minHeight: 52, paddingHorizontal: 14, fontFamily: fonts.body, fontSize: 15, color: colors.white },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 12, minHeight: 56 },
  rowLine: { borderTopWidth: 1, borderTopColor: colors.divider },
  title: { fontFamily: fonts.semibold, fontSize: 15, color: colors.white },
  sub: { marginTop: 2, fontFamily: fonts.body, fontSize: 12, color: colors.textMuted },
  empty: { padding: 14, fontFamily: fonts.body, fontSize: 13, color: colors.textMuted },
});
