// Tipografía cinética: palabras que golpean, letras que suben y etiquetas doradas.
import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, fontFamily } from "./brand";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const shadow = "0 8px 40px rgba(0,25,45,.55), 0 2px 6px rgba(0,25,45,.35)";

// Salida común: se agranda, se desenfoca y desaparece en los últimos `out` cuadros
const useExit = (out = 6) => {
  const f = useCurrentFrame();
  const { durationInFrames: d } = useVideoConfig();
  const p = interpolate(f, [d - out, d], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  return { opacity: 1 - p, transform: `scale(${1 + p * 0.25})`, filter: `blur(${p * 14}px)` };
};

// Palabra grande que entra de golpe (escala + desenfoque + interletrado que se cierra)
export const Punch: React.FC<{ text: string; size?: number; top?: number; color?: string; sub?: string }> = ({
  text, size = 150, top = 760, color = C.blanco, sub,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f, fps, config: { damping: 14, stiffness: 180 } });
  const exit = useExit();
  const subIn = spring({ frame: f - 6, fps, config: { damping: 18 } });
  return (
    <AbsoluteFill style={exit}>
      <div style={{
        position: "absolute", top, left: 0, right: 0, textAlign: "center", fontFamily, fontWeight: 900,
        fontSize: size, lineHeight: 1, color, textShadow: shadow, whiteSpace: "pre-line",
        letterSpacing: interpolate(s, [0, 1], [40, -2]),
        transform: `scale(${interpolate(s, [0, 1], [1.5, 1])})`,
        filter: `blur(${interpolate(s, [0, 1], [18, 0], clamp)}px)`,
        opacity: interpolate(f, [0, 3], [0, 1], clamp),
      }}>{text}</div>
      {sub && (
        <div style={{
          position: "absolute", top: top + size * 1.08 * (text.split("\n").length) + 10, left: 0, right: 0,
          textAlign: "center", fontFamily, fontWeight: 700, fontSize: 40, letterSpacing: 8, color: C.dorado,
          textShadow: shadow, opacity: subIn, transform: `translateY(${(1 - subIn) * 30}px)`,
        }}>{sub}</div>
      )}
    </AbsoluteFill>
  );
};

// Letras que suben una por una desde una máscara
export const Rise: React.FC<{ text: string; size?: number; top?: number; delay?: number; weight?: number; spacing?: number }> = ({
  text, size = 120, top = 800, delay = 0, weight = 900, spacing = 0,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const exit = useExit();
  return (
    <AbsoluteFill style={exit}>
      <div style={{ position: "absolute", top, left: 0, right: 0, textAlign: "center", overflow: "hidden",
        fontFamily, fontWeight: weight, fontSize: size, lineHeight: 1.15, color: C.blanco, textShadow: shadow,
        letterSpacing: spacing, paddingBottom: 10 }}>
        {[...text].map((ch, i) => {
          const s = spring({ frame: f - delay - i * 1.5, fps, config: { damping: 15, stiffness: 160 } });
          return (
            <span key={i} style={{ display: "inline-block", transform: `translateY(${(1 - s) * 110}%) rotate(${(1 - s) * 8}deg)` }}>
              {ch === " " ? " " : ch}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// Etiqueta dorada tipo pastilla
export const Pill: React.FC<{ text: string; top: number; delay?: number; bg?: string; color?: string; size?: number }> = ({
  text, top, delay = 0, bg = C.dorado, color = C.blanco, size = 38,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - delay, fps, config: { damping: 13, stiffness: 170 } });
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div style={{
        background: bg, color, fontFamily, fontWeight: 800, fontSize: size, letterSpacing: 3,
        padding: `${size * 0.42}px ${size * 0.9}px`, borderRadius: 999, boxShadow: "0 10px 30px rgba(0,0,0,.25)",
        transform: `scale(${s})`, opacity: Math.min(1, s * 2), whiteSpace: "nowrap",
      }}>{text}</div>
    </div>
  );
};

// Lista que se apila en ritmo: cada línea entra deslizándose con desenfoque
export const Stack: React.FC<{ items: string[]; top: number; every: number; size?: number; highlight?: string; title?: string }> = ({
  items, top, every, size = 92, title,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const exit = useExit();
  const t = spring({ frame: f, fps, config: { damping: 16 } });
  return (
    <AbsoluteFill style={exit}>
      {title && (
        <div style={{ position: "absolute", top: top - 110, left: 0, right: 0, textAlign: "center", fontFamily,
          fontWeight: 800, fontSize: 44, letterSpacing: 10, color: C.dorado, textShadow: shadow,
          opacity: t, transform: `translateY(${(1 - t) * -30}px)` }}>{title}</div>
      )}
      {items.map((it, i) => {
        const s = spring({ frame: f - 4 - i * every, fps, config: { damping: 15, stiffness: 190 } });
        const dir = i % 2 === 0 ? -1 : 1;
        return (
          <div key={it} style={{
            position: "absolute", top: top + i * size * 1.12, left: 0, right: 0, textAlign: "center", fontFamily,
            fontWeight: 900, fontSize: size, lineHeight: 1, color: C.blanco, textShadow: shadow,
            transform: `translateX(${(1 - s) * dir * 700}px) skewX(${(1 - s) * dir * -20}deg)`,
            filter: `blur(${Math.abs(1 - s) * 16}px)`, opacity: Math.min(1, s * 3),
          }}>{it}</div>
        );
      })}
    </AbsoluteFill>
  );
};

export const Small: React.FC<{ text: string; top: number; delay?: number; size?: number; color?: string }> = ({
  text, top, delay = 0, size = 34, color = C.blanco,
}) => {
  const f = useCurrentFrame();
  const p = interpolate(f - delay, [0, 10], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  return (
    <div style={{ position: "absolute", top, left: 70, right: 70, textAlign: "center", fontFamily, fontWeight: 600,
      fontSize: size, lineHeight: 1.3, color, textShadow: shadow, opacity: p, transform: `translateY(${(1 - p) * 20}px)` }}>
      {text}
    </div>
  );
};
