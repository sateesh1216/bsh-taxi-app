import AsyncStorage from "@react-native-async-storage/async-storage";
import { scopedKey } from "./scope";
import { cloudReady, pullProfile, pushProfile } from "./cloud";

export type SavedPlaces = { home: string; office: string };
const BASE = "bsh_places_v1";

export async function getSavedPlaces(): Promise<SavedPlaces> {
  try {
    const raw = await AsyncStorage.getItem(scopedKey(BASE));
    const v = raw ? (JSON.parse(raw) as Partial<SavedPlaces>) : {};
    return { home: v.home ?? "", office: v.office ?? "" };
  } catch {
    return { home: "", office: "" };
  }
}

export async function setSavedPlaces(p: SavedPlaces, who?: { name: string; email: string }) {
  await AsyncStorage.setItem(scopedKey(BASE), JSON.stringify(p));
  if (cloudReady() && who) void pushProfile({ ...who, ...p });
}

/** Saved places stored in the account win over this phone's copy. */
export async function syncSavedPlaces(): Promise<SavedPlaces> {
  const local = await getSavedPlaces();
  if (!cloudReady()) return local;
  const remote = await pullProfile();
  if (!remote || (!remote.home && !remote.office)) return local;
  const merged = { home: remote.home, office: remote.office };
  await AsyncStorage.setItem(scopedKey(BASE), JSON.stringify(merged));
  return merged;
}
