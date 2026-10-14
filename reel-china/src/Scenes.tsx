import React from "react";
import {
  AbsoluteFill, Easing, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig,
} from "remotion";
import { C, fontFamily } from "./brand";
import { LETTERS, LINES, PLANE, TRAVEL } from "./logoData";
import { Pill, Small } from "./Text";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Clip de fondo: acercamiento lento + corrección de color pareja para todos los clips
export const Clip: React.FC<{ src: string; trim?: number; rate?: number; zoom?: number }> = ({
  src, trim = 0, rate = 1, zoom = 0.1,
}) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const s = 1.02 + zoom * (f / durationInFrames);
  return (
    <AbsoluteFill style={{ backgroundColor: C.marino, overflow: "hidden" }}>
      <OffthreadVideo src={staticFile(`clips/${src}.mp4`)} trimBefore={trim} playbackRate={rate} muted
        style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${s})`,
          filter: "contrast(1.07) saturate(1.12) brightness(1.02)" }} />
    </AbsoluteFill>
  );
};

// Intro: el video se ve solo a través de las letras de CHINA y la cámara "atraviesa" la I
export const IntroMask: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const appear = spring({ frame: f, fps, config: { damping: 16, stiffness: 120 } });
  const zoom = interpolate(f, [16, 40], [0, 1], { ...clamp, easing: Easing.in(Easing.exp) });
  const scale = interpolate(appear, [0, 1], [0.85, 1]) * (1 + zoom * 60);
  const size = 262;
  const baseline = 1060;
  const cy = baseline - size * 0.36;
  if (f > 42) return null;
  return (
    <AbsoluteFill>
      <svg width="1080" height="1920" viewBox="0 0 1080 1920">
        <defs>
          <radialGradient id="introBg" cx="50%" cy="45%" r="75%">
            <stop offset="0%" stopColor={C.acero} />
            <stop offset="55%" stopColor="#3f6187" />
            <stop offset="100%" stopColor={C.marino} />
          </radialGradient>
          <mask id="introMask">
            <rect width="1080" height="1920" fill="white" />
            <g transform={`translate(540 ${cy}) scale(${scale}) translate(-540 ${-cy})`}>
              <text x="540" y={baseline} textAnchor="middle" fontFamily={fontFamily} fontWeight={900}
                fontSize={size} letterSpacing={-4} fill="black">CHINA</text>
            </g>
          </mask>
        </defs>
        <rect width="1080" height="1920" fill="url(#introBg)" mask="url(#introMask)" opacity={1 - interpolate(f, [36, 42], [0, 1], clamp)} />
      </svg>
      <div style={{ position: "absolute", top: 1120, left: 0, right: 0, textAlign: "center", fontFamily, fontWeight: 800,
        fontSize: 46, letterSpacing: 14, color: C.blanco, opacity: appear * Math.max(0, 1 - zoom * 12) }}>
        MILENARIA Y FUTURISTA
      </div>
    </AbsoluteFill>
  );
};

export const IntroAfter: React.FC = () => (
  <AbsoluteFill>
    <Pill text="SALIDA GRUPAL ACOMPAÑADA" top={760} delay={40} />
    <Small text="14 NOCHES · DESDE BUENOS AIRES" top={870} delay={46} size={40} />
  </AbsoluteFill>
);

// Precio: oscurece el fondo y apila los datos con ritmo
export const Price: React.FC = () => {
  const f = useCurrentFrame();
  const { fps, durationInFrames: d } = useVideoConfig();
  const dark = interpolate(f, [0, 10], [0, 1], clamp);
  const amount = interpolate(f, [10, 34], [0, 4935], { ...clamp, easing: Easing.out(Easing.cubic) });
  const big = spring({ frame: f - 8, fps, config: { damping: 12, stiffness: 150 } });
  const exit = interpolate(f, [d - 6, d], [1, 0], clamp);
  const pulse = f > 60 ? 1 + 0.03 * Math.sin((f - 60) / 3) : 1;
  return (
    <AbsoluteFill style={{ opacity: exit }}>
      <AbsoluteFill style={{ opacity: dark,
        background: "linear-gradient(to bottom, rgba(1,60,90,.15) 0%, rgba(1,60,90,.72) 30%, rgba(1,50,80,.78) 70%, rgba(1,40,70,.3) 100%)" }} />
      <Pill text="SALIDA 25 DE MARZO" top={500} delay={2} size={40} />
      <Small text="DESDE BUENOS AIRES · 14 NOCHES" top={610} delay={6} size={38} />
      <div style={{ position: "absolute", top: 690, left: 0, right: 0, textAlign: "center", fontFamily, color: C.blanco,
        transform: `scale(${interpolate(big, [0, 1], [0.6, 1])})`, opacity: Math.min(1, big * 2),
        textShadow: "0 10px 40px rgba(0,20,40,.5)" }}>
        <span style={{ fontWeight: 800, fontSize: 80, verticalAlign: "top", marginRight: 12, position: "relative", top: 30 }}>USD</span>
        <span style={{ fontWeight: 900, fontSize: 230, letterSpacing: -8 }}>{Math.round(amount).toLocaleString("es-AR")}</span>
      </div>
      <Small text="Base doble + imp. USD 1.275 · por persona" top={950} delay={24} size={36} />
      <div style={{ transform: `scale(${pulse})`, transformOrigin: "50% 1100px", position: "absolute", inset: 0 }}>
        <Pill text="RESERVÁ HOY Y ABONÁ EN CUOTAS" top={1060} delay={34} bg={C.blanco} color={C.azul} size={42} />
      </div>
      <Small text="1ª cuota USD 1.088 + 3 cuotas de USD 1.707" top={1185} delay={42} size={40} color={C.dorado} />
    </AbsoluteFill>
  );
};

// Cierre: avión aparece, sale disparado dejando la línea de TRAVEL y caen las letras de GEMINI
export const Outro: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logoW = 620;
  const k = logoW / 2834.67; // escala del isologo
  const left = (1080 - logoW) / 2, top = 800;
  const lineY = top + 955 * k;
  const pop = spring({ frame: f - 2, fps, config: { damping: 11, stiffness: 160 } });
  const fly = interpolate(f, [14, 28], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const planeEndX = left + 2680 * k;
  const planeX = interpolate(fly, [0, 1], [540, planeEndX]);
  const planeScale = pop * interpolate(fly, [0, 1], [1, (310 * k) / 300]);
  const planeOn = f < 29;
  const lines = interpolate(f, [26, 36], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const travel = interpolate(f, [28, 36], [0, 1], clamp);
  const cta = spring({ frame: f - 44, fps, config: { damping: 16 } });
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, ${C.acero} 0%, #4c6b8c 45%, ${C.marino} 100%)` }}>
      {f >= 14 && f < 34 && (
        <div style={{ position: "absolute", left, top: lineY - 3, height: 6, borderRadius: 3,
          width: planeX - left, opacity: 1 - interpolate(f, [28, 34], [0, 1], clamp),
          background: "linear-gradient(to right, rgba(255,255,255,0), #fff)" }} />
      )}
      {planeOn && (
        <svg viewBox="2525 795 315 310" width="300" height="300" style={{
          position: "absolute", left: planeX - 150, top: lineY - 150, transform: `scale(${planeScale})`,
          filter: `blur(${Math.sin(fly * Math.PI) * 5}px)` }}>
          <path d={PLANE} fill="#fff" />
        </svg>
      )}
      <svg viewBox="0 0 2834.67 1106.68" width={logoW} style={{ position: "absolute", left, top, overflow: "visible" }}>
        {LETTERS.map((el, i) => {
          const s = spring({ frame: f - 26 - i * 2.5, fps, config: { damping: 12, stiffness: 170 } });
          const props = { fill: "#fff", style: { transform: `translateY(${(1 - s) * -500}px)`, opacity: Math.min(1, s * 3) } };
          if (el.tag === "rect") return <rect key={i} x={el.x} y={el.y} width={el.width} height={el.height} {...props} />;
          if (el.tag === "polygon") return <polygon key={i} points={el.points} {...props} />;
          return <path key={i} d={el.d} {...props} />;
        })}
        <g opacity={travel}>
          {TRAVEL.map((el, i) => el.tag === "polygon"
            ? <polygon key={i} points={el.points} fill="#fff" />
            : <path key={i} d={el.d} fill="#fff" />)}
        </g>
        {LINES.map((d, i) => (
          <path key={i} d={d} fill="#fff" style={{ transformBox: "fill-box", transformOrigin: i === 0 ? "right center" : "left center",
            transform: `scaleX(${lines})` }} />
        ))}
        <path d={PLANE} fill="#fff" opacity={f >= 28 ? 1 : 0} />
      </svg>
      {/* La frase nunca supera el ancho del logo */}
      <div style={{ position: "absolute", top: top + 1106.68 * k + 50, left, width: logoW, textAlign: "center",
        fontFamily, opacity: cta, transform: `translateY(${(1 - cta) * 30}px)`, whiteSpace: "nowrap" }}>
        <div style={{ fontWeight: 800, fontSize: 26, letterSpacing: 1.5, color: C.blanco }}>RESERVÁ HOY Y ASEGURÁ TU LUGAR</div>
        <div style={{ fontWeight: 600, fontSize: 22, letterSpacing: 4, color: C.dorado, marginTop: 14 }}>SALIDA GRUPAL ACOMPAÑADA</div>
      </div>
    </AbsoluteFill>
  );
};
