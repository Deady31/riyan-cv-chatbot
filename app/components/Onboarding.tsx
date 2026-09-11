"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { motion, AnimatePresence } from "motion/react";

const SEEN_KEY = "riyan-chatbot-onboarded";

const EXAMPLES = [
  "Parle-moi de ton expérience chez Shippingbo",
  "Quelle est la pire chose qui te soit arrivée ?",
  "Tes films préférés ?",
];

// Types minimaux pour la lib vanilla liquid-glass-js (pas de typings officiels).
type GlassButton = { element: HTMLElement };
type GlassButtonCtor = new (opts: {
  text: string;
  size: number;
  type: "rounded" | "circle" | "pill";
  tintOpacity?: number;
  onClick?: () => void;
}) => GlassButton;

declare global {
  interface Window {
    Button?: GlassButtonCtor;
  }
}

// Étapes strictement séquentielles : container.js déclare `class Container`,
// button.js déclare `class Button extends Container` (référence Container au
// chargement) — les charger en parallèle crée une course où button.js peut
// s'exécuter avant container.js et planter silencieusement.
type LoadStage = 0 | 1 | 2 | 3 | 4;

export default function Onboarding() {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [stage, setStage] = useState<LoadStage>(0);
  const buttonSlotRef = useRef<HTMLDivElement>(null);
  const buttonInstanceRef = useRef<GlassButton | null>(null);

  useEffect(() => {
    try {
      if (localStorage.getItem(SEEN_KEY) !== "1") setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    setExiting(true);
    try {
      localStorage.setItem(SEEN_KEY, "1");
    } catch {
      // localStorage indisponible — l'onboarding réapparaîtra la prochaine fois, sans gravité.
    }
    setTimeout(() => setVisible(false), 500);
  }

  // Monte le bouton verre liquide une fois toute la chaîne chargée dans l'ordre.
  useEffect(() => {
    if (stage < 4 || !buttonSlotRef.current || buttonInstanceRef.current) return;
    if (!window.Button) return;

    const button = new window.Button({
      text: "Découvrir le chatbot ✨",
      size: 18,
      type: "pill",
      tintOpacity: 0.28,
      onClick: dismiss,
    });
    buttonSlotRef.current.appendChild(button.element);
    buttonInstanceRef.current = button;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  if (!visible) return null;

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js"
        strategy="afterInteractive"
        onReady={() => setStage((s) => (s < 1 ? 1 : s))}
      />
      {stage >= 1 && (
        <Script
          src="/vendor/liquid-glass-js/container.js"
          strategy="afterInteractive"
          onReady={() => setStage((s) => (s < 2 ? 2 : s))}
        />
      )}
      {stage >= 2 && (
        <Script
          src="/vendor/liquid-glass-js/button.js"
          strategy="afterInteractive"
          onReady={() => setStage((s) => (s < 3 ? 3 : s))}
        />
      )}
      {/* container.js/button.js déclarent des `class` en script classique :
          ça crée des bindings de portée script, jamais des propriétés de
          `window`. Ce petit pont les capture explicitement, une fois les deux
          classes garanties chargées (course évitée par le séquencement ci-dessus). */}
      {stage >= 3 && (
        <Script
          id="liquid-glass-bridge"
          strategy="afterInteractive"
          onReady={() => setStage((s) => (s < 4 ? 4 : s))}
        >
          {"window.Button = Button; window.Container = Container;"}
        </Script>
      )}
      <link rel="stylesheet" href="/vendor/liquid-glass-js/glass.css" />

      <AnimatePresence>
        {!exiting && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6 text-center backdrop-blur-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.08, filter: "blur(12px)" }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          >
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-sm font-semibold shadow-[0_2px_10px_rgba(0,0,0,0.4)]"
            >
              RB
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              className="mt-5 text-2xl font-semibold tracking-tight sm:text-3xl"
            >
              Bienvenue sur le chatbot de Riyan
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              className="mt-3 max-w-sm text-sm leading-relaxed text-white/60"
            >
              Mon CV ne répond plus, alors je l&apos;ai remplacé par ça. Pose-moi tes
              questions sur mon parcours, mes projets, mes compétences, même les plus
              indiscrètes.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              className="mt-5 flex flex-wrap justify-center gap-2"
            >
              {EXAMPLES.map((ex) => (
                <span
                  key={ex}
                  className="rounded-full border border-white/12 bg-white/[0.05] px-3 py-1.5 text-xs text-white/60"
                >
                  {ex}
                </span>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.48, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              className="mt-8"
            >
              {stage >= 4 ? (
                <div ref={buttonSlotRef} />
              ) : (
                <button
                  onClick={dismiss}
                  className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-[0_4px_20px_rgba(10,132,255,0.4)] transition-transform hover:scale-105"
                >
                  Découvrir le chatbot ✨
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
