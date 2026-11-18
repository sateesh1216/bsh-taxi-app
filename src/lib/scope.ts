/** Which account the local data (bookings, saved places) belongs to. */
let scope = "guest";
export const getScope = () => scope;
export const setScope = (s: string | null) => { scope = s || "guest"; };
export const scopedKey = (base: string) => (scope === "guest" ? base : `${base}:${scope}`);
