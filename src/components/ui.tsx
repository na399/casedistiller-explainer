import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { C, S, T } from "../theme";

// Builds only: eased 0→1 progress from `start` over `dur` frames, never overshooting.
export const prog = (frame: number, start: number, dur = 18) =>
  interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

// Pace of every build: 1 = the storyboard's nominal seconds; higher is slower.
export const SLOW = 1.35;
// Storyboard seconds → frames at 30 fps, slowed by SLOW.
export const s = (sec: number) => Math.round(sec * 30 * SLOW);

// A 1280 × 720 slide, scaled to the 1920 × 1080 frame, fading in and out on paper.
export const Slide: React.FC<{ children: React.ReactNode; fadeOut?: boolean }> = ({ children, fadeOut = true }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, width } = useVideoConfig();
  const fade = 12;
  const opacity = Math.min(
    interpolate(frame, [0, fade], [0, 1], { extrapolateRight: "clamp" }),
    fadeOut ? interpolate(frame, [durationInFrames - fade, durationInFrames], [1, 0], { extrapolateLeft: "clamp" }) : 1,
  );
  return (
    <AbsoluteFill style={{ background: C.paper }}>
      <div
        style={{
          width: 1280, height: 720, transform: `scale(${width / 1280})`, transformOrigin: "0 0",
          position: "relative", opacity, color: C.ink,
        }}
      >
        <div style={{ position: "absolute", inset: S.s6 }}>{children}</div>
      </div>
    </AbsoluteFill>
  );
};

// Reveal: fade plus a short clip wipe from the left (a build, not a fly-in).
export const Reveal: React.FC<{ at: number; dur?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({
  at, dur = 18, style, children,
}) => {
  const p = prog(useCurrentFrame(), at, dur);
  return (
    <div style={{ opacity: p, clipPath: `inset(-20% ${(1 - p) * 100}% -20% -2%)`, ...style }}>{children}</div>
  );
};

export const Fade: React.FC<{ at: number; dur?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({
  at, dur = 18, style, children,
}) => <div style={{ opacity: prog(useCurrentFrame(), at, dur), ...style }}>{children}</div>;

// The Tab: three short bars in teal, yellow, coral, before the kicker.
export const Tab: React.FC = () => (
  <div style={{ display: "flex", gap: 3 }}>
    {[C.teal, C.yellow, C.coral].map((c) => (
      <div key={c} style={{ width: 14, height: 4, background: c }} />
    ))}
  </div>
);

export const Kicker: React.FC<{ children: React.ReactNode; tab?: boolean }> = ({ children, tab = true }) => (
  <div style={{ display: "flex", alignItems: "center", gap: S.s2 + 4 }}>
    {tab && <Tab />}
    <span style={{ ...T.kicker, color: C.inkMuted }}>{children}</span>
  </div>
);

// The highlighter: a yellow-soft stroke behind the lower half of the words, drawn in at `at`.
export const Em: React.FC<{ at: number; children: React.ReactNode }> = ({ at, children }) => {
  const p = prog(useCurrentFrame(), at, 20);
  return (
    <span
      style={{
        backgroundImage: `linear-gradient(${C.yellowSoft}, ${C.yellowSoft})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "0 88%",
        backgroundSize: `${p * 100}% 46%`,
        boxDecorationBreak: "clone",
        WebkitBoxDecorationBreak: "clone",
      }}
    >
      {children}
    </span>
  );
};

export const Claim: React.FC<{ children: React.ReactNode; width?: number; size?: number }> = ({ children, width = 900, size }) => (
  <div style={{ ...T.headline, ...(size ? { fontSize: size } : {}), maxWidth: width, textWrap: "balance" } as React.CSSProperties}>
    {children}
  </div>
);

export const Header: React.FC<{ kicker: string; at?: number; width?: number; size?: number; children: React.ReactNode }> = ({
  kicker, at = 0, width, size, children,
}) => (
  <div style={{ display: "grid", gap: S.s3 }}>
    <Fade at={at}><Kicker>{kicker}</Kicker></Fade>
    <Fade at={at + 6}><Claim width={width} size={size}>{children}</Claim></Fade>
  </div>
);

// Counts a number up from 0 as a build.
export const Count: React.FC<{ to: number; at: number; dur?: number; digits?: number; format?: (x: number) => string }> = ({
  to, at, dur = 30, digits = 3, format,
}) => {
  const v = to * prog(useCurrentFrame(), at, dur);
  return <>{format ? format(v) : v.toFixed(digits)}</>;
};

// Piet Hein superellipse path (exponent 2.5) for SVG fields.
export const superellipse = (w: number, h: number, n = 2.5, steps = 96) => {
  const pts: string[] = [];
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const c = Math.cos(t), si = Math.sin(t);
    const x = (w / 2) * Math.sign(c) * Math.pow(Math.abs(c), 2 / n) + w / 2;
    const y = (h / 2) * Math.sign(si) * Math.pow(Math.abs(si), 2 / n) + h / 2;
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return `M${pts.join("L")}Z`;
};

// A superellipse panel: SVG field behind HTML content. No border, no shadow.
export const Panel: React.FC<{ w: number; h: number; fill: string; style?: React.CSSProperties; children?: React.ReactNode; pad?: number }> = ({
  w, h, fill, style, children, pad = S.s4,
}) => (
  <div style={{ position: "relative", width: w, height: h, ...style }}>
    <svg width={w} height={h} style={{ position: "absolute", inset: 0 }}>
      <path d={superellipse(w, h, 5)} fill={fill} />
    </svg>
    <div style={{ position: "absolute", inset: pad }}>{children}</div>
  </div>
);

// Square mass bar that grows from zero.
export const Bar: React.FC<{ value: number; max: number; width: number; height: number; color: string; at: number; dur?: number }> = ({
  value, max, width, height, color, at, dur = 24,
}) => {
  const p = prog(useCurrentFrame(), at, dur);
  return <div style={{ width: (value / max) * width * p, height, background: color }} />;
};

export const Caption: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ ...T.caption, color: C.inkMuted, ...style }}>{children}</div>
);

export const DataLine: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ ...T.data, color: C.inkMuted, ...style }}>{children}</div>
);

export const Code: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ ...T.code, background: C.blueSoft, color: C.ink, borderRadius: 12, padding: "12px 16px", whiteSpace: "pre-wrap", ...style }}>
    {children}
  </div>
);
