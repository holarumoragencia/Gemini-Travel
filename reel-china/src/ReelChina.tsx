import React from "react";
import { AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import type { TransitionPresentation } from "@remotion/transitions";
import { flash, spin, whip, zoomBlur } from "./transitions";
import { Clip, IntroAfter, IntroMask, Outro, Price } from "./Scenes";
import { Punch, Rise, Stack } from "./Text";

type Shot = {
  clip: string | null; // null = cierre con el logo
  dur: number; // cuadros (30 fps)
  trim?: number; // cuadro del clip donde arranca
  rate?: number; // velocidad (0.5 = cámara lenta)
  zoom?: number;
  text?: React.ReactNode; // gráfica que va encima de este plano
  next?: { t: TransitionPresentation<any>; dur: number }; // transición hacia el plano siguiente
};

// Guion del reel: cada plano dura ~1-3 s, con el corte en ritmo de 120 bpm
export const SHOTS: Shot[] = [
  { clip: "muralla-arco", dur: 80, zoom: 0.18, text: <><IntroMask /><IntroAfter /></>,
    next: { t: zoomBlur(), dur: 10 } },
  { clip: "templo-acantilado", dur: 42, trim: 90, text: <Punch text="MILENARIA" size={150} />,
    next: { t: whip({ dir: "left" }), dur: 8 } },
  { clip: "faroles", dur: 30, zoom: 0.2, text: <Punch text="TEMPLOS" size={170} />,
    next: { t: whip({ dir: "up" }), dur: 8 } },
  { clip: "templo-escalinata", dur: 30, trim: 150, text: <Punch text="TRADICIÓN" size={150} />,
    next: { t: zoomBlur(), dur: 8 } },
  { clip: "tulou", dur: 40, rate: 0.5, text: <Punch text="HISTORIA" size={160} />,
    next: { t: spin(), dur: 14 } },
  { clip: "shanghai-torres", dur: 50, text: <Rise text="Y FUTURISTA" size={130} top={800} delay={4} />,
    next: { t: whip({ dir: "left" }), dur: 8 } },
  { clip: "shanghai-noche", dur: 36, trim: 240, zoom: 0.16, text: <Punch text="SHANGHÁI" size={160} />,
    next: { t: flash(), dur: 10 } },
  { clip: "calle-noche", dur: 32, text: <Punch text="MODERNA" size={160} />,
    next: { t: zoomBlur(), dur: 8 } },
  { clip: "bund-dia", dur: 45, text: <Punch text={"14\nNOCHES"} size={190} top={640} sub="6 CIUDADES · 1 VIAJE" />,
    next: { t: whip({ dir: "right" }), dur: 8 } },
  { clip: "pagoda-lago", dur: 50, text: <Stack title="RECORRÉ" items={["BEIJING", "XI'AN", "CHENGDU"]} top={720} every={8} />,
    next: { t: whip({ dir: "left" }), dur: 8 } },
  { clip: "pueblo-canales", dur: 50, text: <Stack items={["CHONGQING", "ZHANGJIAJIE", "SHANGHÁI"]} top={720} every={8} size={88} />,
    next: { t: flash(), dur: 10 } },
  { clip: "jardin-lago", dur: 60, text: <Stack title="INCLUYE" items={["AÉREOS", "HOTELES 4★", "TRENES BALA", "+ ASISTENCIA"]} top={660} every={7} size={96} />,
    next: { t: zoomBlur(), dur: 10 } },
  { clip: "muralla-arco", dur: 101, trim: 330, zoom: 0.12, text: <Price />,
    next: { t: whip({ dir: "up" }), dur: 12 } },
  { clip: null, dur: 76, text: <Outro /> },
];

// Inicio de cada plano en la línea de tiempo (las transiciones se solapan)
const starts = SHOTS.reduce<number[]>((acc, s, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + SHOTS[i - 1].dur - (SHOTS[i - 1].next?.dur ?? 0));
  return acc;
}, []);
export const TOTAL = starts[starts.length - 1] + SHOTS[SHOTS.length - 1].dur;

// Viñeta suave para que el texto siempre se lea
const Vignette: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none",
    background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,15,30,.5) 100%)" }} />
);

// Destello de luz dorado que cruza la pantalla en momentos clave
const LightLeak: React.FC<{ at: number; len?: number }> = ({ at, len = 18 }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [at, at + len], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.quad) });
  if (p <= 0 || p >= 1) return null;
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen", opacity: Math.sin(p * Math.PI) * 0.85,
      background: `radial-gradient(ellipse 60% 40% at ${-20 + p * 140}% ${30 + p * 30}%, rgba(255,214,140,.95), rgba(196,163,86,.4) 40%, rgba(0,0,0,0) 70%)` }} />
  );
};

export const ReelChina: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#0b2233" }}>
    <TransitionSeries>
      {SHOTS.flatMap((s, i) => {
        const items = [
          <TransitionSeries.Sequence key={`s${i}`} durationInFrames={s.dur}>
            {s.clip ? <Clip src={s.clip} trim={s.trim} rate={s.rate} zoom={s.zoom} /> : s.text}
          </TransitionSeries.Sequence>,
        ];
        if (s.next) items.push(
          <TransitionSeries.Transition key={`t${i}`} presentation={s.next.t}
            timing={linearTiming({ durationInFrames: s.next.dur, easing: Easing.inOut(Easing.cubic) })} />,
        );
        return items;
      })}
    </TransitionSeries>
    <Vignette />
    {SHOTS.map((s, i) => {
      // El texto entra en la mitad de la transición de entrada y sale en la mitad de la de salida
      const inT = i === 0 ? 0 : Math.round((SHOTS[i - 1].next?.dur ?? 0) / 2);
      const outT = Math.round((s.next?.dur ?? 0) / 2);
      const from = starts[i] + inT;
      const dur = s.dur - inT - outT;
      // El cierre va dentro de la serie para que la transición lo arrastre
      if (s.clip === null) return null;
      return <Sequence key={i} from={from} durationInFrames={dur}>{s.text}</Sequence>;
    })}
    <LightLeak at={starts[5] - 12} />
    <LightLeak at={starts[12] - 10} len={20} />
  </AbsoluteFill>
);
