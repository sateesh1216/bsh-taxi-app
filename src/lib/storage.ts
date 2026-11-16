import AsyncStorage from "@react-native-async-storage/async-storage";

export interface SavedEnquiry {
  number: string;
  title: string;
  rows: { label: string; value: string }[];
  fare: number | null;
  createdAt: string;
  whatsapp: string;
  paid?: boolean;
}

const KEY = "bsh_enquiries_v1";

export async function listEnquiries(): Promise<SavedEnquiry[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SavedEnquiry[]) : [];
  } catch {
    return [];
  }
}

export async function saveEnquiry(e: SavedEnquiry) {
  const all = await listEnquiries();
  await AsyncStorage.setItem(KEY, JSON.stringify([e, ...all.filter((x) => x.number !== e.number)].slice(0, 50)));
}

export async function getEnquiry(number: string) {
  return (await listEnquiries()).find((e) => e.number === number) ?? null;
}
