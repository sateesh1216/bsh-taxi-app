import AsyncStorage from "@react-native-async-storage/async-storage";
import { scopedKey } from "./scope";

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

// Saved places live on this phone, per account.
export async function setSavedPlaces(p: SavedPlaces, _who?: { name: string; email: string }) {
  await AsyncStorage.setItem(scopedKey(BASE), JSON.stringify(p));
}

export async function syncSavedPlaces(): Promise<SavedPlaces> {
  return getSavedPlaces();
}
