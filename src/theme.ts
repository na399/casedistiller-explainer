// Plain Figure tokens, UNC theme (tokens.json, theme id "unc").
// Scenes are laid out on the 1280 × 720 slide grid and scaled to 1920 × 1080.
import { loadFont as loadSans } from "@remotion/google-fonts/SchibstedGrotesk";
import { loadFont as loadMono } from "@remotion/google-fonts/IBMPlexMono";

const sans = loadSans("normal", { weights: ["400", "500", "700", "800"], subsets: ["latin"] });
const mono = loadMono("normal", { weights: ["400", "500"], subsets: ["latin"] });

export const C = {
  paper: "#ffffff",
  paperSunk: "#eceded",
  ink: "#13294b",
  inkMuted: "#5b6670",
  rule: "#cfd3d5",
  dot: "#a2aaad",
  teal: "#4b9cd3", // Carolina Blue: big fills; as text only at 24px+
  blue: "#2c5080", // Bolin Creek: linework
  yellow: "#ffd340",
  coral: "#e95550",
  tealDeep: "#2c5080",
  tealSoft: "#b7d7ed",
  blueSoft: "#edf5fb",
  yellowSoft: "#ffeec2",
  coralSoft: "#fbc8b6",
  oak: "#fecf86",
  onCool: "#ffffff",
  onWarm: "#13294b",
};

export const F = {
  sans: `${sans.fontFamily}, "Helvetica Neue", Helvetica, Arial, sans-serif`,
  mono: `${mono.fontFamily}, ui-monospace, Menlo, monospace`,
};

export const T = {
  numeralXl: { fontFamily: F.sans, fontSize: 160, lineHeight: 0.85, fontWeight: 800, letterSpacing: "-0.045em" },
  numeralL: { fontFamily: F.sans, fontSize: 96, lineHeight: 0.9, fontWeight: 800, letterSpacing: "-0.04em" },
  numeralM: { fontFamily: F.sans, fontSize: 48, lineHeight: 1, fontWeight: 700, letterSpacing: "-0.03em" },
  headline: { fontFamily: F.sans, fontSize: 52, lineHeight: 1.04, fontWeight: 700, letterSpacing: "-0.025em" },
  title: { fontFamily: F.sans, fontSize: 32, lineHeight: 1.12, fontWeight: 700, letterSpacing: "-0.015em" },
  lede: { fontFamily: F.sans, fontSize: 22, lineHeight: "30px", fontWeight: 400 },
  body: { fontFamily: F.sans, fontSize: 16, lineHeight: "24px", fontWeight: 400 },
  caption: { fontFamily: F.sans, fontSize: 14, lineHeight: "19px", fontWeight: 500 },
  kicker: { fontFamily: F.mono, fontSize: 13, lineHeight: "16px", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase" as const },
  data: { fontFamily: F.mono, fontSize: 14, lineHeight: "19px", fontWeight: 400 },
  code: { fontFamily: F.mono, fontSize: 16, lineHeight: "24px", fontWeight: 400 },
};

export const S = { s1: 4, s2: 8, s3: 16, s4: 24, s5: 40, s6: 64, s7: 104 };

export const FPS = 30;
