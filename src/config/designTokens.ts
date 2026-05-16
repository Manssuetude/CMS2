const colors = {
  primary: "#ff4d12",
  ink: "#0d0d0f",
  inkSoft: "#23252b",
  premiumBlack: "#08090b",
  background: "#fffdfb",
  surface: "#ffffff",
  cream: "#fff4ed",
  creamSoft: "#fffaf7",
  creamTint: "#fff8f3",
  orangeTint: "#fff0e8",
  muted: "#62646d",
  border: "#e9e2dd",
  borderStrong: "#c9c4bf",
  borderDashed: "#d7d0ca",
  warning: "#c86a21",
  focus: "rgba(255, 77, 18, 0.45)",
  overlay: "rgba(8, 8, 10, 0.62)",
  white: "#ffffff",
} as const;

const typography = {
  fontFamily: {
    sans: "Inter, Arial, sans-serif",
  },
  size: {
    h1: "clamp(40px, 5vw, 76px)",
    h2: "clamp(26px, 3vw, 42px)",
    h3: "22px",
    body: "16px",
    bodyLarge: "17px",
    caption: "12px",
    small: "13px",
    quote: "clamp(22px, 2.4vw, 34px)",
  },
  lineHeight: {
    tight: "1",
    heading: "1.25",
    body: "1.65",
    relaxed: "1.75",
  },
  weight: {
    regular: "400",
    strong: "800",
    bold: "850",
    black: "900",
    display: "950",
  },
} as const;

const spacing = {
  xs: "6px",
  sm: "12px",
  md: "18px",
  lg: "24px",
  xl: "40px",
  "2xl": "70px",
} as const;

const radius = {
  sm: "6px",
  md: "8px",
  lg: "14px",
  pill: "999px",
  editorialImage: "0 0 0 56px",
} as const;

const shadows = {
  subtle: "0 12px 30px rgba(24, 20, 18, 0.07)",
  subtleSoft: "0 12px 30px rgba(24, 20, 18, 0.06)",
  elevated: "0 18px 48px rgba(24, 20, 18, 0.1)",
  modal: "0 28px 80px rgba(0, 0, 0, 0.26)",
} as const;

const layout = {
  maxWidth: "1480px",
  pageX: "clamp(18px, 4vw, 58px)",
  headerHeight: "104px",
  heroMinHeight: "520px",
  heroImageMinHeight: "430px",
  adminSidebar: "260px",
  editorSettings: "320px",
} as const;

const breakpoints = {
  tablet: "960px",
  mobile: "680px",
} as const;

const zIndex = {
  header: 20,
  modal: 50,
} as const;

export const designTokens = {
  colors,
  color: colors,
  typography,
  spacing,
  radius,
  shadows,
  shadow: shadows,
  layout,
  breakpoints,
  zIndex,
} as const;

export type DesignTokens = typeof designTokens;
