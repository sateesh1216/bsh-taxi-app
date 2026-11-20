export const colors = {
  // ---- Legacy keys: kept so screens that are not redesigned keep working ----
  navy: "#FFFFFF",
  blue: "#155EEF",
  primary: "#155EEF",
  amber: "#155EEF",
  amberLight: "#155EEF",
  white: "#1D2939",
  text: "#1D2939",
  textMuted: "#667085",
  glass: "#FFFFFF",
  glassStrong: "#F4F7FD",
  glassBorder: "#E4E9F2",
  divider: "#EDF0F6",
  danger: "#D92D20",
  page: "#F4F6FB",
  bg: "#F4F6FB",
  surface: "#F8FAFC",
  accentSoft: "#EAF1FF",

  // ---- Design system v2 ----
  ink: "#0A1A3F", // deep brand navy: hero, headers, dark surfaces
  inkSoft: "#12306B", // second stop of the navy gradient
  taxi: "#F5A200", // taxi amber: fares, the main booking action
  taxiSoft: "#FFF4D6",
  taxiDeep: "#7A4D00",
  paper: "#F4F6FB", // app background
  card: "#FFFFFF",
  line: "#E4E9F2",
  heading: "#101828",
  body: "#475467",
  faint: "#98A2B3",
  success: "#067647",
  successSoft: "#ECFDF3",
  dangerSoft: "#FEF3F2",
  onInk: "#FFFFFF",
  onInkMuted: "rgba(255,255,255,0.68)",
  glassOnInk: "rgba(255,255,255,0.10)",
  glassOnInkBorder: "rgba(255,255,255,0.18)",
} as const;

export const radius = { sm: 12, md: 16, lg: 22, xl: 28, pill: 999 } as const;
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28 } as const;

/** Soft lift for floating things only (tab bar, bottom bar, call button). */
export const lift = {
  shadowColor: "#0A1A3F",
  shadowOpacity: 0.12,
  shadowRadius: 18,
  shadowOffset: { width: 0, height: 8 },
  elevation: 10,
} as const;
