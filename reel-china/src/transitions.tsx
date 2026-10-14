// Transiciones propias: zoom con desenfoque, barrido rápido (whip), giro y destello.
import React, { useId as useReactId } from "react";
import { AbsoluteFill } from "remotion";
import type { TransitionPresentation, TransitionPresentationComponentProps } from "@remotion/transitions";

type Dir = "left" | "right" | "up" | "down";
type Props = { dir?: Dir };

const useId = (p: string) => `${p}${useReactId().replace(/[^a-zA-Z0-9]/g, "")}`;

// Desenfoque direccional con un filtro SVG (CSS blur no tiene dirección)
const MotionBlur: React.FC<{ id: string; x: number; y: number }> = ({ id, x, y }) => (
  <svg width="0" height="0" style={{ position: "absolute" }}>
    <filter id={id} x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation={`${x.toFixed(1)} ${y.toFixed(1)}`} />
    </filter>
  </svg>
);

const ZoomBlurComp: React.FC<TransitionPresentationComponentProps<Props>> = ({
  children, presentationDirection, presentationProgress: p,
}) => {
  const entering = presentationDirection === "entering";
  const scale = entering ? 1.6 - 0.6 * p : 1 + 0.9 * p;
  const blur = entering ? (1 - p) * 26 : p * 26;
  const bright = entering ? 1 + (1 - p) * 0.9 : 1 + p * 0.9;
  return (
    <AbsoluteFill style={{
      transform: `scale(${scale})`, filter: `blur(${blur}px) brightness(${bright})`,
      opacity: entering ? Math.min(1, p * 2.2) : 1,
    }}>
      {children}
    </AbsoluteFill>
  );
};

const WhipComp: React.FC<TransitionPresentationComponentProps<Props>> = ({
  children, presentationDirection, presentationProgress: p, passedProps,
}) => {
  const id = useId("whip");
  const dir = passedProps.dir ?? "left";
  const entering = presentationDirection === "entering";
  const sign = dir === "left" || dir === "up" ? -1 : 1;
  const off = entering ? (1 - p) * -sign * 100 : p * sign * 100;
  const horiz = dir === "left" || dir === "right";
  const amount = Math.sin(p * Math.PI) * 60;
  return (
    <AbsoluteFill style={{
      transform: horiz ? `translateX(${off}%)` : `translateY(${off}%)`,
      filter: `url(#${id})`,
    }}>
      <MotionBlur id={id} x={horiz ? amount : 0} y={horiz ? 0 : amount} />
      {children}
    </AbsoluteFill>
  );
};

const SpinComp: React.FC<TransitionPresentationComponentProps<Props>> = ({
  children, presentationDirection, presentationProgress: p,
}) => {
  const entering = presentationDirection === "entering";
  const rot = entering ? -(1 - p) * 70 : p * 70;
  const scale = entering ? 2.2 - 1.2 * p : 1 + 1.4 * p;
  const blur = (entering ? 1 - p : p) * 22;
  return (
    <AbsoluteFill style={{
      transform: `rotate(${rot}deg) scale(${scale})`, filter: `blur(${blur}px)`,
      opacity: entering ? Math.min(1, p * 2) : 1,
    }}>
      {children}
    </AbsoluteFill>
  );
};

const FlashComp: React.FC<TransitionPresentationComponentProps<Props>> = ({
  children, presentationDirection, presentationProgress: p,
}) => {
  const entering = presentationDirection === "entering";
  return (
    <AbsoluteFill style={{ opacity: entering ? (p > 0.5 ? 1 : 0) : 1 }}>
      {children}
      <AbsoluteFill style={{
        background: "radial-gradient(circle at 50% 45%, #fff 0%, #fff6e0 40%, rgba(196,163,86,.8) 100%)",
        opacity: Math.sin(p * Math.PI),
      }} />
    </AbsoluteFill>
  );
};

const mk = (component: React.FC<TransitionPresentationComponentProps<Props>>) =>
  (props: Props = {}): TransitionPresentation<Props> => ({ component, props });

export const zoomBlur = mk(ZoomBlurComp);
export const whip = mk(WhipComp);
export const spin = mk(SpinComp);
export const flash = mk(FlashComp);
