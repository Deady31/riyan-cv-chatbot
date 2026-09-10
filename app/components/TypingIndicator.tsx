"use client";

// Indicateur "en train d'écrire" avec effet vague sur les points, façon iMessage.
// Version allégée du pattern typing-presence : un seul émetteur (le bot), donc
// pas besoin du hook de présence multi-utilisateurs — juste `active` on/off.
import { useEffect } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform, type MotionValue } from "motion/react";

const WAVE_SECONDS = 1.25;

function Dot({ index, wave, size }: { index: number; wave: MotionValue<number>; size: number }) {
  const lift = useTransform(wave, (w) => {
    let distance = (w - index) % 3;
    if (distance < 0) distance += 3;
    if (distance > 1.5) distance -= 3;
    return Math.max(0, 1 - Math.abs(distance));
  });
  const scale = useTransform(lift, [0, 1], [0.74, 1]);
  const opacity = useTransform(lift, [0, 1], [0.35, 1]);

  return <motion.span className="block rounded-full bg-white" style={{ width: size, height: size, scale, opacity }} />;
}

export default function TypingIndicator({ size = 6 }: { size?: number }) {
  const reduced = useReducedMotion();
  const wave = useMotionValue(0);

  useEffect(() => {
    if (reduced) {
      wave.jump(0);
      return;
    }
    const controls = animate(wave, 3, {
      duration: WAVE_SECONDS,
      ease: "linear",
      repeat: Infinity,
      repeatType: "loop",
    });
    return () => controls.stop();
  }, [reduced, wave]);

  return (
    <span className="inline-flex items-center gap-1.5">
      {[0, 1, 2].map((i) =>
        reduced ? (
          <span key={i} className="block rounded-full bg-white/60" style={{ width: size, height: size }} />
        ) : (
          <Dot key={i} index={i} wave={wave} size={size} />
        )
      )}
    </span>
  );
}
